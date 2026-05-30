'use server';

import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { PatientAppointmentsQueries } from '../../repositories';
import { GetPatientAppointmentsUseCase } from '../../use-cases';

/**
 * Retrieves all appointments for the currently logged-in patient.
 */
export async function getPatientAppointmentsAction() {
  try {
    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    const patientQueries = new PatientAppointmentsQueries(supabase);
    const useCase = new GetPatientAppointmentsUseCase(patientQueries);

    const appointments = await useCase.execute(user.id);
    return { success: true, data: appointments };
  } catch (error) {
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (getPatientAppointments):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
