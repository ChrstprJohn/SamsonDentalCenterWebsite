'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { ActionResponse } from '@/shared/utils/action-response';

const forcePasswordChangeSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function forcePasswordChangeAction(
  payload: z.infer<typeof forcePasswordChangeSchema>
): Promise<ActionResponse<any>> {
  try {
    const validatedData = forcePasswordChangeSchema.parse(payload);
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: validatedData.password,
      data: {
        status: 'ACTIVE',
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to reset password',
      };
    }

    return {
      success: true,
      data: {
        email: user.email,
      },
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    console.error('FORCE PASSWORD CHANGE ERROR:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}
