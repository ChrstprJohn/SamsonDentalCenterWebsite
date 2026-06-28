import { SupabaseClient } from '@supabase/supabase-js';

export const checkUserExistsQuery = (supabaseAdmin: SupabaseClient) => {
  return async (email: string): Promise<boolean> => {
    const { data } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
      
    return !!data;
  };
};
