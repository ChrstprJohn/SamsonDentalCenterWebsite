import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { InquiryResponseDto, inquiryResponseSchema } from '../../dtos/booking/submit-inquiry.dto';

/**
 * Fetches all appointment inquiries with status 'NEW', ordered by created_at DESC.
 * Maps DB response fields from snake_case to camelCase via inquiryResponseSchema.
 */
export const getInquiriesQuery = (supabase: SupabaseClient) => {
  return async (): Promise<InquiryResponseDto[]> => {
    const { data, error } = await supabase
      .from('appointment_inquiries')
      .select('*, services:preferred_service_id(name)')
      .eq('status', 'NEW')
      .order('created_at', { ascending: false });

    if (error) {
      throw new DomainError(`Failed to fetch appointment inquiries: ${error.message}`, 'DATABASE_ERROR');
    }

    return (data || []).map((row) => inquiryResponseSchema.parse(row));
  };
};
