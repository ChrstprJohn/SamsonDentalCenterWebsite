'use server';

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { after } from 'next/server';
import { DomainError } from '@/shared/errors';
import { registerPatientSchema, RegisterPatientDto } from '../../dtos';
import { createPatientCommand } from '../../repositories';
import { registerPatientUseCase } from '../../use-cases';
import { processOutboxUseCase } from '../../../emails';

import { ActionResponse } from '@/shared/utils/action-response';

export async function registerPatientAction(formData: RegisterPatientDto): Promise<ActionResponse<any>> {
  try {
    const validData = registerPatientSchema.parse(formData);
    const supabaseAdmin = await createAdminClient();
    const repo = createPatientCommand(supabaseAdmin);
    const useCase = registerPatientUseCase(repo);
    
    // We no longer fetch a mock user ID, Supabase Auth handles it.
    const newPatient = await useCase(validData);
    
    // Non-blocking background worker trigger
    after(async () => {
      const processOutbox = processOutboxUseCase(supabaseAdmin);
      await processOutbox();
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
