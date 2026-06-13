import { AppointmentStatusValue } from '../../repositories/exports';
import { ValidationError } from '@/shared/errors';
import { AppointmentDto } from '../../dtos/exports';

export const requestRescheduleUseCase = (deps: {
  getAppointmentById: (appointmentId: string) => Promise<AppointmentDto>;
  updateStatus: (
    appointmentId: string,
    status: AppointmentStatusValue,
    reason?: string,
    rescheduleMetadata?: {
      date: string;
      startTime: string;
      endTime: string;
      doctorId: string;
    },
    rescheduleCount?: number,
    proposedRescheduleMetadata?: {
      date: string;
      startTime: string;
      endTime: string;
      doctorId: string;
    },
    clearProposedMetadata?: boolean
  ) => Promise<AppointmentDto>;
  incrementUserCredibilityMetric: (
    userId: string,
    metric: 'cancel_count' | 'no_show_count' | 'reschedule_count'
  ) => Promise<{ success: boolean }>;
  insertLedgerEntry: (
    appointmentId: string,
    changedBy: string | null,
    actorRole: string,
    previousStatus: AppointmentStatusValue | null,
    newStatus: AppointmentStatusValue,
    reason?: string
  ) => Promise<{ success: boolean }>;
}) => {
  return async (
    appointmentId: string,
    actorId: string | null,
    actorRole: string,
    reason: string,
    proposedMetadata: {
      date: string;
      startTime: string;
      endTime: string;
      doctorId: string;
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

    const rescheduleCount = appointment.rescheduleCount ?? 0;
    if (rescheduleCount >= 1) {
      throw new ValidationError(
        'Maximum reschedule limit of 1 has been reached.',
        'RESCHEDULE_LIMIT_EXCEEDED'
      );
    }

    const updatedAppointment = await deps.updateStatus(
      appointmentId,
      'RESCHEDULE_REQUESTED',
      reason,
      undefined,
      1,
      proposedMetadata
    );

    // Append to Ledger
    if (currentStatus !== 'RESCHEDULE_REQUESTED') {
      await deps.insertLedgerEntry(
        appointmentId,
        actorId,
        actorRole,
        currentStatus,
        'RESCHEDULE_REQUESTED',
        reason
      );
    }

    const userId = appointment.patientId;
    if (userId) {
      await deps.incrementUserCredibilityMetric(userId, 'reschedule_count');
    }

    return updatedAppointment;
  };
};
