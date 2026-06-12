import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';

export const getServiceDurationQuery = (supabase: SupabaseClient) => {
  return async (serviceId: string) => {
    const { data: service, error } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .single();

    if (error || !service) {
      throw new DomainError(
        `Service not found: ${error?.message || 'Unknown error'}`,
        'NOT_FOUND'
      );
    }

    return service.duration_minutes as number;
  };
};
