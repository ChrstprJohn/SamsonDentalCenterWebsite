'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole, getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { staffUpdateAppointmentStatusSchema, StaffUpdateAppointmentStatusDto } from '../../dtos/exports';
import { getAppointmentByIdQuery, updateStatusCommand, incrementUserCredibilityMetricCommand, insertLedgerEntryCommand } from '../../repositories/exports';
import { updateAppointmentStatusUseCase } from '../../use-cases/exports';

/**
 * Updates an appointment status on behalf of a clinic staff member.
 * Restricts access to SECRETARY and ADMIN roles.
 */
export async function updateAppointmentStatusAction(formData: StaffUpdateAppointmentStatusDto) {
  try {
    // Assert SECRETARY or above role
    await authorizeRole('SECRETARY');
    const user = await getAuthenticatedUser();

    const validData = staffUpdateAppointmentStatusSchema.parse(formData);
    const supabase = await createClient();

    const useCase = updateAppointmentStatusUseCase({
      getAppointmentById: getAppointmentByIdQuery(supabase),
      updateStatus: updateStatusCommand(supabase),
      incrementUserCredibilityMetric: incrementUserCredibilityMetricCommand(supabase),
      insertLedgerEntry: insertLedgerEntryCommand(supabase),
    });

    // Format optional reschedule metadata
    const rescheduleMetadata =
      validData.newDate && validData.newStartTime && validData.newEndTime && validData.newDoctorId
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
      validData.status,
      validData.statusReason || undefined,
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
    console.error('ACTION ERROR (updateAppointmentStatus):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
