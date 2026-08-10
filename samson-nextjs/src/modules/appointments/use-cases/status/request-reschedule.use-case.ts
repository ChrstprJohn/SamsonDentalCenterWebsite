import { AppointmentStatusValue } from '../../repositories/exports';
import { ValidationError } from '@/shared/errors';
import { AppointmentDto } from '../../dtos/exports';

export const requestRescheduleUseCase = (deps: {
  getAppointmentById: (appointmentId: string) => Promise<AppointmentDto>;
  requestRescheduleTransaction: (
    appointmentId: string,
    actorId: string | null,
    actorRole: string,
    reason: string,
    proposedMetadata: {
      date: string;
      startTime?: string;
      endTime?: string;
      doctorId: string | null;
      preferredStartTime?: string;
    }
  ) => Promise<AppointmentDto>;
}) => {
  return async (
    appointmentId: string,
    actorId: string | null,
    actorRole: string,
    reason: string,
    proposedMetadata: {
      date: string;
      startTime?: string;
      endTime?: string;
      doctorId: string | null;
      preferredStartTime?: string;
    }
  ) => {
    const appointment = await deps.getAppointmentById(appointmentId);
    const currentStatus = appointment.status;

    const terminalStates = ['CANCELLED', 'REJECTED', 'COMPLETED', 'NO_SHOW'] as const;
    if (terminalStates.includes(currentStatus as (typeof terminalStates)[number])) {
      throw new ValidationError(
        `Cannot reschedule appointment from terminal status: ${currentStatus}`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    // Single ACID transaction — status update + ledger + credibility metric
    return await deps.requestRescheduleTransaction(
      appointmentId,
      actorId,
      actorRole,
      reason,
      proposedMetadata
    );
  };
};
