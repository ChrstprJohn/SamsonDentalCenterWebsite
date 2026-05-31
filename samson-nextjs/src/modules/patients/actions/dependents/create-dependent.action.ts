'use server';

import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { CreateDependentDto, createDependentSchema } from '../../dtos';
import { createDependentUseCase } from '../../use-cases';
import { addDependentCommand } from '../../repositories';
import { ValidationError, UnauthorizedError } from '@/shared/errors';
import { createClient } from '@/shared/database/server';

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

    const supabase = await createClient();
    const repo = addDependentCommand(supabase);
    const useCase = createDependentUseCase(repo);
    const dependent = await useCase(parsed.data);
    return { success: true, data: dependent };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}