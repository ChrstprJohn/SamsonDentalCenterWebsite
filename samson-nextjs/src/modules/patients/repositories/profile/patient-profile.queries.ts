import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError } from '@/shared/errors';
import { PatientProfileDto, mapPatientProfile } from '../../dtos';

export class PatientProfileQueries {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Fetches a patient profile by their ID.
   */
  async getProfileById(patientId: string): Promise<PatientProfileDto> {
    const { data: patient, error } = await this.supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (error || !patient) {
      throw new NotFoundError('Patient profile not found.');
    }

    return mapPatientProfile(patient as Record<string, unknown>);
  }
}
