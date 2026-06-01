import { SupabaseClient } from '@supabase/supabase-js';
import { ResetPasswordDto } from '../../dtos/auth/reset-password.dto';

export const getSessionUserQuery = (supabase: SupabaseClient) => {
  return async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('Unauthorized');
    }
    return user;
  };
};

export const updatePasswordCommand = (supabase: SupabaseClient) => {
  return async (data: ResetPasswordDto) => {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
  };
};

export const signOutCommand = (supabase: SupabaseClient) => {
  return async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Failed to sign out after password reset:', error);
    }
  };
};
