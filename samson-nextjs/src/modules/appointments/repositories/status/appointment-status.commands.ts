import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { AppointmentDto, mapAppointmentRecord } from '../../dtos';

export type AppointmentStatusValue = AppointmentDto['status'];

export class AppointmentStatusCommands {
  constructor(private readonly supabase: SupabaseClient) {}

  async getAppointmentById(appointmentId: string): Promise<AppointmentDto> {
    const { data: appointment, error } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      throw new DomainError(
        `Failed to fetch appointment: ${error?.message || 'Unknown database error'}`,
        'DATABASE_ERROR'
      );
    }

    return mapAppointmentRecord(appointment as Record<string, unknown>);
  }

  /**
   * Updates the status of an existing appointment with an audit trail reason.
   * If reschedule metadata is provided, atomically updates the schedule columns as well.
   */
  async updateStatus(
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
  ): Promise<AppointmentDto> {
    const payload: Record<string, string | number | null> = {
      status,
      status_reason: reason ?? null,
      updated_at: new Date().toISOString(),
    };

    if (rescheduleMetadata) {
      payload.date = rescheduleMetadata.date;
      payload.start_time = rescheduleMetadata.startTime;
      payload.end_time = rescheduleMetadata.endTime;
      payload.doctor_id = rescheduleMetadata.doctorId;
    }

    if (rescheduleCount !== undefined) {
      payload.reschedule_count = rescheduleCount;
    }

    const { data: appointment, error } = await this.supabase
      .from('appointments')
      .update(payload)
      .eq('id', appointmentId)
      .select('*')
      .single();

    if (error || !appointment) {
      throw new DomainError(
        `Failed to update appointment status: ${error?.message || 'Unknown database error'}`,
        'DATABASE_ERROR'
      );
    }

    return mapAppointmentRecord(appointment as Record<string, unknown>);
  }

  /**
   * Increments a user's credibility counter (cancelCount, noShowCount, or rescheduleCount).
   * These metrics are tracked on the patient_profiles table for secretary visibility.
   */
  async incrementUserCredibilityMetric(
    userId: string,
    metric: 'cancel_count' | 'no_show_count' | 'reschedule_count'
  ) {
    const { error } = await this.supabase.rpc('increment_credibility_metric', {
      p_user_id: userId,
      p_metric: metric,
    });

    if (error) {
      throw new DomainError(
        `Failed to increment credibility metric '${metric}': ${error.message}`,
        'DATABASE_ERROR'
      );
    }

    return { success: true };
  }
}
