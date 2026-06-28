import { AppointmentStatusValue } from '../../repositories/exports';
import { ValidationError } from '@/shared/errors';
import { AppointmentDto } from '../../dtos/exports';

export const updateAppointmentStatusUseCase = (deps: {
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
    status: AppointmentStatusValue,
    reason?: string,
    rescheduleMetadata?: {
      date: string;
      startTime: string;
      endTime: string;
      doctorId: string;
      serviceId?: string;
    }
  ) => {
    const appointment = await deps.getAppointmentById(appointmentId);
    const currentStatus = appointment.status;

    const terminalStates = ['CANCELLED', 'REJECTED', 'COMPLETED', 'NO_SHOW'] as const;
    if (terminalStates.includes(currentStatus as (typeof terminalStates)[number])) {
      throw new ValidationError(
        `Cannot transition appointment from terminal status: ${currentStatus}`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    const rescheduleCount = appointment.rescheduleCount ?? 0;
    let nextRescheduleCount: number | undefined = undefined;

    const isRescheduling = !!rescheduleMetadata;
    if (isRescheduling) {
      if (rescheduleCount >= 1) {
        throw new ValidationError(
          'Maximum reschedule limit of 1 has been reached.',
          'RESCHEDULE_LIMIT_EXCEEDED'
        );
      }
      nextRescheduleCount = 1;
    }

    let finalStatus = status;
    let finalRescheduleMetadata = rescheduleMetadata;
    let clearProposedMetadata = false;

    // Hold-and-Swap resolution logic
    if (currentStatus === 'RESCHEDULE_REQUESTED') {
      if (status === 'APPROVED') {
        // SWAP: Staff approved patient's reschedule request → move proposed → actual
        if (
          appointment.proposedDate &&
          appointment.proposedStartTime &&
          appointment.proposedEndTime &&
          appointment.proposedDoctorId
        ) {
          finalRescheduleMetadata = {
            date: appointment.proposedDate,
            startTime: appointment.proposedStartTime,
            endTime: appointment.proposedEndTime,
            doctorId: appointment.proposedDoctorId,
          };
        }
        clearProposedMetadata = true;
      } else if (status === 'REJECTED') {
        // REVERT: Staff rejected → restore original APPROVED slot, wipe proposed
        finalStatus = 'APPROVED';
        clearProposedMetadata = true;
        reason = reason || 'Reschedule request was denied. Your original slot is retained.';
      }
    }

    // Single ACID transaction — all 3 writes in one Postgres call
    return await deps.updateAppointmentStatusTransaction(
      appointmentId,
      actorId,
      actorRole,
      finalStatus,
      reason,
      finalRescheduleMetadata,
      clearProposedMetadata,
      nextRescheduleCount
    );
  };
};
