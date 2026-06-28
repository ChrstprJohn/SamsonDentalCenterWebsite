import { SupabaseClient } from '@supabase/supabase-js';
import { StaffLoginDto } from '../../dtos/auth/staff-login.dto';

export const staffLoginCommand = (supabase: SupabaseClient) => {
  return async (data: StaffLoginDto) => {
    const { data: result, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return result;
  };
};
