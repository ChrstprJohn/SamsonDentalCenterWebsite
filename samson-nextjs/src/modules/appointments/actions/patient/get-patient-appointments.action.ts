'use server';

import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { getAppointmentsByUserQuery } from '../../repositories';
import { getPatientAppointmentsUseCase } from '../../use-cases';

/**
 * Retrieves all appointments for the currently logged-in patient.
 */
export async function getPatientAppointmentsAction() {
  try {
    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    const useCase = getPatientAppointmentsUseCase(getAppointmentsByUserQuery(supabase));

    const appointments = await useCase(user.id);
    return { success: true, data: appointments };
  } catch (error) {
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (getPatientAppointments):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
