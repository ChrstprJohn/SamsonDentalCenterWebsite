'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole, getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { checkInSchema, CheckInDto } from '../../dtos/status/check-in.dto';
import { getAppointmentByIdQuery, updateAppointmentStatusTransactionCommand } from '../../repositories/exports';
import { checkInUseCase } from '../../use-cases/status/check-in.use-case';

/**
 * Checks in a patient for their appointment.
 * Restricted to SECRETARY and ADMIN roles.
 */
export async function checkInAction(formData: CheckInDto) {
  try {
    await authorizeRole('SECRETARY');
    const user = await getAuthenticatedUser();

    const validData = checkInSchema.parse(formData);
    const supabase = await createClient();

    const useCase = checkInUseCase({
      getAppointmentById: getAppointmentByIdQuery(supabase),
      updateAppointmentStatusTransaction: updateAppointmentStatusTransactionCommand(supabase),
    });

    const result = await useCase(
      validData.appointmentId,
      user.id,
      'STAFF'
    );

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed: ' + error.issues[0].message };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (checkInAction):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
