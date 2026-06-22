'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { staffLoginSchema, StaffLoginDto } from '../../dtos/auth/staff-login.dto';
import { ActionResponse } from '@/shared/utils/action-response';
import { staffLoginCommand } from '../../repositories/auth/staff-login.commands';
import { staffLoginUseCase } from '../../use-cases/auth/staff-login.use-case';
import { DomainError } from '@/shared/errors';

export async function staffLoginAction(formData: StaffLoginDto): Promise<ActionResponse<any>> {
  try {
    // 1. Validate payload
    const validData = staffLoginSchema.parse(formData);

    // 2. Resolve internal dependencies
    const supabase = await createClient();

    // 3. Inject dependencies into Use-Case
    const repo = staffLoginCommand(supabase);
    const useCase = staffLoginUseCase(repo);

    // 4. Execute Business Logic
    const result = await useCase(validData);

    return { success: true, data: result };
  } catch (error: any) {
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
          password: [error.message]
        }
      };
    }
    console.error('STAFF LOGIN ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
