import { SupabaseClient } from '@supabase/supabase-js';
import { CreateDependentDto, DependentProfileDto, mapDependentProfile } from '../../dtos';

export class PatientDependentsCommands {
  constructor(private readonly supabase: SupabaseClient) {}

  async addDependent(data: CreateDependentDto): Promise<DependentProfileDto> {
    const { data: dependent, error } = await this.supabase
      .from('patient_dependents')
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

    return mapDependentProfile(dependent as Record<string, unknown>);
  }
}
