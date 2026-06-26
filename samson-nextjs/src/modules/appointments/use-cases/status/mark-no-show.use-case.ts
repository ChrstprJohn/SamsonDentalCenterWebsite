import { AppointmentStatusValue } from '../../repositories/exports';
import { ValidationError } from '@/shared/errors';
import { AppointmentDto } from '../../dtos/exports';

export const markNoShowUseCase = (deps: {
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
    reason: string = 'No-show marked'
  ) => {
    const appointment = await deps.getAppointmentById(appointmentId);

    if (appointment.status !== 'APPROVED') {
      throw new ValidationError(
        `Appointment must be APPROVED to mark no-show. Current status: ${appointment.status}`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    const now = new Date();
    const endTime = new Date(appointment.endTime);

    if (now <= endTime) {
      throw new ValidationError(
        'Appointment can only be marked as no-show after the scheduled slot time has passed.',
        'INVALID_TIME_WINDOW'
      );
    }

    return await deps.updateAppointmentStatusTransaction(
      appointmentId,
      actorId,
      actorRole,
      'NO_SHOW',
      reason
    );
  };
};
