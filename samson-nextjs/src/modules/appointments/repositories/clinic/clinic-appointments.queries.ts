import { SupabaseClient } from '@supabase/supabase-js';
import { GetClinicAppointmentsDto } from '../dtos';

export class ClinicAppointmentsQueries {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Fetches appointments for the clinic with optional filters (Admin/Secretary Portal).
   */
  async getAppointmentsByClinic(filters?: GetClinicAppointmentsDto) {
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
