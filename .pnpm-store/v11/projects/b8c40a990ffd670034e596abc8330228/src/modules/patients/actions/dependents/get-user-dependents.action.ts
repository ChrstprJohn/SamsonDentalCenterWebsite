'use server';

import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { getUserDependentsUseCase } from '../../use-cases/exports';
import { getDependentsByPatientIdQuery } from '../../repositories/exports';
import { UnauthorizedError } from '@/shared/errors';
import { createAdminClient } from '@/shared/database/server';

export async function getUserDependentsAction(patientId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new UnauthorizedError('You must be logged in to view dependents.');
    }

    const userRole = user.user_metadata?.role || (user as any).role;
    const isStaff = userRole === 'DOCTOR' || userRole === 'SECRETARY' || userRole === 'ADMIN';
    if (user.id !== patientId && !isStaff) {
      throw new UnauthorizedError('You are not authorized to view these dependents.');
    }

    const supabase = await createAdminClient();
    const repo = getDependentsByPatientIdQuery(supabase);
    const useCase = getUserDependentsUseCase(repo);
    const dependents = await useCase(patientId);
    console.log(dependents)
    return { success: true, data: dependents };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}