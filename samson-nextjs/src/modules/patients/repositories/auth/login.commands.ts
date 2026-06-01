import { SupabaseClient } from '@supabase/supabase-js';
import { LoginInput } from '../../dtos/auth/login.dto';

export const loginCommand = (supabase: SupabaseClient) => {
  return async (data: LoginInput) => {
    const { data: result, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password as string, // Password is checked in Use Case
    });

    if (error) {
      throw new Error(error.message);
    }

    return result;
  };
};
