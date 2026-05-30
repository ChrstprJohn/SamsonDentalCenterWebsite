import { SupabaseClient } from '@supabase/supabase-js';

export class PatientAppointmentsQueries {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Fetches all appointments for a specific user (Patient Portal).
   * Orders by start time descending (newest first).
   */
  async getAppointmentsByUser(userId: string) {
    const { data: appointments, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctor_id (id, first_name, last_name, prefix, suffix),
        service:service_id (id, name, duration_minutes)
      `)
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user appointments: ${error.message}`);
    }

    return appointments || [];
  }
}
