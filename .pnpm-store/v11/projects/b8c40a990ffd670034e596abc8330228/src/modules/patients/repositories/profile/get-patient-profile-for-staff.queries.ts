import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError } from '@/shared/errors';
import { PatientProfileForStaffDto, patientProfileForStaffSchema } from '../../dtos/exports';

export const getPatientProfileForStaffQuery = (supabase: SupabaseClient) => {
  return async (patientId: string): Promise<PatientProfileForStaffDto> => {
    const { data: patient, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', patientId)
      .eq('role', 'PATIENT')
      .single();

    if (error || !patient) {
      throw new NotFoundError('Patient profile not found.');
    }

    return patientProfileForStaffSchema.parse(patient);
  };
};
