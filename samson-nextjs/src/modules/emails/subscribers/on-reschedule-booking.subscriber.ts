import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { formatShortDate, formatClinicTime, calculateEndTime, formatRefId } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onRescheduleBookingSubscriber = {
  /**
   * Handles RESCHEDULE_BOOKING outbox events by sending a reschedule confirmation email.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId } = payload;
    const supabaseAdmin = await createAdminClient();

    // 1. Fetch appointment details including service & doctor
    const { data: appt, error: apptError } = await supabaseAdmin
      .from('appointments')
      .select(`
        chat_token,
        patient_id,
        confirmation_channel,
        date,
        start_time,
        end_time,
        service:services(name, duration_minutes),
        doctor:users!appointments_doctor_id_fkey(first_name, last_name)
      `)
      .eq('id', appointmentId)
      .single();

    // Prefer the appointment's CURRENT slot — resent events may replay a stale payload
    const date = appt?.date || payload.date;
    const startTime = appt?.start_time || payload.startTime;
    const endTime = appt?.end_time || payload.endTime;

    if (apptError || !appt) {
      throw new Error(`Failed to fetch appointment for reschedule: ${apptError?.message || 'Not found'}`);
    }

    const channel = (appt as any).confirmation_channel || 'EMAIL';
    if (channel === 'NONE' || channel === 'SMS') {
      return;
    }

    let recipientEmail = '';
    let patientName = '';

    // 2. Resolve name and email
    if (appt.patient_id) {
      const { data: patient } = await supabaseAdmin
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', appt.patient_id)
        .single();
      if (patient) {
        recipientEmail = patient.email;
        patientName = `${patient.first_name} ${patient.last_name}`;
      }
    } else {
      const { data: guest } = await supabaseAdmin
        .from('guest_contacts')
        .select('email, first_name, last_name')
        .eq('appointment_id', appointmentId)
        .maybeSingle();
      if (guest) {
        recipientEmail = guest.email;
        patientName = `${guest.first_name} ${guest.last_name}`;
      }
    }

    if (!recipientEmail) {
      console.warn(`No recipient email found for reschedule on appointment ${appointmentId}`);
      return;
    }

    const serviceName = (appt.service as any)?.name || 'Dental Treatment';
    const doctorName = appt.doctor
      ? `Dr. ${appt.doctor.first_name} ${appt.doctor.last_name}`
      : 'Dr. Adrian Samson';

    const duration = (appt.service as any)?.duration_minutes || payload.durationMinutes || 30;
    const dateStr = formatShortDate(date);

    let timeRangeStr = 'To be scheduled';
    if (startTime) {
      const end = endTime || calculateEndTime(startTime, duration);
      const startFmt = formatClinicTime(startTime);
      const endFmt = formatClinicTime(end);
      timeRangeStr = startFmt && endFmt ? `${startFmt} - ${endFmt}` : startFmt || 'To be scheduled';
    }
    let oldDateStr = payload.oldDate ? formatShortDate(payload.oldDate) : (payload.oldDateStr || undefined);
    let oldTimeRangeStr: string | undefined = payload.oldTimeRangeStr || undefined;
    if (!oldTimeRangeStr && payload.oldStartTime) {
      const oldStartFmt = formatClinicTime(payload.oldStartTime);
      const oldEndFmt = payload.oldEndTime ? formatClinicTime(payload.oldEndTime) : undefined;
      oldTimeRangeStr = oldStartFmt && oldEndFmt ? `${oldStartFmt} – ${oldEndFmt}` : oldStartFmt || undefined;
    }
    let oldDoctorName = payload.oldDoctorName || undefined;
    let oldServiceName = payload.oldServiceName || undefined;
    let rescheduleReason = payload.rescheduleReason || (appt as any)?.status_reason || undefined;

    // Fallback: If previous details are not directly in payload (e.g. manual resend), look up the original reschedule event payload
    if (!oldDateStr && !oldDoctorName && !oldServiceName) {
      const { data: previousEvents } = await supabaseAdmin
        .from('outbox')
        .select('payload')
        .eq('event_type', 'RESCHEDULE_BOOKING')
        .contains('payload', { appointmentId })
        .order('created_at', { ascending: false })
        .limit(5);

      const foundWithOld = (previousEvents || []).find(
        (ev: any) => ev.payload?.oldDate || ev.payload?.oldDoctorName || ev.payload?.oldServiceName || ev.payload?.oldDateStr
      );

      if (foundWithOld?.payload) {
        if (!oldDateStr && foundWithOld.payload.oldDate) {
          oldDateStr = formatShortDate(foundWithOld.payload.oldDate);
        } else if (!oldDateStr && foundWithOld.payload.oldDateStr) {
          oldDateStr = foundWithOld.payload.oldDateStr;
        }
        if (!oldTimeRangeStr && foundWithOld.payload.oldStartTime) {
          const oldStartFmt = formatClinicTime(foundWithOld.payload.oldStartTime);
          const oldEndFmt = foundWithOld.payload.oldEndTime ? formatClinicTime(foundWithOld.payload.oldEndTime) : undefined;
          oldTimeRangeStr = oldStartFmt && oldEndFmt ? `${oldStartFmt} – ${oldEndFmt}` : oldStartFmt || undefined;
        } else if (!oldTimeRangeStr && foundWithOld.payload.oldTimeRangeStr) {
          oldTimeRangeStr = foundWithOld.payload.oldTimeRangeStr;
        }
        if (!oldDoctorName && foundWithOld.payload.oldDoctorName) {
          oldDoctorName = foundWithOld.payload.oldDoctorName;
        }
        if (!oldServiceName && foundWithOld.payload.oldServiceName) {
          oldServiceName = foundWithOld.payload.oldServiceName;
        }
        if (!rescheduleReason && foundWithOld.payload.rescheduleReason) {
          rescheduleReason = foundWithOld.payload.rescheduleReason;
        }
      }
    }

    const baseUrl = getBaseUrl();
    const chatToken = appt.chat_token;
    const ref = formatRefId(appointmentId);
    const subject = `Your Appointment Has Been Rescheduled${ref ? ` [Ref: ${ref}]` : ''}`;

    await ResendService.sendTemplatedEmail(
      recipientEmail,
      subject,
      'appointment_rescheduled',
      {
        patientName: patientName || 'Valued Patient',
        serviceName,
        doctorName,
        oldDoctorName,
        oldServiceName,
        oldDateStr,
        oldTimeRangeStr,
        dateStr,
        timeRangeStr,
        appointmentId,
        rescheduleReason,
        chatToken,
        baseUrl,
      }
    );

    await supabaseAdmin.from('appointments').update({ email_reschedule_sent: true }).eq('id', appointmentId);
  },
};
