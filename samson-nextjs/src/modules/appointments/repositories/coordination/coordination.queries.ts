import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { CoordinationLogResponseDto, coordinationLogResponseSchema } from '../../dtos/coordination/coordination-log-response.dto';

export const getCoordinationLogsByInquiryIdQuery = (supabase: SupabaseClient) => {
  return async (inquiryId: string): Promise<CoordinationLogResponseDto[]> => {
    const { data, error } = await supabase
      .from('coordination_logs')
      .select('*')
      .eq('inquiry_id', inquiryId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new DomainError(`Failed to fetch coordination logs: ${error.message}`, 'DATABASE_ERROR');
    }

    return (data || []).map((row) => coordinationLogResponseSchema.parse(row));
  };
};
