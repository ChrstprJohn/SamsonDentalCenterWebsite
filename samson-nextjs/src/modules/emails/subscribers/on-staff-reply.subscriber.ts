import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { formatRefId } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onStaffReplySubscriber = {
  /**
   * Handles STAFF_REPLIED_TO_CHAT outbox events.
   * Sends a notification email with secure redirection link.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId } = payload;
    const supabaseAdmin = await createAdminClient();

    // 1. Fetch appointment details
    const { data: appt, error: apptError } = await supabaseAdmin
      .from('appointments')
      .select('chat_token, patient_id')
      .eq('id', appointmentId)
      .single();

    if (apptError || !appt) {
      throw new Error(`Failed to fetch appointment: ${apptError?.message || 'Not found'}`);
    }

    let recipientEmail = '';
    let patientName = '';

    // 2. Resolve patient or guest contact email and name
    if (appt.patient_id) {
      const { data: patient } = await supabaseAdmin
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', appt.patient_id)
        .single();
      if (patient) {
        recipientEmail = patient.email;
        patientName = `${patient.first_name} ${patient.last_name}`;
      }
    } else {
      const { data: guest } = await supabaseAdmin
        .from('guest_contacts')
        .select('email, first_name, last_name')
        .eq('appointment_id', appointmentId)
        .maybeSingle();
      if (guest) {
        recipientEmail = guest.email;
        patientName = `${guest.first_name} ${guest.last_name}`;
      }
    }

    if (!recipientEmail) {
      console.warn(`No recipient email found for staff reply notification on appointment ${appointmentId}`);
      return;
    }

    const baseUrl = getBaseUrl();
    const chatToken = appt.chat_token;
    const ref = formatRefId(appointmentId);
    const subject = `You Have a New Message${ref ? ` [Ref: ${ref}]` : ''}`;

    await ResendService.sendTemplatedEmail(
      recipientEmail,
      subject,
      'staff_reply' as any,
      {
        patientName,
        chatToken,
        baseUrl,
      } as any
    );
  },
};
