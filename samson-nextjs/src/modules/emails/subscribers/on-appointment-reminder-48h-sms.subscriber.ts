import { createAdminClient } from '@/shared/database/server';
import { SmsService } from '@/shared/services/sms/sms.service';
import { formatShortDate, formatClinicTime } from '@/shared/utils/date.util';

export const onAppointmentReminder48hSmsSubscriber = {
  /**
   * Handles APPOINTMENT_REMINDER_48H_SMS.
   * Sends SMS reminder 48 hours before appointment.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId, phoneNumber: payloadPhone } = payload;
    const supabaseAdmin = await createAdminClient();

    const { data: appointment, error: appError } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        date,
        start_time,
        confirmation_channel,
        patient:users!appointments_patient_id_fkey(phone_number),
        guest_contacts!guest_contacts_appointment_id_fkey(phone_number)
      `)
      .eq('id', appointmentId)
      .single();

    if (appError || !appointment) {
      console.error(`[48H SMS Reminder] Failed to fetch appointment: ${appError?.message || 'Not found'}`);
      return;
    }

    const channel = (appointment as any).confirmation_channel || 'EMAIL';
    if (channel === 'NONE' || channel === 'EMAIL') {
      console.info(`[48H SMS Reminder] Skipping SMS dispatch for appointment ${appointmentId}: Confirmation channel is ${channel}.`);
      return;
    }

    const gcData = Array.isArray(appointment.guest_contacts) ? appointment.guest_contacts[0] : (appointment.guest_contacts as any);
    const phoneNumber = payloadPhone || gcData?.phone_number || (appointment.patient as any)?.phone_number;

    if (!phoneNumber) {
      console.warn(`[48H SMS Reminder] Skipping SMS dispatch for appointment ${appointmentId}: No phone number found.`);
      return;
    }

    const dateStr = formatShortDate(appointment.date);
    const timeStr = formatClinicTime(appointment.start_time);
    const message = `Samson Dental: Reminder - You have an appt in 2 days on ${dateStr} at ${timeStr}. Reply or call 0917-123-4567 to modify.`;

    await SmsService.sendSms(phoneNumber, message);

    await supabaseAdmin
      .from('appointments')
      .update({ sms_reminder_48h_sent: true })
      .eq('id', appointmentId);
  },
};
