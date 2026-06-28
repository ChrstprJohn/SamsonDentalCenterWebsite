import { SupabaseClient } from '@supabase/supabase-js';

export const deactivateUserCommand = (supabase: SupabaseClient) => {
  return async (userId: string, reason?: string): Promise<boolean> => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false, deactivation_reason: reason })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to deactivate user: ${error.message}`);
    }

    return true;
  };
};
