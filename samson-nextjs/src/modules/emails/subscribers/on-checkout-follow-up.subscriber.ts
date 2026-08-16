import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { formatShortDate, formatRefId } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onCheckoutFollowUpSubscriber = {
  /**
   * Handles APPOINTMENT_CHECKOUT_FOLLOW_UP outbox event.
   * Sends the 48-hour "Kamusta" wellbeing check-in email to the patient
   * if confirmation channel allows EMAIL.
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
      console.warn(`[Checkout Follow-Up Email] Appointment ${appointmentId} not found: ${appError?.message}`);
      return;
    }

    const channel = (appointment as any).confirmation_channel || 'EMAIL';
    if (channel === 'NONE' || channel === 'SMS') {
      console.info(`[Checkout Follow-Up Email] Skipping email for appointment ${appointmentId}: Channel is ${channel}.`);
      return;
    }

    if (!email) {
      const gcData = Array.isArray(appointment.guest_contacts) ? appointment.guest_contacts[0] : (appointment.guest_contacts as any);
      email = gcData?.email || appointment.patient?.email;
    }

    if (!email) {
      console.warn(`[Checkout Follow-Up Email] Skipping email for appointment ${appointmentId}: No recipient email.`);
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
    const ref = formatRefId(appointmentId);
    const subject = `How are you feeling?${ref ? ` [Ref: ${ref}]` : ''}`;

    await ResendService.sendTemplatedEmail(
      email,
      subject,
      'checkout_follow_up',
      {
        patientName,
        serviceName,
        doctorName,
        dateStr: formatShortDate(appointment.date),
        appointmentId,
        baseUrl,
      }
    );

    await supabaseAdmin
      .from('appointments')
      .update({ follow_up_48h_sent: true })
      .eq('id', appointmentId);
  },
};