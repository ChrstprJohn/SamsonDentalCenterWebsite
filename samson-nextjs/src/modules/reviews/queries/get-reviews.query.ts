import { SupabaseClient } from '@supabase/supabase-js';

export type ReviewListItem = {
  id: string;
  appointmentId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  patientName: string;
  serviceName: string | null;
  appointmentDate: string | null;
};

export const getReviewsQuery = (supabase: SupabaseClient) => {
  return async (): Promise<ReviewListItem[]> => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
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

    if (error) throw new Error(`Failed to load reviews: ${error.message}`);

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
        rating: row.rating,
        comment: row.comment,
        createdAt: row.created_at,
        patientName,
        serviceName: appt?.service?.name ?? null,
        appointmentDate: appt?.date ?? null,
      };
    });
  };
};