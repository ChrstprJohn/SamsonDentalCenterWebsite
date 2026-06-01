'use server';

import { createClient, createAdminClient } from '@/shared/database/server';
import { ActionResponse } from '@/shared/utils/action-response';
import { DomainError } from '@/shared/errors';
import { checkUserExistsQuery } from '../../repositories/auth/auth.queries';
import { verifyOtpCommand, resendAuthOtpCommand } from '../../repositories/auth/auth.commands';
import { requestPasswordResetCommand } from '../../repositories/auth/password-recovery.commands';
import { verifyOtpUseCase } from '../../use-cases/auth/verify-otp.use-case';
import { resendOtpUseCase } from '../../use-cases/auth/resend-otp.use-case';
import { after } from 'next/server';
import { globalOutboxDispatcher } from '@/shared/outbox/outbox.dispatcher';
import { bootstrapEventSubscribers } from '@/orchestrators/event-subscribers';

interface VerifyOtpInput {
  email: string;
  token: string;
  type: 'signup' | 'recovery';
}

export async function verifyOtpAction(data: VerifyOtpInput): Promise<ActionResponse<any>> {
  try {
    // 1. Resolve internal dependencies
    const supabaseAdmin = await createAdminClient();
    const supabase = await createClient();

    // 2. Inject dependencies into Use-Case
    const checkUserExists = checkUserExistsQuery(supabaseAdmin);
    const verifyOtp = verifyOtpCommand(supabase);
    const useCase = verifyOtpUseCase({ checkUserExists, verifyOtp });

    // 3. Execute Business Logic
    const sessionData = await useCase(data.email, data.token, data.type);

    return { success: true, data: sessionData };
  } catch (error) {
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('VERIFY OTP ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}

export async function resendOtpAction(email: string, type: 'signup' | 'recovery' = 'signup'): Promise<ActionResponse<any>> {
  try {
    // 1. Resolve internal dependencies
    const supabaseAdmin = await createAdminClient();
    const supabase = await createClient();

    // 2. Inject dependencies into Use-Case
    const requestPasswordReset = requestPasswordResetCommand(supabaseAdmin);
    const resendAuthOtp = resendAuthOtpCommand(supabase);
    
    const triggerBackgroundWorkers = () => {
      after(async () => {
        bootstrapEventSubscribers();
        const dispatchOutbox = globalOutboxDispatcher(supabaseAdmin);
        await dispatchOutbox();
      });
    };

    const useCase = resendOtpUseCase({ requestPasswordReset, resendAuthOtp, triggerBackgroundWorkers });

    // 3. Execute Business Logic
    await useCase(email, type);
    
    return { success: true, data: null };
  } catch (error) {
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('RESEND OTP ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
