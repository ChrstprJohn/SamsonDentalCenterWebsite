import { createAdminClient } from '@/shared/database/server';
import { createNotificationUseCase } from '../use-cases/management/create-notification.use-case';

export const onEmailFailedSubscriber = {
  async handle(payload: Record<string, any>): Promise<void> {
    const { emailLogId, recipientEmail, error } = payload;
    const supabaseAdmin = await createAdminClient();

    await createNotificationUseCase(supabaseAdmin)({
      recipientRole: 'SECRETARY',
      recipientId: null,
      type: 'FAILED_EMAIL_ALERT',
      priority: 'HIGH',
      title: 'Email Delivery Failed',
      message: `Failed sending email receipt to ${recipientEmail || 'recipient'}. Error: ${error || 'Unknown error'}`,
      linkUrl: `/secretary/emails?status=Failed&id=${emailLogId}`,
      entityId: emailLogId,
    });
  },
};
