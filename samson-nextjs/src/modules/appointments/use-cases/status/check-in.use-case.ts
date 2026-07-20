import { AppointmentStatusValue } from '../../repositories/exports';
import { ValidationError } from '@/shared/errors';
import { AppointmentDto } from '../../dtos/exports';
import { getClinicNaiveDate } from '@/shared/utils/date.util';

export const checkInUseCase = (deps: {
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
    reason: string = 'Patient checked in'
  ) => {
    const appointment = await deps.getAppointmentById(appointmentId);

    if (appointment.status !== 'APPROVED') {
      throw new ValidationError(
        `Appointment must be APPROVED to check in. Current status: ${appointment.status}`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    const getCurrentTime = deps.getCurrentTime || (() => getClinicNaiveDate(new Date()));
    const now = getCurrentTime();

    // Parse naive HH:MM local times by combining with the appointment date at UTC+8
    const parseLocalTime = (date: string, time: string | null): Date | null => {
      if (!time) return null;
      const t = time.substring(0, 5); // normalize HH:MM:SS → HH:MM
      return new Date(`${date}T${t}:00+08:00`);
    };
    const startTime = parseLocalTime(appointment.date, appointment.startTime);
    const endTime = parseLocalTime(appointment.date, appointment.endTime);

    if (!startTime || !endTime) {
      throw new ValidationError(
        'Appointment start or end time is missing or invalid.',
        'INVALID_TIME_WINDOW'
      );
    }

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
      reason,
      'APPROVED' // ACID guard: reject if status changed since app-layer read
    );
  };
};

