'use server';

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { after } from 'next/server';
import { forgotPasswordSchema, ForgotPasswordDto } from '../../dtos/auth/forgot-password.dto';
import { requestPasswordResetCommand } from '../../repositories/auth/password-recovery.commands';
import { globalOutboxDispatcher } from '@/shared/outbox/outbox.dispatcher';
import { bootstrapEventSubscribers } from '@/orchestrators/event-subscribers';
import { ActionResponse } from '@/shared/utils/action-response';

export const requestPasswordResetAction = async (
  payload: ForgotPasswordDto
): Promise<ActionResponse<null>> => {
  try {
    const validatedData = forgotPasswordSchema.parse(payload);
    const supabaseAdmin = await createAdminClient();
    
    const command = requestPasswordResetCommand(supabaseAdmin);
    await command(validatedData.email);
    
    // Performance Watch-Out: Use non-blocking after() hook to trigger the dispatcher
    after(async () => {
      bootstrapEventSubscribers();
      const dispatchOutbox = globalOutboxDispatcher(supabaseAdmin);
      await dispatchOutbox();
    });
    
    return { success: true, data: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    console.error('REQUEST PASSWORD RESET ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
