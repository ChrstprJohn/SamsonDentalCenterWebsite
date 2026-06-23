import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { PatientProfileDto, patientProfileSchema } from '../../dtos/exports';

/**
 * Queries patients matching a search query (name or email).
 * Limit results to 10. Validates outputs using patientProfileSchema.
 */
export const searchPatientsQuery = (supabase: SupabaseClient) => {
  return async (params: { query: string }): Promise<PatientProfileDto[]> => {
    const q = `%${params.query}%`;
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, middle_name, last_name, suffix, phone_number, date_of_birth, avatar_url, created_at, updated_at')
      .eq('role', 'PATIENT')
      .or(`email.ilike.${q},first_name.ilike.${q},last_name.ilike.${q}`)
      .limit(10);

    if (error) {
      throw new DomainError(`Failed to search patients: ${error.message}`, 'DATABASE_ERROR');
    }

    return (data || []).map((row) => patientProfileSchema.parse(row));
  };
};
