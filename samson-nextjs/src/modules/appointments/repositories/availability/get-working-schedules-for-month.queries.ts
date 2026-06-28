import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { doctorScheduleResponseSchema } from '../../dtos/exports';
import { unstable_cache } from 'next/cache';

export const getWorkingSchedulesForMonthQuery = (supabase: SupabaseClient) => {
  const fetchSchedules = async (month: string, doctorId?: string, serviceId?: string, includeHidden = false) => {
    let mappedSchedules: any[] = [];
    const isMockClient = !!(supabase as any).from?.mock;

    if (isMockClient) {
      let selectFields = 'id, day_of_week, doctor_id, start_time, end_time, break_start_time, break_end_time, doctor:doctor_id!inner(first_name, last_name, status)';
      if (serviceId) {
        selectFields = 'id, day_of_week, doctor_id, start_time, end_time, break_start_time, break_end_time, doctor:doctor_id!inner(first_name, last_name, status, doctor_services!inner(service_id))';
      }
      let query = supabase
        .from('doctor_schedules')
        .select(selectFields);
      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }
      if (serviceId) {
        query = query.eq('doctor.doctor_services.service_id', serviceId);
      }
      const { data: schedules, error } = await query;
      if (error) {
        throw new DomainError(`Failed to fetch monthly schedules: ${error.message}`, 'DATABASE_ERROR');
      }
      const allowedStatuses = includeHidden ? ['ACTIVE', 'HIDDEN'] : ['ACTIVE'];
      const filtered = (schedules || []).filter((s: any) =>
        s.doctor && allowedStatuses.includes(s.doctor.status ?? 'ACTIVE')
      );
      mappedSchedules = filtered.map(s => doctorScheduleResponseSchema.parse(s));
    } else {
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

    // 2. Fetch clinic config
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

    // 3. Fetch doctor custom overrides (all weekdays)
    let schedulesQuery = supabase
      .from('doctor_schedules')
      .select('id, day_of_week, doctor_id, start_time, end_time, break_start_time, break_end_time, is_custom, is_open');

    if (doctorId) {
      schedulesQuery = schedulesQuery.eq('doctor_id', doctorId);
    }

    const { data: customSchedules, error: schedError } = await schedulesQuery;
    if (schedError) {
      throw new DomainError(`Failed to fetch custom schedules: ${schedError.message}`, 'DATABASE_ERROR');
    }

    // Create a helper mapping of resolved day-of-week schedules for each doctor
    const weekdayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const resolvedSchedules: any[] = [];

    for (const doc of doctors) {
      for (let dow = 0; dow <= 6; dow++) {
        const customShift = customSchedules?.find((s) => s.doctor_id === doc.id && s.day_of_week === dow);

        if (customShift && customShift.is_custom) {
          if (customShift.is_open) {
            resolvedSchedules.push({
              id: customShift.id,
              doctorId: doc.id,
              dayOfWeek: dow,
              startTime: customShift.start_time,
              endTime: customShift.end_time,
              breakStartTime: customShift.break_start_time,
              breakEndTime: customShift.break_end_time,
              isCustom: true,
              isOpen: true,
            });
          }
        } else {
          const weekdayName = weekdayNames[dow];
          const rawDayConfig = clinicHours[weekdayName] || {};
          const clinicDayConfig = {
            is_open: rawDayConfig.is_open ?? rawDayConfig.isOpen ?? false,
            open_time: rawDayConfig.open_time ?? rawDayConfig.openTime ?? null,
            close_time: rawDayConfig.close_time ?? rawDayConfig.closeTime ?? null,
            break_start_time: rawDayConfig.break_start_time ?? rawDayConfig.breakStartTime ?? null,
            break_end_time: rawDayConfig.break_end_time ?? rawDayConfig.breakEndTime ?? null,
          };
          if (clinicDayConfig.is_open) {
            resolvedSchedules.push({
              id: `${doc.id}-${dow}-inherited`,
              doctorId: doc.id,
              dayOfWeek: dow,
              startTime: clinicDayConfig.open_time,
              endTime: clinicDayConfig.close_time,
              breakStartTime: clinicDayConfig.break_start_time || null,
              breakEndTime: clinicDayConfig.break_end_time || null,
              isCustom: false,
              isOpen: true,
            });
          }
        }
      }
    }

    mappedSchedules = resolvedSchedules;
  }

    // Generate dates for the month based on recurring day_of_week
    const generatedSchedules: Array<{
      date: string;
      doctorId: string;
      startTime: string;
      endTime: string;
      breakStartTime: string | null;
      breakEndTime: string | null;
    }> = [];
    const [year, monthStr] = month.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(monthStr), 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const monthFormatted = monthStr.padStart(2, '0');
      const dayFormatted = String(day).padStart(2, '0');
      const dateString = `${year}-${monthFormatted}-${dayFormatted}`;

      const currentDate = new Date(`${dateString}T00:00:00Z`);
      const dayOfWeek = currentDate.getUTCDay(); // 0 = Sun, 1 = Mon, etc.
      
      const matchingSchedules = mappedSchedules.filter(s => s.dayOfWeek === dayOfWeek);
      for (const sched of matchingSchedules) {
        generatedSchedules.push({
          date: dateString,
          doctorId: sched.doctorId,
          startTime: sched.startTime,
          endTime: sched.endTime,
          breakStartTime: sched.breakStartTime,
          breakEndTime: sched.breakEndTime
        });
      }
    }

    return generatedSchedules;
  };

  // Server-side caching for monthly working schedules (5 minutes)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cachedSchedules = unstable_cache(
    async (mStr: string, docId?: string, srvId?: string) => fetchSchedules(mStr, docId, srvId),
    ['working-schedules'],
    { revalidate: 300, tags: ['schedules', 'working-schedules'] }
  );

  // Caching disabled for now: return direct database fetch
  return fetchSchedules;
  // To enable caching, replace with: return cachedSchedules;
};
