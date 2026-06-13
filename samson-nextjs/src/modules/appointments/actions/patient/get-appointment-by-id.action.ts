'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { getAppointmentByIdSchema } from '../../dtos/patient/get-appointment-by-id.dto';
import { getAppointmentByIdQuery } from '../../repositories';
import { getAppointmentByIdUseCase } from '../../use-cases/patient/get-appointment-by-id.use-case';

/**
 * Retrieves a specific appointment by its ID.
 * Verifies ownership of the appointment (belongs to the logged-in patient) prior to returning it.
 */
export async function getAppointmentByIdAction(appointmentId: string) {
  try {
    // 1. Zod input validation
    const { appointmentId: parsedId } = getAppointmentByIdSchema.parse({ appointmentId });

    // 2. Fetch authenticated user
    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    // 3. Retrieve appointment & enforce ownership
    const getAppointmentById = getAppointmentByIdQuery(supabase);
    const useCase = getAppointmentByIdUseCase(getAppointmentById);
    const appointment = await useCase(parsedId);

    if (appointment.patientId !== user.id) {
      return { success: false, error: 'You are not authorized to view this appointment' };
    }

    return { success: true, data: appointment };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed: ' + error.issues[0].message };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (getAppointmentById):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
