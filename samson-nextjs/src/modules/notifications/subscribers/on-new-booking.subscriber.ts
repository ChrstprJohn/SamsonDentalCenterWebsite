import { createAdminClient } from '@/shared/database/server';
import { createNotificationUseCase } from '../use-cases/management/create-notification.use-case';

export const onNewBookingSubscriber = {
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId, patientName, serviceName, date, startTime } = payload;
    const supabaseAdmin = await createAdminClient();

    const formattedTime = startTime ? new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    await createNotificationUseCase(supabaseAdmin)({
      recipientRole: 'SECRETARY',
      recipientId: null,
      type: 'NEW_APPOINTMENT_REQUEST',
      priority: 'HIGH',
      title: 'New Booking Request',
      message: `Patient ${patientName || 'Patient'} requested ${serviceName || 'Service'} for ${date || ''} at ${formattedTime}.`,
      linkUrl: `/secretary/pending?id=${appointmentId}`,
      entityId: appointmentId,
    });
  },
};
