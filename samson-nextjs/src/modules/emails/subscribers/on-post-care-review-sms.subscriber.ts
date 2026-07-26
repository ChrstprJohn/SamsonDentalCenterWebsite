import { createAdminClient } from '@/shared/database/server';

export const onPostCareReviewSmsSubscriber = {
  /**
   * Handles APPOINTMENT_COMPLETED_POST_CARE_SMS outbox event.
   * Logs/dispatches Thank You & Post-Care Review Request SMS to patient if confirmation channel allows SMS.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId } = payload;
    const supabaseAdmin = await createAdminClient();

    const { data: appointment, error: appError } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        patient_id,
        confirmation_channel,
        patient:users!appointments_patient_id_fkey(first_name, phone_number),
        guest_contacts!guest_contacts_appointment_id_fkey(first_name, phone_number)
      `)
      .eq('id', appointmentId)
      .single();

    if (appError || !appointment) {
      console.warn(`[Post-Care SMS] Appointment ${appointmentId} not found.`);
      return;
    }

    const channel = (appointment as any).confirmation_channel || 'EMAIL';
    if (channel === 'NONE' || channel === 'EMAIL') {
      console.info(`[Post-Care SMS] Skipping SMS for appointment ${appointmentId}: Channel is ${channel}.`);
      return;
    }

    const gcData = Array.isArray(appointment.guest_contacts) ? appointment.guest_contacts[0] : (appointment.guest_contacts as any);
    const phone = gcData?.phone_number || appointment.patient?.phone_number;
    const name = gcData?.first_name || appointment.patient?.first_name || 'Patient';

    if (!phone) {
      console.info(`[Post-Care SMS] Skipping SMS for appointment ${appointmentId}: No phone number registered.`);
      return;
    }

    const message = `Hi ${name}, thank you for visiting Samson Dental Center today! We hope your treatment went great. Leave a review: https://samsondental.com/review`;
    console.info(`[Post-Care SMS Dispatched] To: ${phone} | Message: "${message}"`);

    await supabaseAdmin
      .from('appointments')
      .update({ sms_checkout_sent: true })
      .eq('id', appointmentId);
  },
};
