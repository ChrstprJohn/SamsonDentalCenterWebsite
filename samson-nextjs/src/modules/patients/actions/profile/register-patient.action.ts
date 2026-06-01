'use server';

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { after } from 'next/server';
import { DomainError } from '@/shared/errors';
import { registerPatientSchema, RegisterPatientDto } from '../../dtos';
import { createPatientCommand } from '../../repositories';
import { registerPatientUseCase } from '../../use-cases';
import { globalOutboxDispatcher } from '@/shared/outbox/outbox.dispatcher';
import { bootstrapEventSubscribers } from '@/orchestrators/event-subscribers';

import { ActionResponse } from '@/shared/utils/action-response';

export const registerPatientAction = async (
  payload: RegisterPatientDto
): Promise<ActionResponse<{ id: string; firstName: string }>> => {
  try {
    // 1. Validate payload
    const validatedData = registerPatientSchema.parse(payload);

    // 2. Resolve internal dependencies (Database client & Auth context)
    const supabaseAdmin = await createAdminClient();
    
    // 3. Inject dependencies into Use-Case
    const repo = createPatientCommand(supabaseAdmin);
    const useCase = registerPatientUseCase(repo);

    // 4. Execute Business Logic
    const newPatient = await useCase(validatedData);
    
    // Non-blocking background worker trigger
    after(async () => {
      bootstrapEventSubscribers();
      const dispatchOutbox = globalOutboxDispatcher(supabaseAdmin);
      await dispatchOutbox();
    });
    
    return { success: true, data: newPatient };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    if (error instanceof DomainError) {
      // Check if it's an email conflict from Supabase
      if (error.message.includes('User already registered') || error.message.includes('already exists')) {
        return {
          success: false,
          error: 'Email is already registered.',
          fieldErrors: { email: ['This email is already taken.'] }
        };
      }
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
