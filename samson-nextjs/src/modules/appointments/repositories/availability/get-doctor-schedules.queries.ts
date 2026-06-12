import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { doctorScheduleResponseSchema } from '../../dtos';

export const getDoctorSchedulesQuery = (supabase: SupabaseClient) => {
  return async (date: string, doctorId?: string, serviceId?: string) => {
    const dayOfWeek = new Date(`${date}T00:00:00Z`).getUTCDay();
    let query = supabase
      .from('doctor_schedules')
      .select('*')
      .eq('day_of_week', dayOfWeek);

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    if (serviceId) {
      const { data: mappings } = await supabase
        .from('doctor_services')
        .select('doctor_id')
        .eq('service_id', serviceId);

      const doctorIds = mappings?.map((m: any) => m.doctor_id) || [];
      if (doctorIds.length === 0) {
        return [];
      }
      query = query.in('doctor_id', doctorIds);
    }

    const { data: schedules, error } = await query;

    if (error) {
      throw new DomainError(`Failed to fetch doctor schedules: ${error.message}`, 'DATABASE_ERROR');
    }

    return schedules?.map(s => doctorScheduleResponseSchema.parse(s)) || [];
  };
};
