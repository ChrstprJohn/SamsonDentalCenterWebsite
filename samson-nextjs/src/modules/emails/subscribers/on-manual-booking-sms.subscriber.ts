import { SmsService } from '@/shared/services/sms/sms.service';
import { formatShortDate, formatClinicTime } from '@/shared/utils/date.util';
import { createAdminClient } from '@/shared/database/server';

export const onManualBookingSmsSubscriber = {
  /**
   * Handles APPOINTMENT_MANUALLY_BOOKED_SMS outbox events.
   * Sends a 160-character plain text SMS confirmation to patients.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const { phoneNumber, date, startTime, appointmentId } = payload;
    if (!phoneNumber) return;

    const dateStr = formatShortDate(date);
    const timeStr = formatClinicTime(startTime);

    // Premium 160-character confirmation text
    const message = `Samson Dental: Appt confirmed ${dateStr}, ${timeStr}. To reschedule or ask questions, call 0917-123-4567.`;

    await SmsService.sendSms(phoneNumber, message);

    if (appointmentId) {
      const supabaseAdmin = await createAdminClient();
      const { error: updateError } = await supabaseAdmin
        .from('appointments')
        .update({ sms_confirmation_sent: true })
        .eq('id', appointmentId);

      if (updateError) {
        throw new Error(`Failed to mark SMS confirmation sent: ${updateError.message}`);
      }
    }
  },
};
