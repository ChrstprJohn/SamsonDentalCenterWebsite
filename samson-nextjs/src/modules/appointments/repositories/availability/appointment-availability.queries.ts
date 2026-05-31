import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';

export const getWorkingSchedulesForMonthQuery = (supabase: SupabaseClient) => {
  return async (month: string, doctorId?: string) => {
    let query = supabase
      .from('staff_schedules')
      .select('date, staff_id')
      .eq('is_working', true)
      .like('date', `${month}-%`);

    if (doctorId) {
      query = query.eq('staff_id', doctorId);
    }

    const { data: schedules, error } = await query;

    if (error) {
      throw new DomainError(`Failed to fetch monthly schedules: ${error.message}`, 'DATABASE_ERROR');
    }

    return schedules || [];
  };
};

export const getDoctorSchedulesQuery = (supabase: SupabaseClient) => {
  return async (date: string, doctorId?: string) => {
    let query = supabase
      .from('staff_schedules')
      .select('*')
      .eq('date', date)
      .eq('is_working', true);

    if (doctorId) {
      query = query.eq('staff_id', doctorId);
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

    const { data: doctor } = await supabase
      .from('doctors')
      .select('first_name, last_name')
      .eq('id', doctorId)
      .single();

    if (doctor) {
      return `Dr. ${doctor.first_name} ${doctor.last_name}`;
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
