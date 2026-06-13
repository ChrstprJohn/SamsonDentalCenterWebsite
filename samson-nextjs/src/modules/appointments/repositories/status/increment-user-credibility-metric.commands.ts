import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';

export const incrementUserCredibilityMetricCommand = (supabase: SupabaseClient) => {
  return async (
    userId: string,
    metric: 'cancel_count' | 'no_show_count' | 'reschedule_count'
  ) => {
    const { error } = await supabase.rpc('increment_credibility_metric', {
      p_user_id: userId,
      p_metric: metric,
    });

    if (error) {
      throw new DomainError(
        `Failed to increment credibility metric '${metric}': ${error.message}`,
        'DATABASE_ERROR'
      );
    }

    return { success: true };
  };
};
