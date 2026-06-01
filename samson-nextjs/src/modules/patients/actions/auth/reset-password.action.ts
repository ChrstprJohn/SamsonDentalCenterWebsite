'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { resetPasswordSchema, ResetPasswordDto } from '../../dtos/auth/reset-password.dto';
import { getSessionUserQuery, updatePasswordCommand } from '../../repositories/auth/reset-password.commands';
import { resetPasswordUseCase } from '../../use-cases/auth/reset-password.use-case';
import { ActionResponse } from '@/shared/utils/action-response';
import { DomainError } from '@/shared/errors';

export const resetPasswordAction = async (
  payload: ResetPasswordDto
): Promise<ActionResponse<null>> => {
  try {
    // 1. Validate payload
    const validatedData = resetPasswordSchema.parse(payload);
    
    // 2. Resolve internal dependencies
    const supabase = await createClient();
    
    // 3. Inject dependencies into Use-Case
    const getSessionUser = getSessionUserQuery(supabase);
    const updatePassword = updatePasswordCommand(supabase);
    const useCase = resetPasswordUseCase({ getSessionUser, updatePassword });

    // 4. Execute Business Logic
    await useCase(validatedData);

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
    console.error('RESET PASSWORD ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
