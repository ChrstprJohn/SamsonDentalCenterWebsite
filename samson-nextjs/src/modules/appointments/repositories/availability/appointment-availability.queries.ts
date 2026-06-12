import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { getExistingAppointmentsForMonthQuery } from './get-existing-appointments-for-month.queries';
import { doctorScheduleResponseSchema, appointmentResponseSchema } from '../../dtos';

export const getWorkingSchedulesForMonthQuery = (supabase: SupabaseClient) => {
  return async (month: string, doctorId?: string, serviceId?: string) => {
    // month is format YYYY-MM
    let query = supabase
      .from('doctor_schedules')
      .select('id, day_of_week, doctor_id, start_time, end_time, break_start_time, break_end_time');

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
      throw new DomainError(`Failed to fetch monthly schedules: ${error.message}`, 'DATABASE_ERROR');
    }

    const mappedSchedules = schedules?.map(s => doctorScheduleResponseSchema.parse(s)) || [];

    // Generate dates for the month based on recurring day_of_week
    const generatedSchedules: Array<{
      date: string;
      staffId: string;
      startTime: string;
      endTime: string;
      breakStartTime: string | null;
      breakEndTime: string | null;
    }> = [];
    const [year, monthStr] = month.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(monthStr), 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(parseInt(year), parseInt(monthStr) - 1, day);
      const dayOfWeek = currentDate.getDay(); // 0 = Sun, 1 = Mon, etc.
      
      const matchingSchedules = mappedSchedules.filter(s => s.dayOfWeek === dayOfWeek);
      for (const sched of matchingSchedules) {
        generatedSchedules.push({
          date: currentDate.toISOString().split('T')[0],
          staffId: sched.doctorId,
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

export const getDoctorSchedulesQuery = (supabase: SupabaseClient) => {
  return async (date: string, doctorId?: string, serviceId?: string) => {
    const dayOfWeek = new Date(date).getDay();
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

export const getServiceDurationQuery = (supabase: SupabaseClient) => {
  return async (serviceId: string) => {
    const { data: service, error } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .single();

    if (error || !service) {
      throw new DomainError(
        `Service not found: ${error?.message || 'Unknown error'}`,
        'NOT_FOUND'
      );
    }

    return service.duration_minutes as number;
  };
};

export const resolveDoctorDisplayNameQuery = (supabase: SupabaseClient) => {
  return async (doctorId: string) => {
    const { data: user } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', doctorId)
      .single();

    if (user) {
      return `Dr. ${user.first_name} ${user.last_name}`;
    }

    return 'Doctor';
  };
};

/** @deprecated Use functional queries directly instead */
export class AppointmentAvailabilityQueries {
  constructor(private readonly supabase: SupabaseClient) {}

  async getWorkingSchedulesForMonth(month: string, doctorId?: string, serviceId?: string) {
    return getWorkingSchedulesForMonthQuery(this.supabase)(month, doctorId, serviceId);
  }

  async getDoctorSchedules(date: string, doctorId?: string, serviceId?: string) {
    return getDoctorSchedulesQuery(this.supabase)(date, doctorId, serviceId);
  }

  async getExistingAppointments(date: string, doctorId?: string) {
    return getExistingAppointmentsQuery(this.supabase)(date, doctorId);
  }

  async getExistingAppointmentsForMonth(month: string, doctorId?: string) {
    return getExistingAppointmentsForMonthQuery(this.supabase)(month, doctorId);
  }

  async getServiceDuration(serviceId: string) {
    return getServiceDurationQuery(this.supabase)(serviceId);
  }

  async resolveDoctorDisplayName(doctorId: string) {
    return resolveDoctorDisplayNameQuery(this.supabase)(doctorId);
  }
}
