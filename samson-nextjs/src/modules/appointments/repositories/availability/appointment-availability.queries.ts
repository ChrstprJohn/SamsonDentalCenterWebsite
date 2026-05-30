import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';

export class AppointmentAvailabilityQueries {
  constructor(private readonly supabase: SupabaseClient) {}

  async getWorkingSchedulesForMonth(month: string, doctorId?: string) {
    let query = this.supabase
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
  }

  async getDoctorSchedules(date: string, doctorId?: string) {
    let query = this.supabase
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
  }

  async getExistingAppointments(date: string, doctorId?: string) {
    let query = this.supabase
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
  }

  async getServiceDuration(serviceId: string) {
    const { data: service, error } = await this.supabase
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
  }

  async resolveDoctorDisplayName(doctorId: string) {
    const { data: user } = await this.supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', doctorId)
      .single();

    if (user) {
      return `Dr. ${user.first_name} ${user.last_name}`;
    }

    const { data: doctor } = await this.supabase
      .from('doctors')
      .select('first_name, last_name')
      .eq('id', doctorId)
      .single();

    if (doctor) {
      return `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }

    return 'Doctor';
  }
}
