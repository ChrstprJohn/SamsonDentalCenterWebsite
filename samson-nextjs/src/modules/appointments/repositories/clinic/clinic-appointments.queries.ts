import { SupabaseClient } from '@supabase/supabase-js';
import { GetClinicAppointmentsDto } from '../../dtos/exports';
import { AppointmentDto, mapAppointmentRecords } from '../../dtos/exports';

export const APPOINTMENT_SUMMARY_SELECT = `
  id, patient_id, dependent_id, service_id, doctor_id, date, start_time, end_time,
  status, source, doctor_assignment_source, preferred_start_time,
  proposed_preferred_start_time, user_note, status_reason, proposed_date,
  proposed_start_time, proposed_end_time, proposed_doctor_id, reschedule_count,
  confirmation_channel, email_confirmation_sent, sms_confirmation_sent,
  email_reminder_48h_sent, sms_reminder_48h_sent, email_reminder_24h_sent,
  sms_reminder_24h_sent, email_checkout_sent, sms_checkout_sent,
  email_cancel_sent, sms_cancel_sent, email_reschedule_sent,
  sms_reschedule_sent, no_show_resolved_at,
  no_show_resolution, created_at, updated_at,
  doctor:doctor_id (id, first_name, last_name, suffix),
  service:service_id (id, name, duration_minutes),
  patient:patient_id (id, first_name, last_name),
  dependent:dependents!appointments_dependent_id_fkey
    (id, first_name, last_name, relationship, date_of_birth),
  guest_contacts (first_name, middle_name, last_name, suffix, email, phone_number)
`;

export const getAppointmentsByClinicQuery = (supabase: SupabaseClient) => {
  return async (filters?: GetClinicAppointmentsDto): Promise<AppointmentDto[]> => {
    let query = supabase
      .from('appointments')
      .select(APPOINTMENT_SUMMARY_SELECT)
      .order('start_time', { ascending: true });

    if (filters?.date) {
      query = query.eq('date', filters.date);
    }
    if (filters?.dateFrom) query = query.gte('date', filters.dateFrom);
    if (filters?.dateTo) query = query.lte('date', filters.dateTo);
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
