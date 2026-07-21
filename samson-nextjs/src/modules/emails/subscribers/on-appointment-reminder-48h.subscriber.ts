import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { formatShortDate, formatClinicTime } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onAppointmentReminder48hSubscriber = {
  /**
   * Handles APPOINTMENT_REMINDER_48H.
   * Sends confirmation email reminder 48 hours before appointment.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId, email } = payload;
    if (!email) return;

    const supabaseAdmin = await createAdminClient();

    // Fetch full appointment details
    const { data: appointment, error: appError } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        date,
        start_time,
        service:services(name, duration_minutes),
        doctor:users!appointments_doctor_id_fkey(first_name, last_name),
        patient:users!appointments_patient_id_fkey(first_name, last_name),
        first_name,
        last_name
      `)
      .eq('id', appointmentId)
      .single();

    if (appError || !appointment) {
      throw new Error(`Failed to fetch appointment for 48h reminder: ${appError?.message || 'Not found'}`);
    }

    const patientName = appointment.patient
      ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
      : `${appointment.first_name} ${appointment.last_name}`;

    const serviceName = (appointment.service as any)?.name || 'Dental Appointment';
    const doctorName = appointment.doctor
      ? `Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}`
      : 'Assigned Dentist';

    const dateStr = formatShortDate(appointment.date);
    const start = appointment.start_time;
    
    // Calculate end time
    const duration = (appointment.service as any)?.duration_minutes || 30;
    const [h, m] = start.split(':').map(Number);
    const dateObj = new Date();
    dateObj.setHours(h, m + duration);
    const endH = dateObj.getHours().toString().padStart(2, '0');
    const endM = dateObj.getMinutes().toString().padStart(2, '0');
    const end = `${endH}:${endM}`;
    
    const timeRangeStr = `${formatClinicTime(start)} - ${formatClinicTime(end)}`;
    const baseUrl = getBaseUrl();

    await ResendService.sendTemplatedEmail(
      email,
      'Appointment Reminder (48 Hours) – Samson Dental Center',
      'appointment_confirmed',
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
