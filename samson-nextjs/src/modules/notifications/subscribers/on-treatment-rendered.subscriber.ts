import { createAdminClient } from '@/shared/database/server';
import { createNotificationUseCase } from '../use-cases/management/create-notification.use-case';

export const onTreatmentRenderedSubscriber = {
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId, patientName, doctorName } = payload;
    const supabaseAdmin = await createAdminClient();

    await createNotificationUseCase(supabaseAdmin)({
      recipientRole: 'SECRETARY',
      recipientId: null,
      type: 'TREATMENT_RENDERED',
      priority: 'HIGH',
      title: 'Ready for Checkout',
      message: `${doctorName || 'Doctor'} finished treatment for ${patientName || 'Patient'}. Invoice draft is ready.`,
      linkUrl: `/secretary/check-in?openCheckout=${appointmentId}`,
      entityId: appointmentId,
    });
  },
};
