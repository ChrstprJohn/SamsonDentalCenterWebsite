import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { AppointmentDto, mapAppointmentRecord } from '../../dtos';

export const getAppointmentByIdQuery = (supabase: SupabaseClient) => {
  return async (appointmentId: string): Promise<AppointmentDto> => {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        doctor:users!appointments_doctor_id_fkey (id, first_name, last_name, suffix),
        service:services!appointments_service_id_fkey (id, name, duration_minutes),
        patient:users!appointments_patient_id_fkey (id, first_name, last_name),
        dependent:dependents!appointments_dependent_id_fkey (id, first_name, last_name, relationship)
      `
      )
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      throw new DomainError(
        `Failed to fetch appointment: ${error?.message || 'Unknown database error'}`,
        'DATABASE_ERROR'
      );
    }

    return mapAppointmentRecord(appointment as Record<string, unknown>);
  };
};
