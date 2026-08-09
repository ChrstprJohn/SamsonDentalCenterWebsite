import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { formatShortDate, formatClinicTime, calculateEndTime, formatRefId } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onCancelBookingSubscriber = {
  /**
   * Handles CANCEL_BOOKING outbox events by sending a cancellation confirmation email.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId, patientName, date } = payload;
    const supabaseAdmin = await createAdminClient();

    // 1. Fetch appointment details including service & times
    const { data: appt, error: apptError } = await supabaseAdmin
      .from('appointments')
      .select(`
        patient_id,
        confirmation_channel,
        date,
        start_time,
        end_time,
        service:services(name, duration_minutes)
      `)
      .eq('id', appointmentId)
      .single();

    if (apptError || !appt) {
      throw new Error(`Failed to fetch appointment for cancellation: ${apptError?.message || 'Not found'}`);
    }

    const channel = (appt as any).confirmation_channel || 'EMAIL';
    if (channel === 'NONE' || channel === 'SMS') {
      return;
    }

    let recipientEmail = '';
    let resolvedPatientName = patientName || '';

    // Resolve email and name
    if (appt.patient_id) {
      const { data: patient } = await supabaseAdmin
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', appt.patient_id)
        .single();
      if (patient) {
        recipientEmail = patient.email;
        if (!resolvedPatientName) {
          resolvedPatientName = `${patient.first_name} ${patient.last_name}`;
        }
      }
    } else {
      const { data: guest } = await supabaseAdmin
        .from('guest_contacts')
        .select('email, first_name, last_name')
        .eq('appointment_id', appointmentId)
        .maybeSingle();
      if (guest) {
        recipientEmail = guest.email;
        if (!resolvedPatientName) {
          resolvedPatientName = `${guest.first_name} ${guest.last_name}`;
        }
      }
    }

    if (!recipientEmail) {
      console.warn(`No recipient email found for cancellation on appointment ${appointmentId}`);
      return;
    }

    const apptDate = appt?.date || date;
    const startTime = appt?.start_time || payload.startTime;
    const endTime = appt?.end_time || payload.endTime;
    const serviceName = (appt?.service as any)?.name || payload.serviceName || 'Dental Treatment';
    const duration = (appt?.service as any)?.duration_minutes || payload.durationMinutes || 30;
    const dateStr = formatShortDate(apptDate);

    let timeRangeStr = '';
    if (startTime) {
      const end = endTime || calculateEndTime(startTime, duration);
      const startFmt = formatClinicTime(startTime);
      const endFmt = formatClinicTime(end);
      timeRangeStr = startFmt && endFmt ? `${startFmt} – ${endFmt}` : startFmt || '';
    } else if (payload.timeRangeStr) {
      timeRangeStr = payload.timeRangeStr;
    }

    const cancellationReason = payload.cancellationReason || payload.reason || 'This appointment has been cancelled as requested.';
    const baseUrl = getBaseUrl();
    const ref = formatRefId(appointmentId);
    const subject = `Your Appointment Has Been Cancelled${ref ? ` [Ref: ${ref}]` : ''}`;

    await ResendService.sendTemplatedEmail(
      recipientEmail,
      subject,
      'appointment_cancelled',
      {
        patientName: resolvedPatientName || 'Valued Patient',
        serviceName,
        dateStr,
        timeRangeStr,
        appointmentId,
        cancellationReason,
        rebookUrl: `${baseUrl}/book`,
        baseUrl,
      }
    );

    await supabaseAdmin.from('appointments').update({ email_cancel_sent: true }).eq('id', appointmentId);
  },
};
