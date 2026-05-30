'use server';

import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError, NotFoundError } from '@/shared/errors';
import { PatientProfileQueries } from '../../repositories';
import { GetPatientProfileUseCase } from '../../use-cases';

export async function getPatientProfileAction() {
  try {
    // 1. Auth Validation
    const user = await getAuthenticatedUser();

    // 2. Instantiate Repositories and Use-Cases
    const supabase = await createClient();
    const patientQueries = new PatientProfileQueries(supabase);
    const getPatientProfileUseCase = new GetPatientProfileUseCase(patientQueries);

    // 3. Execution (fetch the profile for the authenticated user)
    const profile = await getPatientProfileUseCase.execute(user.id);

    // 4. Output mapping
    return { success: true, data: profile };

  } catch (error) {
    if (error instanceof NotFoundError) {
      return { success: false, error: error.message };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }

    console.error('ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
