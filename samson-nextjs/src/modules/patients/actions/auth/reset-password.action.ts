'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { resetPasswordSchema, ResetPasswordDto } from '../../dtos/auth/reset-password.dto';
import { ActionResponse } from '@/shared/utils/action-response';

export const resetPasswordAction = async (
  payload: ResetPasswordDto
): Promise<ActionResponse<null>> => {
  try {
    const validatedData = resetPasswordSchema.parse(payload);
    const supabase = await createClient();
    
    // The user should already have an active session from verifyOtpAction
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    
    if (sessionError || !user) {
      return { 
        success: false, 
        error: 'Unauthorized. Please restart the password reset process.' 
      };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.password
    });

    if (updateError) {
      return {
        success: false,
        error: updateError.message
      };
    }

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    console.error('RESET PASSWORD ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
