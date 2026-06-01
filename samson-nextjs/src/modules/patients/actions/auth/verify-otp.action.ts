'use server';

import { createClient, createAdminClient } from '@/shared/database/server';
import { ActionResponse } from '@/shared/utils/action-response';

interface VerifyOtpInput {
  email: string;
  token: string;
  type: 'signup' | 'recovery';
}

export async function verifyOtpAction(data: VerifyOtpInput): Promise<ActionResponse<any>> {
  try {
    const supabaseAdmin = await createAdminClient();
    const supabase = await createClient();

    // Security Watch-Out: For recovery, ensure user exists before verifying OTP.
    if (data.type === 'recovery') {
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', data.email)
        .single();
        
      if (!userProfile) {
        return { success: false, error: 'User not found' };
      }
    }

    const { data: sessionData, error } = await supabase.auth.verifyOtp({
      email: data.email,
      token: data.token,
      type: data.type,
    });

    if (error) {
      return { 
        success: false, 
        error: error.message,
      };
    }

    // Security Watch-Out: Ensure session is granted for recovery, and verify identity matching
    if (data.type === 'recovery' && !sessionData.session) {
      return { success: false, error: 'Failed to establish recovery session' };
    }
    
    if (sessionData.user && sessionData.user.email !== data.email) {
      return { success: false, error: 'Identity verification failed: Email mismatch' };
    }

    return { success: true, data: sessionData };
  } catch (error) {
    console.error('VERIFY OTP ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}

export async function resendOtpAction(email: string, type: 'signup' | 'recovery' = 'signup'): Promise<ActionResponse<any>> {
  try {
    if (type === 'recovery') {
      const supabaseAdmin = await createAdminClient();
      const { requestPasswordResetCommand } = await import('../../repositories/auth/password-recovery.commands');
      const { after } = await import('next/server');
      const { globalOutboxDispatcher } = await import('@/shared/outbox/outbox.dispatcher');
      const { bootstrapEventSubscribers } = await import('@/orchestrators/event-subscribers');

      const command = requestPasswordResetCommand(supabaseAdmin);
      await command(email);
      
      after(async () => {
        bootstrapEventSubscribers();
        const dispatchOutbox = globalOutboxDispatcher(supabaseAdmin);
        await dispatchOutbox();
      });

      return { success: true, data: null };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: type as 'signup', // Supabase resend only supports signup, sms, email_change, phone_change
      email: email,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data: null };
  } catch (error) {
    console.error('RESEND OTP ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
