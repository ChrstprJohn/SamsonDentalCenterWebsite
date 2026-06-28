import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';

export const submitTreatmentCommand = (supabase: SupabaseClient) => {
  return async (
    appointmentId: string, 
    clinicalNotes: string | null = null,
    serviceIds: string[] = []
  ): Promise<boolean> => {
    // 1. Update the appointment status and clinical notes
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'TREATMENT_RENDERED',
        clinical_notes: clinicalNotes,
      })
      .eq('id', appointmentId);

    if (updateError) {
      throw new DomainError(
        `Failed to submit treatment status: ${updateError.message}`,
        'DATABASE_ERROR'
      );
    }

    // 2. Insert the actual services rendered into the junction table
    if (serviceIds.length > 0) {
      const treatments = serviceIds.map(serviceId => ({
        appointment_id: appointmentId,
        service_id: serviceId,
      }));

      const { error: insertError } = await supabase
        .from('appointment_treatments')
        .insert(treatments);

      if (insertError) {
        throw new DomainError(
          `Failed to record treatment services: ${insertError.message}`,
          'DATABASE_ERROR'
        );
      }
    }

    return true;
  };
};
