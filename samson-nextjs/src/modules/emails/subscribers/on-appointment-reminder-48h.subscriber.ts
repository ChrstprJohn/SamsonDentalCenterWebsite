import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { formatShortDate, formatClinicTime, calculateEndTime, formatRefId } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onAppointmentReminder48hSubscriber = {
  /**
   * Handles APPOINTMENT_REMINDER_48H.
   * Sends confirmation email reminder 48 hours before appointment.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId } = payload;
    let email = payload.email;

    const supabaseAdmin = await createAdminClient();

    // Fetch full appointment details
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
      throw new Error(`Failed to fetch appointment for 48h reminder: ${appError?.message || 'Not found'}`);
    }

    const channel = (appointment as any).confirmation_channel || 'EMAIL';
    if (channel === 'NONE' || channel === 'SMS') {
      console.info(`[48H Reminder] Skipping email dispatch for appointment ${appointmentId}: Confirmation channel is ${channel}.`);
      return;
    }

    if (!email) {
      const { data: gc } = await supabaseAdmin
        .from('guest_contacts')
        .select('email')
        .eq('appointment_id', appointmentId)
        .single();
      email = gc?.email || appointment.patient?.email;
    }

    if (!email) {
      console.warn(`[48H Reminder] Skipping email dispatch for appointment ${appointmentId}: No email found.`);
      return;
    }

    const gcData = Array.isArray(appointment.guest_contacts) ? appointment.guest_contacts[0] : (appointment.guest_contacts as any);
    const patientName = gcData
      ? `${gcData.first_name} ${gcData.last_name}`
      : appointment.patient
      ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
      : 'Valued Patient';

    const serviceName = (appointment.service as any)?.name || 'Dental Appointment';
    const doctorName = appointment.doctor
      ? `Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}`
      : 'Assigned Dentist';

    const dateStr = formatShortDate(appointment.date);
    const start = appointment.start_time;
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
    const subject = `Reminder: Your Appointment is in 2 Days${ref ? ` [Ref: ${ref}]` : ''}`;

    await ResendService.sendTemplatedEmail(
      email,
      subject,
      'appointment_reminder',
      {
        reminderTitle: '48-Hour Appointment Reminder',
        patientName,
        serviceName,
        doctorName,
        dateStr,
        timeRangeStr,
        appointmentId,
        baseUrl,
      }
    );

    if (appointmentId) {
      await supabaseAdmin
        .from('appointments')
        .update({ email_reminder_48h_sent: true })
        .eq('id', appointmentId);
    }
  },
};
