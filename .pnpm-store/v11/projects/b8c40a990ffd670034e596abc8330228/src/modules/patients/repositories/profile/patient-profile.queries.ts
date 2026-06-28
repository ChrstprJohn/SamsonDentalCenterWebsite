import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError } from '@/shared/errors';
import { PatientProfileDto, patientProfileSchema } from '../../dtos/exports';

export const getPatientProfileByIdQuery = (supabase: SupabaseClient) => {
  return async (patientId: string): Promise<PatientProfileDto> => {
    const { data: patient, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', patientId)
      .eq('role', 'PATIENT')
      .single();

    if (error || !patient) {
      throw new NotFoundError('Patient profile not found.');
    }

    return patientProfileSchema.parse(patient);
  };
};


