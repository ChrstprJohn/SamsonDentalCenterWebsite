import { SupabaseClient } from '@supabase/supabase-js';
import { DependentProfileDto, mapDependentProfiles } from '../../dtos';

export class PatientDependentsQueries {
  constructor(private readonly supabase: SupabaseClient) {}

  async getDependentsByPatientId(patientId: string): Promise<DependentProfileDto[]> {
    const { data: dependents, error } = await this.supabase
      .from('patient_dependents')
      .select('*')
      .eq('patient_id', patientId);

    if (error) {
      throw new Error(`Failed to fetch dependents: ${error.message}`);
    }

    return mapDependentProfiles((dependents || []) as Record<string, unknown>[]);
  }
}
