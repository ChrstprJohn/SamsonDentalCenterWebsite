import { SupabaseClient } from '@supabase/supabase-js';
import { CreateDependentDto, DependentProfileDto, dependentProfileSchema } from '../../dtos/exports';

export const addDependentCommand = (supabase: SupabaseClient) => {
  return async (data: CreateDependentDto): Promise<DependentProfileDto> => {
    const { data: dependent, error } = await supabase
      .from('dependents')
      .insert({
        patient_id: data.patientId,
        first_name: data.firstName,
        middle_name: data.middleName || null,
        last_name: data.lastName,
        suffix: data.suffix || null,
        date_of_birth: data.dateOfBirth,
        relationship: data.relationship,
      })
      .select('*')
      .single();

    if (error || !dependent) {
      throw new Error(`Failed to add dependent: ${error?.message || 'Unknown error'}`);
    }

    return dependentProfileSchema.parse(dependent);
  };
};



