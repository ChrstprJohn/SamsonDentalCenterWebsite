'use server';

import { getAuthenticatedUser, authorizeRole } from '@/shared/auth/auth.util';
import { GetAllUsersDto, getAllUsersSchema } from '../../dtos/exports';
import { getAllUsersUseCase } from '../../use-cases/exports';
import { getAllUsersQuery } from '../../repositories/exports';
import { ValidationError, UnauthorizedError } from '@/shared/errors';
import { createClient } from '@/shared/database/server';

export async function getAllUsersAction(params?: GetAllUsersDto) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new UnauthorizedError('You must be logged in.');
    }
    await authorizeRole('ADMIN');

    const parsed = getAllUsersSchema.safeParse(params || {});
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message);
    }

    const supabase = await createClient();
    const repo = getAllUsersQuery(supabase);
    const useCase = getAllUsersUseCase(repo);
    const users = await useCase(parsed.data);
    return { success: true, data: users };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}