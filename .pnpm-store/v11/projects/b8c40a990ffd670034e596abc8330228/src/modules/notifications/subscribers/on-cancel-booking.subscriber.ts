import { createAdminClient } from '@/shared/database/server';
import { createNotificationUseCase } from '../use-cases/management/create-notification.use-case';

export const onCancelBookingSubscriber = {
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId, patientName, serviceName, date } = payload;
    const supabaseAdmin = await createAdminClient();

    await createNotificationUseCase(supabaseAdmin)({
      recipientRole: 'SECRETARY',
      recipientId: null,
      type: 'PATIENT_CANCEL_ALERT',
      priority: 'HIGH',
      title: 'Appointment Cancelled',
      message: `Patient ${patientName || 'Patient'} cancelled their ${serviceName || 'Service'} appointment scheduled for ${date || ''}.`,
      linkUrl: `/secretary/appointments?status=CANCELLED&id=${appointmentId}`,
      entityId: appointmentId,
    });
  },
};
