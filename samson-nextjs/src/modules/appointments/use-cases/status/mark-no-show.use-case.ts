import { AppointmentStatusValue } from '../../repositories/exports';
import { ValidationError } from '@/shared/errors';
import { AppointmentDto } from '../../dtos/exports';
import { getClinicNaiveDate } from '@/shared/utils/date.util';

export const markNoShowUseCase = (deps: {
  getAppointmentById: (appointmentId: string) => Promise<AppointmentDto>;
  updateAppointmentStatusTransaction: (
    appointmentId: string,
    actorId: string | null,
    actorRole: string,
    newStatus: AppointmentStatusValue,
    reason?: string,
    expectedStatus?: AppointmentStatusValue
  ) => Promise<AppointmentDto>;
  getCurrentTime?: () => Date;
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

    const getCurrentTime = deps.getCurrentTime || (() => getClinicNaiveDate(new Date()));
    const now = getCurrentTime();
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
      reason,
      'APPROVED' // ACID guard: reject if status changed since app-layer read
    );
  };
};

