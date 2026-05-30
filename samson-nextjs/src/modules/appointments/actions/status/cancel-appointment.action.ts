'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { userUpdateAppointmentStatusSchema, UserUpdateAppointmentStatusDto } from '../../dtos';
import { AppointmentStatusCommands } from '../../repositories';
import { UpdateAppointmentStatusUseCase } from '../../use-cases';

/**
 * Cancels an appointment on behalf of the patient.
 * Verifies ownership of the appointment prior to execution.
 */
export async function cancelAppointmentAction(formData: UserUpdateAppointmentStatusDto) {
  try {
    const validData = userUpdateAppointmentStatusSchema.parse(formData);
    if (validData.status !== 'CANCELLED') {
      return { success: false, error: 'Invalid action for cancellation endpoint' };
    }

    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    const statusCommands = new AppointmentStatusCommands(supabase);
    const appointment = await statusCommands.getAppointmentById(validData.appointmentId);
    const appointmentOwner = appointment.patientId || (appointment as { userId?: string }).userId;
    if (appointmentOwner !== user.id) {
      return { success: false, error: 'You are not authorized to cancel this appointment' };
    }

    const useCase = new UpdateAppointmentStatusUseCase(statusCommands);

    const result = await useCase.execute(
      validData.appointmentId,
      'CANCELLED',
      validData.statusReason
    );

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed: ' + error.issues[0].message };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (cancelAppointment):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
