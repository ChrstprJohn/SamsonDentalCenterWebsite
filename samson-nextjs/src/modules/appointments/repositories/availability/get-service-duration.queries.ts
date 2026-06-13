import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { unstable_cache } from 'next/cache';

export const getServiceDurationQuery = (supabase: SupabaseClient) => {
  const fetchDuration = async (serviceId: string) => {
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

  // Server-side caching for service duration (1 hour)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cachedDuration = unstable_cache(
    async (serviceId: string) => fetchDuration(serviceId),
    ['service-duration'],
    { revalidate: 3600, tags: ['services', 'service-duration'] }
  );

  // Caching disabled for now: return direct database fetch
  return fetchDuration;
  // To enable caching, replace with: return cachedDuration;
};
