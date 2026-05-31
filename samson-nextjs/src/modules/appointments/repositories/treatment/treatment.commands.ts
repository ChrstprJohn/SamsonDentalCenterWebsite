import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';

export const submitTreatmentCommand = (supabase: SupabaseClient) => {
  return async (appointmentId: string, clinicalNotes?: string | null): Promise<boolean> => {
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'TREATMENT_RENDERED',
        status_reason: clinicalNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId);

    if (error) {
      throw new DomainError(
        `Failed to submit treatment: ${error.message}`,
        'DATABASE_ERROR'
      );
    }

    return true;
  };
};

/** @deprecated Use functional commands directly instead */
export class TreatmentCommands {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Updates an appointment's status to TREATMENT_RENDERED and saves the clinical notes.
   */
  async submitTreatment(appointmentId: string, clinicalNotes?: string | null): Promise<boolean> {
    return submitTreatmentCommand(this.supabase)(appointmentId, clinicalNotes);
  }
}
