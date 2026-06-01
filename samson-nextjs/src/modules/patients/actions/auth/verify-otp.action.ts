'use server';

import { createClient } from '@/shared/database/server';
import { ActionResponse } from '@/shared/utils/action-response';

interface VerifyOtpInput {
  email: string;
  token: string;
  type: 'signup';
}

export async function verifyOtpAction(data: VerifyOtpInput): Promise<ActionResponse<any>> {
  try {
    const supabase = await createClient();

    const { data: sessionData, error } = await supabase.auth.verifyOtp({
      email: data.email,
      token: data.token,
      type: 'signup',
    });

    if (error) {
      return { 
        success: false, 
        error: error.message,
      };
    }

    return { success: true, data: sessionData };
  } catch (error) {
    console.error('VERIFY OTP ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}

export async function resendOtpAction(email: string): Promise<ActionResponse<any>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
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
