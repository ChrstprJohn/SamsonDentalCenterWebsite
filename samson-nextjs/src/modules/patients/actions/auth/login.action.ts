'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { loginSchema, LoginInput } from '../../dtos/auth/login.dto';
import { ActionResponse } from '@/shared/utils/action-response';

export async function loginAction(formData: LoginInput): Promise<ActionResponse<any>> {
  try {
    const validData = loginSchema.parse(formData);
    const supabase = await createClient();

    if (validData.password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validData.email,
        password: validData.password,
      });

      if (error) {
        return { 
          success: false, 
          error: error.message,
          fieldErrors: { password: ['Invalid email or password'] } 
        };
      }
      return { success: true, data };
    } else {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: validData.email,
        options: {
          shouldCreateUser: false,
        }
      });

      if (error) {
        return { 
          success: false, 
          error: error.message,
          fieldErrors: { email: [error.message] }
        };
      }
      return { success: true, data };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    console.error('LOGIN ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
