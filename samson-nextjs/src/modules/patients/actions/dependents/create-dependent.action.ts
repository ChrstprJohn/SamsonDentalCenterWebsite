'use server';

import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { CreateDependentDto, createDependentSchema } from '../../dtos/exports';
import { createDependentUseCase } from '../../use-cases/exports';
import { addDependentCommand } from '../../repositories/exports';
import { ValidationError, UnauthorizedError } from '@/shared/errors';
import { createAdminClient } from '@/shared/database/server';

export async function createDependentAction(data: CreateDependentDto) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new UnauthorizedError('You must be logged in to add a dependent.');
    }

    const parsed = createDependentSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message);
    }

    const userRole = user.user_metadata?.role || (user as any).role;
    const isStaff = userRole === 'DOCTOR' || userRole === 'SECRETARY' || userRole === 'ADMIN';
    if (parsed.data.patientId !== user.id && !isStaff) {
      throw new UnauthorizedError('You are not authorized to add a dependent for another patient.');
    }

    const supabase = await createAdminClient();
    const repo = addDependentCommand(supabase);
    const useCase = createDependentUseCase(repo);
    const dependent = await useCase(parsed.data);
    return { success: true, data: dependent };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}