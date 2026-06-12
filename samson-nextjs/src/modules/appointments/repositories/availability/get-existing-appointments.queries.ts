import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { appointmentResponseSchema } from '../../dtos';

export const getExistingAppointmentsQuery = (supabase: SupabaseClient) => {
  return async (date: string, doctorId?: string) => {
    let query = supabase
      .from('appointments')
      .select('id, start_time, end_time, doctor_id, status, date')
      .eq('date', date)
      .not('status', 'in', '("CANCELLED","REJECTED","DISPLACED")');

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const { data: appointments, error } = await query;

    if (error) {
      throw new DomainError(
        `Failed to fetch existing appointments: ${error.message}`,
        'DATABASE_ERROR'
      );
    }

    return appointments?.map(a => appointmentResponseSchema.parse(a)) || [];
  };
};
