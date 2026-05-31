import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';

export const getWorkingSchedulesForMonthQuery = (supabase: SupabaseClient) => {
  return async (month: string, doctorId?: string) => {
    // month is format YYYY-MM
    let query = supabase
      .from('doctor_schedules')
      .select('day_of_week, doctor_id');

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const { data: schedules, error } = await query;

    if (error) {
      throw new DomainError(`Failed to fetch monthly schedules: ${error.message}`, 'DATABASE_ERROR');
    }

    // Generate dates for the month based on recurring day_of_week
    const generatedSchedules: Array<{ date: string; staff_id: string }> = [];
    const [year, monthStr] = month.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(monthStr), 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(parseInt(year), parseInt(monthStr) - 1, day);
      const dayOfWeek = currentDate.getDay(); // 0 = Sun, 1 = Mon, etc.
      
      const matchingSchedules = schedules?.filter(s => s.day_of_week === dayOfWeek) || [];
      for (const sched of matchingSchedules) {
        generatedSchedules.push({
          date: currentDate.toISOString().split('T')[0],
          staff_id: sched.doctor_id
        });
      }
    }

    return generatedSchedules;
  };
};

export const getDoctorSchedulesQuery = (supabase: SupabaseClient) => {
  return async (date: string, doctorId?: string) => {
    const dayOfWeek = new Date(date).getDay();
    let query = supabase
      .from('doctor_schedules')
      .select('*')
      .eq('day_of_week', dayOfWeek);

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const { data: schedules, error } = await query;

    if (error) {
      throw new DomainError(`Failed to fetch doctor schedules: ${error.message}`, 'DATABASE_ERROR');
    }

    return schedules || [];
  };
};

export const getExistingAppointmentsQuery = (supabase: SupabaseClient) => {
  return async (date: string, doctorId?: string) => {
    let query = supabase
      .from('appointments')
      .select('id, start_time, end_time, doctor_id, status')
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

    return appointments || [];
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

  async getWorkingSchedulesForMonth(month: string, doctorId?: string) {
    return getWorkingSchedulesForMonthQuery(this.supabase)(month, doctorId);
  }

  async getDoctorSchedules(date: string, doctorId?: string) {
    return getDoctorSchedulesQuery(this.supabase)(date, doctorId);
  }

  async getExistingAppointments(date: string, doctorId?: string) {
    return getExistingAppointmentsQuery(this.supabase)(date, doctorId);
  }

  async getServiceDuration(serviceId: string) {
    return getServiceDurationQuery(this.supabase)(serviceId);
  }

  async resolveDoctorDisplayName(doctorId: string) {
    return resolveDoctorDisplayNameQuery(this.supabase)(doctorId);
  }
}
