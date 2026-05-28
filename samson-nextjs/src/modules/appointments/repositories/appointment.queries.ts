import { SupabaseClient } from '@supabase/supabase-js';

export class AppointmentQueries {
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

  /**
   * Fetches appointments for the clinic with optional filters (Admin Portal).
   */
  async getAppointmentsByClinic(filters?: {
    date?: string;
    status?: string;
    doctorId?: string;
  }) {
    let query = this.supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctor_id (id, first_name, last_name, prefix, suffix),
        service:service_id (id, name, duration_minutes),
        patient:patient_id (id, first_name, last_name)
      `)
      .order('start_time', { ascending: true });

    if (filters?.date) {
      query = query.eq('date', filters.date);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.doctorId) {
      query = query.eq('doctor_id', filters.doctorId);
    }

    const { data: appointments, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch clinic appointments: ${error.message}`);
    }

    return appointments || [];
  }
}
