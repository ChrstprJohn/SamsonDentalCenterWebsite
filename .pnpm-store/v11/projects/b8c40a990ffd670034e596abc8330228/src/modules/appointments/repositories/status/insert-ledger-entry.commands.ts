import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { AppointmentStatusValue } from './update-status.commands';

export const insertLedgerEntryCommand = (supabase: SupabaseClient) => {
  return async (
    appointmentId: string,
    changedBy: string | null,
    actorRole: string,
    previousStatus: AppointmentStatusValue | null,
    newStatus: AppointmentStatusValue,
    reason?: string
  ): Promise<{ success: boolean }> => {
    const { error } = await supabase.from('appointment_status_history').insert({
      appointment_id: appointmentId,
      changed_by: changedBy,
      actor_role: actorRole,
      previous_status: previousStatus,
      new_status: newStatus,
      reason: reason ?? null,
    });

    if (error) {
      throw new DomainError(
        `Failed to insert appointment status ledger entry: ${error.message}`,
        'DATABASE_ERROR'
      );
    }

    return { success: true };
  };
};
