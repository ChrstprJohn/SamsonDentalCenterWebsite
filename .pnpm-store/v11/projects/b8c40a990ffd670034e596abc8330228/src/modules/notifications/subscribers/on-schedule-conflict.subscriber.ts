import { createAdminClient } from '@/shared/database/server';
import { createNotificationUseCase } from '../use-cases/management/create-notification.use-case';

export const onScheduleConflictSubscriber = {
  async handle(payload: Record<string, any>): Promise<void> {
    const { doctorId, doctorName, date, conflictCount } = payload;
    const supabaseAdmin = await createAdminClient();

    await createNotificationUseCase(supabaseAdmin)({
      recipientRole: 'SECRETARY',
      recipientId: null,
      type: 'DOCTOR_VACATION_CONFLICT',
      priority: 'HIGH',
      title: 'Doctor Schedule Conflict',
      message: `${doctorName || 'Doctor'} scheduled leave on ${date}. ${conflictCount || 0} appointment(s) require displacement.`,
      linkUrl: `/secretary/appointments?status=APPROVED&date=${date}&doctorId=${doctorId}`,
      entityId: doctorId,
    });
  },
};
