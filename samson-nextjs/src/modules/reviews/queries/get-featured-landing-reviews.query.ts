import { SupabaseClient } from '@supabase/supabase-js';

export type LandingReview = { id: string; patientName: string; serviceName: string | null; rating: number; comment: string };

export const getFeaturedLandingReviewsQuery = (supabase: SupabaseClient) => async (): Promise<LandingReview[]> => {
  const { data, error } = await supabase.from('reviews').select(`id, rating, comment, appointment:appointments(service:services(name), patient:users!appointments_patient_id_fkey(first_name, last_name), guest_contacts!guest_contacts_appointment_id_fkey(first_name, last_name))`).eq('is_featured_on_landing', true).not('comment', 'is', null).order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to load featured reviews: ${error.message}`);
  const patientReviews = (data || []).map((row: any) => {
    const appointment = Array.isArray(row.appointment) ? row.appointment[0] : row.appointment;
    const guest = Array.isArray(appointment?.guest_contacts) ? appointment.guest_contacts[0] : appointment?.guest_contacts;
    const patient = Array.isArray(appointment?.patient) ? appointment.patient[0] : appointment?.patient;
    return { id: row.id, patientName: guest ? `${guest.first_name} ${guest.last_name}` : patient ? `${patient.first_name} ${patient.last_name}` : 'Anonymous patient', serviceName: appointment?.service?.name ?? null, rating: row.rating, comment: row.comment };
  });
  const { data: externalData, error: externalError } = await supabase
    .from('external_reviews')
    .select('id, reviewer_name, rating, comment')
    .eq('is_featured_on_landing', true)
    .order('created_at', { ascending: false });
  if (externalError) throw new Error(`Failed to load featured imported reviews: ${externalError.message}`);
  const externalReviews = (externalData || []).map((row: any) => ({
    id: row.id,
    patientName: row.reviewer_name,
    serviceName: 'Google review',
    rating: row.rating,
    comment: row.comment,
  }));
  return [...patientReviews, ...externalReviews];
};
