import { SupabaseClient } from '@supabase/supabase-js';
import { GetClinicAppointmentsDto } from '../../dtos/exports';
import { AppointmentDto, mapAppointmentRecords } from '../../dtos/exports';

export const getAppointmentsByClinicQuery = (supabase: SupabaseClient) => {
  return async (filters?: GetClinicAppointmentsDto): Promise<AppointmentDto[]> => {
    let query = supabase
      .from('appointments')
      .select(
        `
        *,
        doctor:doctor_id (id, first_name, last_name, suffix),
        service:service_id (id, name, duration_minutes),
        patient:patient_id (id, first_name, last_name),
        dependent:dependents!appointments_dependent_id_fkey (id, first_name, last_name, relationship, date_of_birth)
      `
      )
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

    return mapAppointmentRecords((appointments || []) as Record<string, unknown>[]);
  };
};
