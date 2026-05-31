'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { registerPatientSchema, RegisterPatientDto } from '../../dtos';
import { createPatientCommand } from '../../repositories';
import { registerPatientUseCase } from '../../use-cases';

export async function registerPatientAction(formData: RegisterPatientDto) {
  try {
    const validData = registerPatientSchema.parse(formData);
    const user = await getAuthenticatedUser();
    const supabase = await createClient();
    const repo = createPatientCommand(supabase);
    const useCase = registerPatientUseCase(repo);
    const newPatient = await useCase(user.id, validData);
    return { success: true, data: newPatient };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed: ' + error.issues[0].message,
      };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}

