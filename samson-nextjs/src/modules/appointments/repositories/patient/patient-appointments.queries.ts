import { SupabaseClient } from '@supabase/supabase-js';
import { AppointmentDto, mapAppointmentRecords } from '../../dtos';

export const getAppointmentsByUserQuery = (supabase: SupabaseClient) => {
  return async (userId: string): Promise<AppointmentDto[]> => {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        doctor:users!appointments_doctor_id_fkey (id, first_name, last_name, suffix),
        service:services!appointments_service_id_fkey (id, name, duration_minutes)
      `
      )
      .eq('patient_id', userId)
      .order('start_time', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user appointments: ${error.message}`);
    }

    return mapAppointmentRecords((appointments || []) as Record<string, unknown>[]);
  };
};

/** @deprecated Use functional queries directly instead */
export class PatientAppointmentsQueries {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Fetches all appointments for a specific user (Patient Portal).
   * Orders by start time descending (newest first).
   */
  async getAppointmentsByUser(userId: string): Promise<AppointmentDto[]> {
    return getAppointmentsByUserQuery(this.supabase)(userId);
  }
}
