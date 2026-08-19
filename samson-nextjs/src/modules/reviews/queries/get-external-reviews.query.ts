import { SupabaseClient } from '@supabase/supabase-js';
import type { ReviewListItem } from './get-reviews.query';

export const getExternalReviewsQuery = (supabase: SupabaseClient) => async (): Promise<ReviewListItem[]> => {
  const { data, error } = await supabase
    .from('external_reviews')
    .select('id, reviewer_name, rating, comment, reviewed_at, is_featured_on_landing')
    .order('reviewed_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to load imported reviews: ${error.message}`);

  return (data || []).map((review: any) => ({
    id: review.id,
    appointmentId: '',
    rating: review.rating,
    comment: review.comment,
    createdAt: review.reviewed_at || new Date(0).toISOString(),
    patientName: review.reviewer_name,
    serviceName: null,
    appointmentDate: null,
    isFeaturedOnLanding: review.is_featured_on_landing ?? false,
    source: 'Google',
  }));
};
