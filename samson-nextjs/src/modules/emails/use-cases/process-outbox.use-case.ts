import { emailOutboxCommands } from '../repositories/email-outbox.commands';
import { ResendService } from '@/shared/services/email/resend.service';
import { SupabaseClient } from '@supabase/supabase-js';

export const processOutboxUseCase = (supabaseAdmin: SupabaseClient) => {
  return async () => {
    const outbox = emailOutboxCommands(supabaseAdmin);
    const pendingEmails = await outbox.getPendingEmails(10); // Process batch of 10

    for (const email of pendingEmails) {
      try {
        await ResendService.sendTemplatedEmail(
          email.recipient,
          email.subject,
          email.template_name as any,
          email.payload as any
        );

        // Mark as sent in outbox
        await outbox.markAsSent(email.id);
      } catch (error: any) {
        // Mark as failed in outbox (will retry next time if < 3 retries)
        await outbox.markAsFailed(email.id, error.message || 'Unknown error sending email');
        console.error(`[Process Outbox] Failed to send email ${email.id}:`, error);
      }
    }
  };
};
