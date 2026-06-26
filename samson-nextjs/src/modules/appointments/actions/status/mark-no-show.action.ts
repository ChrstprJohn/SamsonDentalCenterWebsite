'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole, getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { markNoShowSchema, MarkNoShowDto } from '../../dtos/status/mark-no-show.dto';
import { getAppointmentByIdQuery, updateAppointmentStatusTransactionCommand } from '../../repositories/exports';
import { markNoShowUseCase } from '../../use-cases/status/mark-no-show.use-case';

/**
 * Marks an appointment as a no-show.
 * Restricted to SECRETARY and ADMIN roles.
 */
export async function markNoShowAction(formData: MarkNoShowDto) {
  try {
    await authorizeRole('SECRETARY');
    const user = await getAuthenticatedUser();

    const validData = markNoShowSchema.parse(formData);
    const supabase = await createClient();

    const useCase = markNoShowUseCase({
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
    console.error('ACTION ERROR (markNoShowAction):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
