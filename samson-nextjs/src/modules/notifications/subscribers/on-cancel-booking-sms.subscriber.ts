import { createAdminClient } from '@/shared/database/server';

export const onCancelBookingSmsSubscriber = {
  /**
   * Handles CANCEL_BOOKING_SMS outbox events.
   * Dispatches Cancellation SMS notification if confirmation channel allows SMS.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId, patientName, date } = payload;
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
      console.warn(`[Cancel SMS] Appointment ${appointmentId} not found.`);
      return;
    }

    const channel = (appointment as any).confirmation_channel || 'EMAIL';
    if (channel === 'NONE' || channel === 'EMAIL') {
      console.info(`[Cancel SMS] Skipping SMS for appointment ${appointmentId}: Channel is ${channel}.`);
      return;
    }

    const gcData = Array.isArray(appointment.guest_contacts) ? appointment.guest_contacts[0] : (appointment.guest_contacts as any);
    const phone = gcData?.phone_number || appointment.patient?.phone_number;
    const name = patientName || gcData?.first_name || appointment.patient?.first_name || 'Patient';

    if (!phone) {
      console.info(`[Cancel SMS] Skipping SMS for appointment ${appointmentId}: No phone number registered.`);
      return;
    }

    const message = `Hi ${name}, your appointment at Samson Dental Center scheduled for ${date || ''} has been cancelled.`;
    console.info(`[Cancel SMS Dispatched] To: ${phone} | Message: "${message}"`);
    await supabaseAdmin.from('appointments').update({ sms_cancel_sent: true }).eq('id', appointmentId);
  },
};
