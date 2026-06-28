'use server';

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { after } from 'next/server';
import { DomainError } from '@/shared/errors';
import { forgotPasswordSchema, ForgotPasswordDto } from '../../dtos/auth/forgot-password.dto';
import { requestPasswordResetCommand } from '../../repositories/auth/password-recovery.commands';
import { requestPasswordResetUseCase } from '../../use-cases/auth/request-password-reset.use-case';
import { globalOutboxDispatcher } from '@/shared/outbox/outbox.dispatcher';
import { bootstrapEventSubscribers } from '@/orchestrators/event-subscribers';
import { ActionResponse } from '@/shared/utils/action-response';

export const requestPasswordResetAction = async (
  payload: ForgotPasswordDto
): Promise<ActionResponse<null>> => {
  try {
    // 1. Validate payload
    const validatedData = forgotPasswordSchema.parse(payload);
    
    // 2. Resolve dependencies
    const supabaseAdmin = await createAdminClient();
    
    // 3. Inject dependencies into Use-Case
    const commandRepo = requestPasswordResetCommand(supabaseAdmin);
    
    const triggerBackgroundWorkers = () => {
      after(async () => {
        bootstrapEventSubscribers();
        const dispatchOutbox = globalOutboxDispatcher(supabaseAdmin);
        await dispatchOutbox();
      });
    };

    const useCase = requestPasswordResetUseCase({
      requestPasswordResetCommand: commandRepo,
      triggerBackgroundWorkers
    });
    
    // 4. Execute Business Logic
    await useCase(validatedData.email);
    
    return { success: true, data: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('REQUEST PASSWORD RESET ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
