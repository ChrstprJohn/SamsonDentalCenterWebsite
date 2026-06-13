import { AppointmentStatusValue } from '../../repositories/exports';
import { ValidationError } from '@/shared/errors';
import { AppointmentDto } from '../../dtos/exports';

export const cancelAppointmentUseCase = (deps: {
  getAppointmentById: (appointmentId: string) => Promise<AppointmentDto>;
  updateStatus: (
    appointmentId: string,
    status: AppointmentStatusValue,
    reason?: string
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
    reason?: string
  ) => {
    const appointment = await deps.getAppointmentById(appointmentId);
    const currentStatus = appointment.status;

    const terminalStates = ['CANCELLED', 'REJECTED', 'COMPLETED', 'NO_SHOW'] as const;
    if (terminalStates.includes(currentStatus as (typeof terminalStates)[number])) {
      throw new ValidationError(
        `Cannot cancel appointment from terminal status: ${currentStatus}`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    const updatedAppointment = await deps.updateStatus(
      appointmentId,
      'CANCELLED',
      reason
    );

    // Append to Ledger
    if (currentStatus !== 'CANCELLED') {
      await deps.insertLedgerEntry(
        appointmentId,
        actorId,
        actorRole,
        currentStatus,
        'CANCELLED',
        reason
      );
    }

    const userId = appointment.patientId;
    if (userId) {
      await deps.incrementUserCredibilityMetric(userId, 'cancel_count');
    }

    return updatedAppointment;
  };
};
