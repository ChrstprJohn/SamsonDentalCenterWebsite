import { SupabaseClient } from '@supabase/supabase-js';
import { AppointmentStatusCommands } from '../repositories/appointment-status.commands';
import { DomainError, ValidationError } from '@/shared/errors';

export class UpdateAppointmentStatusUseCase {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly statusCommands: AppointmentStatusCommands
  ) {}

  /**
   * Enforces status machine rules, reschedule boundaries, and credibility telemetry increments.
   */
  async execute(
    appointmentId: string,
    status: string,
    reason?: string,
    rescheduleMetadata?: {
      date: string;
      startTime: string;
      endTime: string;
      doctorId: string;
    }
  ) {
    // 1. Fetch current appointment details
    const { data: appointment, error: fetchError } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appointment) {
      throw new ValidationError(
        `Appointment not found: ${fetchError?.message || 'Unknown error'}`,
        'NOT_FOUND'
      );
    }

    const currentStatus = appointment.status;

    // 2. Validate state machine transitions
    // Terminal states: CANCELLED, REJECTED, COMPLETED, NO_SHOW
    const terminalStates = ['CANCELLED', 'REJECTED', 'COMPLETED', 'NO_SHOW'];
    if (terminalStates.includes(currentStatus)) {
      throw new ValidationError(
        `Cannot transition appointment from terminal status: ${currentStatus}`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    let nextRescheduleCount = appointment.reschedule_count || 0;

    // 3. Handle rescheduling rules
    const isRescheduling = status === 'RESCHEDULE_REQUESTED' || !!rescheduleMetadata;
    if (isRescheduling) {
      if (appointment.reschedule_count >= 1) {
        throw new ValidationError(
          'Maximum reschedule limit of 1 has been reached.',
          'RESCHEDULE_LIMIT_EXCEEDED'
        );
      }
      nextRescheduleCount = 1;
    }

    // 4. Update the appointment status
    const updatedAppointment = await this.statusCommands.updateStatus(
      appointmentId,
      status,
      reason,
      rescheduleMetadata,
      nextRescheduleCount
    );

    // 5. Update user credibility metrics in patient_profiles
    const userId = appointment.user_id || appointment.patient_id;
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
