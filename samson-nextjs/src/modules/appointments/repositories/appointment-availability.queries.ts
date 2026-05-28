import { SupabaseClient } from '@supabase/supabase-js';

export class AppointmentAvailabilityQueries {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Fetches the working schedules of doctors for a specific date.
   * If doctorId is provided, fetches only for that doctor.
   */
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
      throw new Error(`Failed to fetch doctor schedules: ${error.message}`);
    }

    return schedules || [];
  }

  /**
   * Fetches existing appointments for a specific date to calculate overlapping slots.
   * Excludes CANCELLED, REJECTED, and DISPLACED statuses as those free up the slot.
   */
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
      throw new Error(`Failed to fetch existing appointments: ${error.message}`);
    }

    return appointments || [];
  }
}
