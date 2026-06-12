import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { doctorScheduleResponseSchema } from '../../dtos';

export const getWorkingSchedulesForMonthQuery = (supabase: SupabaseClient) => {
  return async (month: string, doctorId?: string, serviceId?: string) => {
    // month is format YYYY-MM
    let selectFields = 'id, day_of_week, doctor_id, start_time, end_time, break_start_time, break_end_time, doctor:doctor_id!inner(first_name, last_name)';

    if (serviceId) {
      selectFields = 'id, day_of_week, doctor_id, start_time, end_time, break_start_time, break_end_time, doctor:doctor_id!inner(first_name, last_name, doctor_services!inner(service_id))';
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

    const mappedSchedules = schedules?.map(s => doctorScheduleResponseSchema.parse(s)) || [];

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
};
