import { SupabaseClient } from '@supabase/supabase-js';
import { DependentProfileDto, dependentProfileSchema } from '../../dtos/exports';

export const getDependentsByPatientIdQuery = (supabase: SupabaseClient) => {
  return async (patientId: string): Promise<DependentProfileDto[]> => {
    const { data: dependents, error } = await supabase
      .from('dependents')
      .select('*')
      .eq('patient_id', patientId);

    if (error) {
      throw new Error(`Failed to fetch dependents: ${error.message}`);
    }

    return (dependents || []).map((dep) => dependentProfileSchema.parse(dep));
  };
};



