import { SupabaseClient } from '@supabase/supabase-js';

export const verifyOtpCommand = (supabase: SupabaseClient) => {
  return async (email: string, token: string, type: 'signup' | 'recovery') => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };
};

export const resendAuthOtpCommand = (supabase: SupabaseClient) => {
  return async (email: string, type: 'signup') => {
    const { error } = await supabase.auth.resend({
      email,
      type,
    });

    if (error) {
      throw new Error(error.message);
    }
  };
};
