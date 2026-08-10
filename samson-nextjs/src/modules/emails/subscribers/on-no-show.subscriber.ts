import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { formatShortDate, formatClinicTime, calculateEndTime, formatRefId } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onNoShowSubscriber = {
  /**
   * Handles APPOINTMENT_NO_SHOW outbox event.
   * Sends Missed Appointment (No-show) email to patient if confirmation channel allows EMAIL.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId } = payload;
    let email = payload.email;

    const supabaseAdmin = await createAdminClient();

    const { data: appointment, error: appError } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        patient_id,
        date,
        start_time,
        end_time,
        confirmation_channel,
        service:services(name, duration_minutes),
        doctor:users!appointments_doctor_id_fkey(first_name, last_name),
        patient:users!appointments_patient_id_fkey(first_name, last_name, email),
        guest_contacts!guest_contacts_appointment_id_fkey(first_name, last_name, email)
      `)
      .eq('id', appointmentId)
      .single();

    if (appError || !appointment) {
      console.warn(`[No-Show Email] Appointment ${appointmentId} not found: ${appError?.message}`);
      return;
    }

    const channel = (appointment as any).confirmation_channel || 'EMAIL';
    if (channel === 'NONE' || channel === 'SMS') {
      console.info(`[No-Show Email] Skipping email for appointment ${appointmentId}: Channel is ${channel}.`);
      return;
    }

    if (!email) {
      const gcData = Array.isArray(appointment.guest_contacts) ? appointment.guest_contacts[0] : (appointment.guest_contacts as any);
      email = gcData?.email || appointment.patient?.email;
    }

    if (!email) {
      console.warn(`[No-Show Email] Skipping email for appointment ${appointmentId}: No recipient email.`);
      return;
    }

    const gcData = Array.isArray(appointment.guest_contacts) ? appointment.guest_contacts[0] : (appointment.guest_contacts as any);
    const patientName = gcData
      ? `${gcData.first_name} ${gcData.last_name}`
      : appointment.patient
      ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
      : 'Valued Patient';

    const serviceName = (appointment.service as any)?.name || 'Dental Procedure';
    const doctorName = appointment.doctor
      ? `Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}`
      : 'your Samson Dental Team';

    const dateStr = formatShortDate(appointment.date);
    const start = (appointment as any).start_time;
    const duration = (appointment.service as any)?.duration_minutes || 30;
    let timeRangeStr = 'To be scheduled';
    if (start) {
      const end = (appointment as any).end_time || calculateEndTime(start, duration);
      const startFmt = formatClinicTime(start);
      const endFmt = formatClinicTime(end);
      timeRangeStr = startFmt && endFmt ? `${startFmt} - ${endFmt}` : startFmt || 'To be scheduled';
    }

    const baseUrl = getBaseUrl();
    const ref = formatRefId(appointmentId);
    const subject = `You missed your appointment with Samson Dental Center${ref ? ` [Ref: ${ref}]` : ''}`;

    await ResendService.sendTemplatedEmail(
      email,
      subject,
      'appointment_no_show',
      {
        patientName,
        serviceName,
        doctorName,
        dateStr,
        timeRangeStr,
        appointmentId,
        baseUrl,
      }
    );
  },
};
