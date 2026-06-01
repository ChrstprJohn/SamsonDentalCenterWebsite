'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { loginSchema, LoginInput } from '../../dtos/auth/login.dto';
import { ActionResponse } from '@/shared/utils/action-response';
import { loginCommand } from '../../repositories/auth/login.commands';
import { loginUseCase } from '../../use-cases/auth/login.use-case';
import { DomainError } from '@/shared/errors';

export async function loginAction(formData: LoginInput): Promise<ActionResponse<any>> {
  try {
    // 1. Validate payload
    const validData = loginSchema.parse(formData);
    
    // 2. Resolve internal dependencies
    const supabase = await createClient();
    
    // 3. Inject dependencies into Use-Case
    const repo = loginCommand(supabase);
    const useCase = loginUseCase(repo);

    // 4. Execute Business Logic
    const result = await useCase(validData);

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    if (error instanceof DomainError) {
      return {
        success: false,
        error: error.message,
        fieldErrors: { 
          password: [error.message === 'Password is required' ? 'Password is required' : 'Invalid email or password'] 
        }
      };
    }
    console.error('LOGIN ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
