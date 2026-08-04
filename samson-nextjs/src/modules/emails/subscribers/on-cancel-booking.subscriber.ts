import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { formatShortDate } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onCancelBookingSubscriber = {
  /**
   * Handles CANCEL_BOOKING outbox events by sending a cancellation confirmation email.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId, patientName, date } = payload;
    const supabaseAdmin = await createAdminClient();

    // 1. Fetch appointment details to resolve email
    const { data: appt, error: apptError } = await supabaseAdmin
      .from('appointments')
      .select('patient_id, confirmation_channel')
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

    // Resolve email
    if (appt.patient_id) {
      const { data: patient } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', appt.patient_id)
        .single();
      if (patient) {
        recipientEmail = patient.email;
      }
    } else {
      const { data: guest } = await supabaseAdmin
        .from('guest_contacts')
        .select('email')
        .eq('appointment_id', appointmentId)
        .maybeSingle();
      if (guest) {
        recipientEmail = guest.email;
      }
    }

    if (!recipientEmail) {
      console.warn(`No recipient email found for cancellation on appointment ${appointmentId}`);
      return;
    }

    const dateStr = formatShortDate(date);
    const cancellationReason = payload.cancellationReason || payload.reason || 'This appointment has been cancelled as requested.';
    const baseUrl = getBaseUrl();

    await ResendService.sendTemplatedEmail(
      recipientEmail,
      'Your Appointment Has Been Cancelled',
      'appointment_cancelled',
      {
        patientName: patientName || 'Valued Patient',
        dateStr,
        cancellationReason,
        baseUrl,
      }
    );

    await supabaseAdmin.from('appointments').update({ email_cancel_sent: true }).eq('id', appointmentId);
  },
};
