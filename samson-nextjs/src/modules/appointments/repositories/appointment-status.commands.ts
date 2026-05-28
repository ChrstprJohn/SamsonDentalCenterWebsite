import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';

export class AppointmentStatusCommands {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Updates the status of an existing appointment with an audit trail reason.
   * If reschedule metadata is provided, atomically updates the schedule columns as well.
   */
  async updateStatus(
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
    const payload: Record<string, any> = {
      status,
      status_reason: reason ?? null,
      updated_at: new Date().toISOString(),
    };

    // If rescheduling, atomically overwrite the schedule columns
    if (rescheduleMetadata) {
      payload.date = rescheduleMetadata.date;
      payload.start_time = rescheduleMetadata.startTime;
      payload.end_time = rescheduleMetadata.endTime;
      payload.doctor_id = rescheduleMetadata.doctorId;
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

    return appointment;
  }

  /**
   * Increments a user's credibility counter (cancelCount, noShowCount, or rescheduleCount).
   * These metrics are tracked on the patient_profiles table for secretary visibility.
   */
  async incrementUserCredibilityMetric(
    userId: string,
    metric: 'cancel_count' | 'no_show_count' | 'reschedule_count'
  ) {
    // Supabase doesn't support atomic increment natively via the JS client,
    // so we use an RPC call to a database function for atomicity.
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
