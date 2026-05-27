'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { registerPatientSchema, RegisterPatientDto } from '../dtos/register-patient.dto';
import { PatientProfileCommands } from '../repositories/patient-profile.commands';
import { RegisterPatientUseCase } from '../use-cases/register-patient.use-case';

export async function registerPatientAction(formData: RegisterPatientDto) {
  try {
    // 1. Zod Validation (Never trust the UI layer)
    const validData = registerPatientSchema.parse(formData);

    // 2. Auth Context (who is making this request?)
    const user = await getAuthenticatedUser();

    // 3. Dependency Injection (Wire up the DB -> Repo -> UseCase)
    const supabase = await createClient();
    const commandsRepo = new PatientProfileCommands(supabase);
    const useCase = new RegisterPatientUseCase(commandsRepo);

    // 4. Execution
    const newPatient = await useCase.execute(user.id, validData);

    // 5. Output mapping (never throw raw errors back to the client UI)
    return { success: true, data: newPatient };

  } catch (error) {
     if (error instanceof z.ZodError) {
     // Use .issues for better compatibility or cast the error
     const zodError = error as z.ZodError;
     return { 
     success: false, 
     error: 'Validation failed: ' + zodError.issues[0].message 
     };
}
    
    if (error instanceof DomainError) {
      // Safely pass Business logic errors to UI (e.g. "Database Error")
      return { success: false, error: error.message };
    }

    // Catch-all
    console.error('ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}