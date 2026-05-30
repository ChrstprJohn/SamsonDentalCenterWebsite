import { AppointmentStatusCommands, AppointmentStatusValue } from '../../repositories';
import { ValidationError } from '@/shared/errors';

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
    const appointment = await this.statusCommands.getAppointmentById(appointmentId);
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

    const updatedAppointment = await this.statusCommands.updateStatus(
      appointmentId,
      status,
      reason,
      rescheduleMetadata,
      nextRescheduleCount
    );

    const userId = appointment.patientId || (appointment as { userId?: string }).userId;
    if (userId) {
      if (status === 'CANCELLED') {
        await this.statusCommands.incrementUserCredibilityMetric(userId, 'cancel_count');
      } else if (status === 'NO_SHOW') {
        await this.statusCommands.incrementUserCredibilityMetric(userId, 'no_show_count');
      } else if (isRescheduling) {
        await this.statusCommands.incrementUserCredibilityMetric(userId, 'reschedule_count');
      }
    }

    return updatedAppointment;
  }
}
