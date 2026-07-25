'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole, getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { resolveNoShowSchema, ResolveNoShowDto } from '../../dtos/status/resolve-no-show.dto';
import { getAppointmentByIdQuery, updateAppointmentStatusTransactionCommand } from '../../repositories/exports';
import { resolveNoShowUseCase } from '../../use-cases/status/resolve-no-show.use-case';

export async function resolveNoShowAction(formData: ResolveNoShowDto) {
  try {
    await authorizeRole('SECRETARY');
    const user = await getAuthenticatedUser();

    const validData = resolveNoShowSchema.parse(formData);
    const supabase = await createClient();

    const useCase = resolveNoShowUseCase({
      getAppointmentById: getAppointmentByIdQuery(supabase),
      updateAppointmentStatusTransaction: updateAppointmentStatusTransactionCommand(supabase),
    });

    const rescheduleMetadata = validData.newDate && validData.newStartTime && validData.newEndTime && validData.newDoctorId
      ? {
          date: validData.newDate,
          startTime: validData.newStartTime,
          endTime: validData.newEndTime,
          doctorId: validData.newDoctorId,
        }
      : undefined;

    const result = await useCase(
      validData.appointmentId,
      user.id,
      'STAFF',
      validData.resolution,
      validData.reason,
      rescheduleMetadata
    );

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed: ' + error.issues[0].message };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (resolveNoShowAction):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
