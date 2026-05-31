import { AppointmentStatusCommands, AppointmentStatusValue } from '../../repositories';
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
    rescheduleCount?: number
  ) => Promise<AppointmentDto>;
  incrementUserCredibilityMetric: (
    userId: string,
    metric: 'cancel_count' | 'no_show_count' | 'reschedule_count'
  ) => Promise<{ success: boolean }>;
}) => {
  return async (
    appointmentId: string,
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

    const isRescheduling = status === 'RESCHEDULE_REQUESTED' || !!rescheduleMetadata;
    if (isRescheduling) {
      if (rescheduleCount >= 1) {
        throw new ValidationError(
          'Maximum reschedule limit of 1 has been reached.',
          'RESCHEDULE_LIMIT_EXCEEDED'
        );
      }
      nextRescheduleCount = 1;
    }

    const updatedAppointment = await deps.updateStatus(
      appointmentId,
      status,
      reason,
      rescheduleMetadata,
      nextRescheduleCount
    );

    const userId = appointment.patientId;
    if (userId) {
      if (status === 'CANCELLED') {
        await deps.incrementUserCredibilityMetric(userId, 'cancel_count');
      } else if (status === 'NO_SHOW') {
        await deps.incrementUserCredibilityMetric(userId, 'no_show_count');
      } else if (isRescheduling) {
        await deps.incrementUserCredibilityMetric(userId, 'reschedule_count');
      }
    }

    return updatedAppointment;
  };
};

/** @deprecated Use updateAppointmentStatusUseCase directly instead */
export class UpdateAppointmentStatusUseCase {
  constructor(private readonly statusCommands: AppointmentStatusCommands) {}

  /**
   * Enforces status machine rules, reschedule boundaries, and credibility telemetry increments.
   */
  async execute(
    appointmentId: string,
    status: AppointmentStatusValue,
    reason?: string,
    rescheduleMetadata?: {
      date: string;
      startTime: string;
      endTime: string;
      doctorId: string;
    }
  ) {
    return updateAppointmentStatusUseCase({
      getAppointmentById: (id) => this.statusCommands.getAppointmentById(id),
      updateStatus: (id, st, r, rm, rc) => this.statusCommands.updateStatus(id, st, r, rm, rc),
      incrementUserCredibilityMetric: (uid, m) => this.statusCommands.incrementUserCredibilityMetric(uid, m),
    })(appointmentId, status, reason, rescheduleMetadata);
  }
}
