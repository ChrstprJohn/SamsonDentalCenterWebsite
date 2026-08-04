import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onPostCareReviewSubscriber = {
  /**
   * Handles APPOINTMENT_COMPLETED_POST_CARE outbox event.
   * Sends Thank You & Post-Care Review Request email to patient if confirmation channel allows EMAIL.
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
        confirmation_channel,
        service:services(name),
        doctor:users!appointments_doctor_id_fkey(first_name, last_name),
        patient:users!appointments_patient_id_fkey(first_name, last_name, email),
        guest_contacts!guest_contacts_appointment_id_fkey(first_name, last_name, email)
      `)
      .eq('id', appointmentId)
      .single();

    if (appError || !appointment) {
      console.warn(`[Post-Care Email] Appointment ${appointmentId} not found: ${appError?.message}`);
      return;
    }

    const channel = (appointment as any).confirmation_channel || 'EMAIL';
    if (channel === 'NONE' || channel === 'SMS') {
      console.info(`[Post-Care Email] Skipping email for appointment ${appointmentId}: Channel is ${channel}.`);
      return;
    }

    if (!email) {
      const gcData = Array.isArray(appointment.guest_contacts) ? appointment.guest_contacts[0] : (appointment.guest_contacts as any);
      email = gcData?.email || appointment.patient?.email;
    }

    if (!email) {
      console.warn(`[Post-Care Email] Skipping email for appointment ${appointmentId}: No recipient email.`);
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

    const baseUrl = getBaseUrl();

    await ResendService.sendTemplatedEmail(
      email,
      'Thank You for Your Visit',
      'post_care',
      {
        patientName,
        serviceName,
        doctorName,
        dateStr: appointment.date,
        appointmentId,
        baseUrl,
      }
    );

    await supabaseAdmin
      .from('appointments')
      .update({ email_checkout_sent: true })
      .eq('id', appointmentId);
  },
};
