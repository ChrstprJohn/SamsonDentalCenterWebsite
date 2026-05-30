'use server';

import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { CreateDependentDto, createDependentSchema } from '../../dtos';
import { CreateDependentUseCase } from '../../use-cases';
import { PatientDependentsCommands } from '../../repositories';
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
    const commands = new PatientDependentsCommands(supabase);
    const useCase = new CreateDependentUseCase(commands);
    const dependent = await useCase.execute(parsed.data);
    return { success: true, data: dependent };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}