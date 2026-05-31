import { SupabaseClient } from '@supabase/supabase-js';
import { CreateDependentDto, DependentProfileDto, dependentProfileSchema } from '../../dtos';

export const addDependentCommand = (supabase: SupabaseClient) => {
  return async (data: CreateDependentDto): Promise<DependentProfileDto> => {
    const { data: dependent, error } = await supabase
      .from('dependents')
      .insert({
        patient_id: data.patientId,
        first_name: data.firstName,
        last_name: data.lastName,
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

// Deprecated class for backwards compatibility
export class PatientDependentsCommands {
  constructor(private readonly supabase: SupabaseClient) {}
  async addDependent(data: CreateDependentDto): Promise<DependentProfileDto> {
    return addDependentCommand(this.supabase)(data);
  }
}

