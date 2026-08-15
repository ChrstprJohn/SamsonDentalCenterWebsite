import { SupabaseClient } from '@supabase/supabase-js';

export type NoShowReasonListItem = {
  id: string;
  appointmentId: string;
  reason: string;
  createdAt: string;
  patientName: string;
  serviceName: string | null;
  appointmentDate: string | null;
};

export const getNoShowReasonsQuery = (supabase: SupabaseClient) => {
  return async (): Promise<NoShowReasonListItem[]> => {
    const { data, error } = await supabase
      .from('no_show_reasons')
      .select(`
        id,
        reason,
        created_at,
        appointment_id,
        appointment:appointments(
          id,
          date,
          service:services(name),
          patient:users!appointments_patient_id_fkey(first_name, last_name),
          guest_contacts!guest_contacts_appointment_id_fkey(first_name, last_name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to load no-show reasons: ${error.message}`);

    return (data || []).map((row: any) => {
      const appt = Array.isArray(row.appointment) ? row.appointment[0] : row.appointment;
      const gc = Array.isArray(appt?.guest_contacts) ? appt.guest_contacts[0] : appt?.guest_contacts;
      const patientName = gc
        ? `${gc.first_name} ${gc.last_name}`
        : appt?.patient
          ? `${appt.patient.first_name} ${appt.patient.last_name}`
          : 'Unknown patient';
      return {
        id: row.id,
        appointmentId: row.appointment_id,
        reason: row.reason,
        createdAt: row.created_at,
        patientName,
        serviceName: appt?.service?.name ?? null,
        appointmentDate: appt?.date ?? null,
      };
    });
  };
};