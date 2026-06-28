import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { appointmentResponseSchema, AppointmentResponseDto } from '../../dtos/exports';

export const getExistingAppointmentsForMonthQuery = (supabase: SupabaseClient) => {
  return async (month: string, doctorId?: string): Promise<AppointmentResponseDto[]> => {
    // month is format YYYY-MM
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthInt = parseInt(monthStr, 10);
    if (isNaN(year) || isNaN(monthInt)) {
      throw new DomainError(`Invalid month format: ${month}`, 'INVALID_INPUT');
    }

    const lastDay = new Date(year, monthInt, 0).getDate();
    const startDate = `${month}-01`;
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

    let query = supabase
      .from('appointments')
      .select('id, start_time, end_time, doctor_id, status, date')
      .gte('date', startDate)
      .lte('date', endDate)
      .not('status', 'in', '("CANCELLED","REJECTED","DISPLACED")');

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const { data: appointments, error } = await query;

    if (error) {
      throw new DomainError(
        `Failed to fetch monthly appointments: ${error.message}`,
        'DATABASE_ERROR'
      );
    }

    return appointments?.map(a => appointmentResponseSchema.parse(a)) || [];
  };
};
