import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { InquiryResponseDto, inquiryResponseSchema } from '../../dtos/booking/submit-inquiry.dto';

export type InquiryStatus = 'NEW' | 'CONVERTED' | 'DROPPED';

/**
 * Fetches appointment inquiries filtered by status, ordered by created_at DESC.
 */
export const getInquiriesQuery = (supabase: SupabaseClient) => {
  return async (status?: InquiryStatus): Promise<InquiryResponseDto[]> => {
    let query = supabase
      .from('appointment_inquiries')
      .select('*, services:preferred_service_id(name)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      throw new DomainError(`Failed to fetch appointment inquiries: ${error.message}`, 'DATABASE_ERROR');
    }

    return (data || []).map((row) => inquiryResponseSchema.parse(row));
  };
};
