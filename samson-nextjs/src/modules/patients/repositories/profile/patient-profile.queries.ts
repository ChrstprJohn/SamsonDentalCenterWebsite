import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError } from '@/shared/errors';
import { PatientProfileDto, patientProfileSchema } from '../../dtos';

export const getPatientProfileByIdQuery = (supabase: SupabaseClient) => {
  return async (patientId: string): Promise<PatientProfileDto> => {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (error || !patient) {
      throw new NotFoundError('Patient profile not found.');
    }

    return patientProfileSchema.parse(patient);
  };
};

// Deprecated class for backwards compatibility
export class PatientProfileQueries {
  constructor(private readonly supabase: SupabaseClient) {}
  async getProfileById(patientId: string): Promise<PatientProfileDto> {
    return getPatientProfileByIdQuery(this.supabase)(patientId);
  }
}

