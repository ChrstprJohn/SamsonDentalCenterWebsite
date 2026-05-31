'use server';

import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { getUserDependentsUseCase } from '../../use-cases';
import { getDependentsByPatientIdQuery } from '../../repositories';
import { UnauthorizedError } from '@/shared/errors';
import { createClient } from '@/shared/database/server';

export async function getUserDependentsAction(patientId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new UnauthorizedError('You must be logged in to view dependents.');
    }

    const supabase = await createClient();
    const repo = getDependentsByPatientIdQuery(supabase);
    const useCase = getUserDependentsUseCase(repo);
    const dependents = await useCase(patientId);
    return { success: true, data: dependents };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}