import { AppointmentStatusValue } from '../../repositories';
import { ValidationError } from '@/shared/errors';
import { AppointmentDto } from '../../dtos';

export const updateAppointmentStatusUseCase = (deps: {
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
    proposedRescheduleMetadata?: undefined,
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
    status: AppointmentStatusValue,
    reason?: string,
    rescheduleMetadata?: {
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
        `Cannot transition appointment from terminal status: ${currentStatus}`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    const rescheduleCount = appointment.rescheduleCount ?? 0;
    let nextRescheduleCount = rescheduleCount;

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

    // Handle "Hold and Swap" resolution logic
    if (currentStatus === 'RESCHEDULE_REQUESTED') {
      if (status === 'APPROVED') {
        // SWAP: Patient requested a reschedule, Staff approved it. Move proposed -> actual.
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
        // REVERT: Patient requested a reschedule, Staff rejected it.
        // Wipe proposed data and restore the original APPROVED slot.
        finalStatus = 'APPROVED';
        clearProposedMetadata = true;
        // Provide default reason if staff didn't give one
        reason = reason || 'Reschedule request was denied. Your original slot is retained.';
      }
    }

    const updatedAppointment = await deps.updateStatus(
      appointmentId,
      finalStatus,
      reason,
      finalRescheduleMetadata,
      nextRescheduleCount,
      undefined,
      clearProposedMetadata
    );

    // Append to Ledger
    if (currentStatus !== finalStatus || clearProposedMetadata) {
      await deps.insertLedgerEntry(
        appointmentId,
        actorId,
        actorRole,
        currentStatus,
        finalStatus,
        reason
      );
    }

    const userId = appointment.patientId;
    if (userId) {
      if (status === 'CANCELLED') {
        await deps.incrementUserCredibilityMetric(userId, 'cancel_count');
      } else if (status === 'NO_SHOW') {
        await deps.incrementUserCredibilityMetric(userId, 'no_show_count');
      } else if (status === 'RESCHEDULE_REQUESTED' || isRescheduling) {
        await deps.incrementUserCredibilityMetric(userId, 'reschedule_count');
      }
    }

    return updatedAppointment;
  };
};

