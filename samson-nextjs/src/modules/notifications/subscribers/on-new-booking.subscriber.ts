import { createAdminClient } from '@/shared/database/server';
import { createNotificationUseCase } from '../use-cases/management/create-notification.use-case';
import { formatClinicTime } from '@/shared/utils/date.util';

export const onNewBookingSubscriber = {
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId, patientName, serviceName, date, startTime } = payload;
    const supabaseAdmin = await createAdminClient();

    const formattedTime = startTime ? formatClinicTime(startTime) : '';

    await createNotificationUseCase(supabaseAdmin)({
      recipientRole: 'SECRETARY',
      recipientId: null,
      type: 'NEW_APPOINTMENT_REQUEST',
      priority: 'HIGH',
      title: 'New Booking Request',
      message: `Patient ${patientName || 'Patient'} requested ${serviceName || 'Service'} for ${date || ''} at ${formattedTime}.`,
      linkUrl: `/secretary-v2/pending`,
      entityId: appointmentId,
    });
  },
};
