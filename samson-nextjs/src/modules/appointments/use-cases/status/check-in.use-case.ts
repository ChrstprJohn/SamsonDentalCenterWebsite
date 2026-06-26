import { AppointmentStatusValue } from '../../repositories/exports';
import { ValidationError } from '@/shared/errors';
import { AppointmentDto } from '../../dtos/exports';

export const checkInUseCase = (deps: {
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
    reason: string = 'Patient checked in'
  ) => {
    const appointment = await deps.getAppointmentById(appointmentId);

    if (appointment.status !== 'APPROVED') {
      throw new ValidationError(
        `Appointment must be APPROVED to check in. Current status: ${appointment.status}`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);
    const windowStart = new Date(startTime.getTime() - 30 * 60 * 1000);

    if (now < windowStart || now > endTime) {
      throw new ValidationError(
        'Check-in is only allowed starting 30 minutes before the scheduled time up to the end of the appointment.',
        'INVALID_TIME_WINDOW'
      );
    }

    return await deps.updateAppointmentStatusTransaction(
      appointmentId,
      actorId,
      actorRole,
      'CHECKED_IN',
      reason
    );
  };
};
