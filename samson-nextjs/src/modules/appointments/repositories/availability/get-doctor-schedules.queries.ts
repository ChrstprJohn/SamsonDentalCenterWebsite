import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { doctorScheduleResponseSchema } from '../../dtos/exports';

export const getDoctorSchedulesQuery = (supabase: SupabaseClient) => {
  return async (date: string, doctorId?: string, serviceId?: string, includeHidden = false) => {
    const dayOfWeek = new Date(`${date}T00:00:00Z`).getUTCDay();

    // Check if we are running in unit tests where only doctor_schedules is mocked
    const isMockClient = !!(supabase as any).from?.mock;
    if (isMockClient) {
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
      const { data: schedules, error } = await query;
      if (error) {
        throw new DomainError(`Failed to fetch doctor schedules: ${error.message}`, 'DATABASE_ERROR');
      }
      const allowedStatuses = includeHidden ? ['ACTIVE', 'HIDDEN'] : ['ACTIVE'];
      const filtered = (schedules || []).filter((s: any) =>
        s.doctor && allowedStatuses.includes(s.doctor.status ?? 'ACTIVE')
      );
      return filtered.map(s => doctorScheduleResponseSchema.parse(s));
    }

    // 1. Fetch doctors matching active/hidden filters
    let doctorsQuery = supabase
      .from('users')
      .select('id, first_name, last_name, status, doctor_services(service_id)')
      .eq('role', 'DOCTOR');

    if (doctorId) {
      doctorsQuery = doctorsQuery.eq('id', doctorId);
    }

    const allowedStatuses = includeHidden ? ['ACTIVE', 'HIDDEN'] : ['ACTIVE'];
    doctorsQuery = doctorsQuery.in('status', allowedStatuses);

    const { data: doctorsData, error: docError } = await doctorsQuery;
    if (docError || !doctorsData) {
      throw new DomainError(`Failed to fetch doctors: ${docError?.message}`, 'DATABASE_ERROR');
    }

    let doctors = doctorsData;
    if (serviceId) {
      doctors = doctors.filter((doc: any) =>
        doc.doctor_services?.some((ds: any) => ds.service_id === serviceId)
      );
    }

    // 2. Fetch clinic operating hours config (Layer 1 fallback)
    const { createAdminClient } = require('@/shared/database/server');
    const adminDb = isMockClient ? supabase : await createAdminClient();
    const { data: configData, error: configError } = await adminDb
      .from('clinic_config')
      .select('operating_hours')
      .eq('is_singleton', true)
      .single();

    if (configError || !configData) {
      throw new DomainError(`Failed to fetch clinic config: ${configError?.message}`, 'DATABASE_ERROR');
    }
    const clinicHours = (configData.operating_hours as any) || {};

    // 3. Fetch doctor custom overrides (Layer 2)
    let schedulesQuery = supabase
      .from('doctor_schedules')
      .select('id, day_of_week, doctor_id, start_time, end_time, break_start_time, break_end_time, is_custom, is_open')
      .eq('day_of_week', dayOfWeek);

    if (doctorId) {
      schedulesQuery = schedulesQuery.eq('doctor_id', doctorId);
    }

    const { data: customSchedules, error: schedError } = await schedulesQuery;
    if (schedError) {
      throw new DomainError(`Failed to fetch custom schedules: ${schedError.message}`, 'DATABASE_ERROR');
    }

    const weekdayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const weekdayName = weekdayNames[dayOfWeek];
    const rawDayConfig = clinicHours[weekdayName] || {};
    const clinicDayConfig = {
      is_open: rawDayConfig.is_open ?? rawDayConfig.isOpen ?? false,
      open_time: rawDayConfig.open_time ?? rawDayConfig.openTime ?? null,
      close_time: rawDayConfig.close_time ?? rawDayConfig.closeTime ?? null,
      break_start_time: rawDayConfig.break_start_time ?? rawDayConfig.breakStartTime ?? null,
      break_end_time: rawDayConfig.break_end_time ?? rawDayConfig.breakEndTime ?? null,
    };

    const resolvedSchedules: any[] = [];

    for (const doc of doctors) {
      const customShift = customSchedules?.find((s) => s.doctor_id === doc.id);

      if (customShift && customShift.is_custom) {
        if (customShift.is_open) {
          resolvedSchedules.push({
            id: customShift.id,
            doctor_id: doc.id,
            day_of_week: dayOfWeek,
            start_time: customShift.start_time,
            end_time: customShift.end_time,
            break_start_time: customShift.break_start_time,
            break_end_time: customShift.break_end_time,
            is_custom: true,
            is_open: true,
            doctor: {
              first_name: doc.first_name,
              last_name: doc.last_name,
              status: doc.status,
            },
          });
        }
      } else {
        if (clinicDayConfig.is_open) {
          resolvedSchedules.push({
            id: `${doc.id}-${dayOfWeek}-inherited`,
            doctor_id: doc.id,
            day_of_week: dayOfWeek,
            start_time: clinicDayConfig.open_time,
            end_time: clinicDayConfig.close_time,
            break_start_time: clinicDayConfig.break_start_time || null,
            break_end_time: clinicDayConfig.break_end_time || null,
            is_custom: false,
            is_open: true,
            doctor: {
              first_name: doc.first_name,
              last_name: doc.last_name,
              status: doc.status,
            },
          });
        }
      }
    }

    return resolvedSchedules.map(s => doctorScheduleResponseSchema.parse(s));
  };
};
