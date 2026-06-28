'use server';

import { getAuthenticatedUser, authorizeRole } from '@/shared/auth/auth.util';
import { AssignDoctorServicesDto, assignDoctorServicesSchema } from '../../dtos/exports';
import { assignDoctorServicesUseCase } from '../../use-cases/exports';
import { assignDoctorServicesCommand } from '../../repositories/exports';
import { ValidationError, UnauthorizedError, DomainError } from '@/shared/errors';
import { createClient } from '@/shared/database/server';

export async function assignDoctorServicesAction(data: AssignDoctorServicesDto) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new UnauthorizedError('You must be logged in.');
    }
    await authorizeRole('ADMIN');

    const parsed = assignDoctorServicesSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message);
    }

    const supabase = await createClient();
    const repo = assignDoctorServicesCommand(supabase);
    const useCase = assignDoctorServicesUseCase(repo);
    await useCase(parsed.data);

    return { success: true };
  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof UnauthorizedError || error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

