'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { registerPatientSchema, RegisterPatientDto } from '../../dtos';
import { PatientProfileCommands } from '../../repositories';
import { RegisterPatientUseCase } from '../../use-cases';

export async function registerPatientAction(formData: RegisterPatientDto) {
  try {
    // 1. Zod Validation or Form Validation
    const validData = registerPatientSchema.parse(formData);

    // 2. Auth Validation 
    const user = await getAuthenticatedUser();

    // 3. Instantiate Repositories and Use-Cases (inject dependencies)
    const supabase = await createClient();
    const patientRepository = new PatientProfileCommands(supabase);
    const registerPatientUseCase = new RegisterPatientUseCase(patientRepository);

    // 4. Execution
    const newPatient = await registerPatientUseCase.execute(user.id, validData);

    // 5. Output mapping 
    return { success: true, data: newPatient };

  } catch (error) {
     if (error instanceof z.ZodError) {
     const zodError = error as z.ZodError;
     return { 
     success: false, 
     error: 'Validation failed: ' + zodError.issues[0].message 
     };
}
    
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }

    // Catch-all
    console.error('ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
