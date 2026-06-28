import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { outboxCommands } from '@/shared/outbox/outbox.commands';

export const requestPasswordResetCommand = (supabaseAdmin: SupabaseClient) => {
  return async (email: string): Promise<void> => {
    // 1. Fetch user to get first name
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('first_name')
      .eq('email', email)
      .single();

    // Prevent email enumeration: if user not found, we silently return.
    if (profileError || !userProfile) {
      console.warn(`Password reset requested for unknown email: ${email}`);
      return; 
    }

    // 2. Generate recovery link/OTP via Supabase Admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (authError) {
      console.error('Failed to generate recovery link:', authError);
      return;
    }

    // 3. Queue the PASSWORD_RESET_REQUESTED event in the transactional outbox
    const otpCode = authData.properties?.email_otp;
    if (otpCode) {
      const outbox = outboxCommands(supabaseAdmin);
      await outbox.emitEvent('PASSWORD_RESET_REQUESTED', { 
        email: email, 
        firstName: userProfile.first_name || 'Patient', 
        otpCode 
      });
    }
  };
};
