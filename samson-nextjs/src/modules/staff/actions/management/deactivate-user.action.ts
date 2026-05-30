'use server';

import { getAuthenticatedUser, authorizeRole } from '@/shared/auth/auth.util';
import { DeactivateUserDto, deactivateUserSchema } from '../../dtos';
import { DeactivateUserUseCase } from '../../use-cases';
import { UserManagementCommands } from '../../repositories';
import { ValidationError, UnauthorizedError } from '@/shared/errors';
import { createClient } from '@/shared/database/server';

export async function deactivateUserAction(data: DeactivateUserDto) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new UnauthorizedError('You must be logged in.');
    }
    await authorizeRole('ADMIN');

    const parsed = deactivateUserSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message);
    }

    const supabase = await createClient();
    const commands = new UserManagementCommands(supabase);
    const useCase = new DeactivateUserUseCase(commands);
    await useCase.execute(parsed.data);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}