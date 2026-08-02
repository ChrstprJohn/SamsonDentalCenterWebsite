import { AppointmentStatusValue } from '../../repositories/exports';
import { ValidationError } from '@/shared/errors';
import { AppointmentDto } from '../../dtos/exports';

export const resolveNoShowUseCase = (deps: {
  getAppointmentById: (appointmentId: string) => Promise<AppointmentDto>;
  updateAppointmentStatusTransaction: (
    appointmentId: string,
    actorId: string | null,
    actorRole: string,
    newStatus: AppointmentStatusValue,
    reason?: string,
    rescheduleMetadata?: {
      date: string;
      startTime: string;
      endTime: string;
      doctorId: string;
      serviceId?: string;
    },
    clearProposedMetadata?: boolean,
    rescheduleCount?: number
  ) => Promise<AppointmentDto>;
}) => {
  return async (
    appointmentId: string,
    actorId: string | null,
    actorRole: string,
    resolution: 'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'RESCHEDULE' | 'CHECKED_IN',
    reason: string,
    rescheduleMetadata?: {
      date: string;
      startTime: string;
      endTime: string;
      doctorId: string;
    }
  ) => {
    const appointment = await deps.getAppointmentById(appointmentId);

    if (resolution === 'CHECKED_IN') {
      return await deps.updateAppointmentStatusTransaction(
        appointmentId,
        actorId,
        actorRole,
        'CHECKED_IN',
        `Resolved No-Show (Late Check-in): ${reason}`
      );
    }

    if (resolution === 'COMPLETED') {
      return await deps.updateAppointmentStatusTransaction(
        appointmentId,
        actorId,
        actorRole,
        'COMPLETED',
        `Resolved No-Show (Completed): ${reason}`
      );
    }

    if (resolution === 'CONFIRMED_NO_SHOW') {
      return await deps.updateAppointmentStatusTransaction(
        appointmentId,
        actorId,
        actorRole,
        'NO_SHOW',
        `Confirmed No-Show: ${reason}`
      );
    }

    if (resolution === 'RESCHEDULE') {
      if (!rescheduleMetadata) {
        throw new ValidationError(
          'Reschedule metadata required when resolving no-show via reschedule',
          'MISSING_RESCHEDULE_METADATA'
        );
      }
      return await deps.updateAppointmentStatusTransaction(
        appointmentId,
        actorId,
        actorRole,
        'APPROVED',
        `Resolved No-Show (Rescheduled): ${reason}`,
        rescheduleMetadata
      );
    }

    throw new ValidationError('Invalid resolution type', 'INVALID_RESOLUTION');
  };
};
