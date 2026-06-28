import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { doctorScheduleResponseSchema } from '../../dtos/exports';

export const getDoctorSchedulesQuery = (supabase: SupabaseClient) => {
  return async (date: string, doctorId?: string, serviceId?: string, includeHidden = false) => {
    const dayOfWeek = new Date(`${date}T00:00:00Z`).getUTCDay();

    let selectFields = 'id, day_of_week, doctor_id, start_time, end_time, break_start_time, break_end_time, doctor:doctor_id!inner(first_name, last_name, status)';

    if (serviceId) {
      selectFields = 'id, day_of_week, doctor_id, start_time, end_time, break_start_time, break_end_time, doctor:doctor_id!inner(first_name, last_name, status, doctor_services!inner(service_id))';
    }

    let query = supabase
      .from('doctor_schedules')
      .select(selectFields)
      .eq('day_of_week', dayOfWeek);

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    if (serviceId) {
      query = query.eq('doctor.doctor_services.service_id', serviceId);
    }

    const { data: schedules, error } = await query;

    if (error) {
      throw new DomainError(`Failed to fetch doctor schedules: ${error.message}`, 'DATABASE_ERROR');
    }

    // ponytail: filter status in-code — PostgREST can't filter on embedded resource cols reliably
    // null status = ACTIVE (pre-migration fallback)
    // includeHidden=true (secretary internal booking): ACTIVE + HIDDEN
    // includeHidden=false (public booking): ACTIVE only
    const allowedStatuses = includeHidden ? ['ACTIVE', 'HIDDEN'] : ['ACTIVE'];
    const filtered = (schedules || []).filter((s: any) =>
      s.doctor && allowedStatuses.includes(s.doctor.status ?? 'ACTIVE')
    );

    return filtered.map(s => doctorScheduleResponseSchema.parse(s));
  };
};
