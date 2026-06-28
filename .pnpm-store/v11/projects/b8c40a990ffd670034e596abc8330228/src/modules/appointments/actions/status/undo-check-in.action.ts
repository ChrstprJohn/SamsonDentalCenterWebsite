'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole, getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { undoCheckInSchema, UndoCheckInDto } from '../../dtos/status/undo-check-in.dto';
import { getAppointmentByIdQuery, updateAppointmentStatusTransactionCommand } from '../../repositories/exports';
import { undoCheckInUseCase } from '../../use-cases/status/undo-check-in.use-case';

/**
 * Undoes a patient check-in, reverting status to APPROVED.
 * Restricted to SECRETARY and ADMIN roles.
 */
export async function undoCheckInAction(formData: UndoCheckInDto) {
  try {
    await authorizeRole('SECRETARY');
    const user = await getAuthenticatedUser();

    const validData = undoCheckInSchema.parse(formData);
    const supabase = await createClient();

    const useCase = undoCheckInUseCase({
      getAppointmentById: getAppointmentByIdQuery(supabase),
      updateAppointmentStatusTransaction: (
        appointmentId,
        actorId,
        actorRole,
        newStatus,
        reason,
        expectedStatus
      ) =>
        updateAppointmentStatusTransactionCommand(supabase)(
          appointmentId,
          actorId,
          actorRole,
          newStatus,
          reason,
          undefined, // rescheduleMetadata
          undefined, // clearProposedMetadata
          undefined, // rescheduleCount
          expectedStatus
        ),
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
    console.error('ACTION ERROR (undoCheckInAction):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
