import { AppointmentStatusValue } from '../../repositories/exports';
import { ValidationError } from '@/shared/errors';
import { AppointmentDto } from '../../dtos/exports';

export const undoCheckInUseCase = (deps: {
  getAppointmentById: (appointmentId: string) => Promise<AppointmentDto>;
  updateAppointmentStatusTransaction: (
    appointmentId: string,
    actorId: string | null,
    actorRole: string,
    newStatus: AppointmentStatusValue,
    reason?: string
  ) => Promise<AppointmentDto>;
}) => {
  return async (
    appointmentId: string,
    actorId: string | null,
    actorRole: string,
    reason: string = 'Undo check-in (mistake)'
  ) => {
    const appointment = await deps.getAppointmentById(appointmentId);

    if (appointment.status !== 'CHECKED_IN') {
      throw new ValidationError(
        `Appointment must be CHECKED_IN to undo check-in. Current status: ${appointment.status}`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    return await deps.updateAppointmentStatusTransaction(
      appointmentId,
      actorId,
      actorRole,
      'APPROVED',
      reason
    );
  };
};
