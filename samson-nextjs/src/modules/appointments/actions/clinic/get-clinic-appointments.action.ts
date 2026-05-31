'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { getClinicAppointmentsSchema, GetClinicAppointmentsDto } from '../../dtos';
import { getAppointmentsByClinicQuery } from '../../repositories';
import { getClinicAppointmentsUseCase } from '../../use-cases';

/**
 * Retrieves all appointments matching given filters for the clinic/staff dashboard.
 * Restricts access to SECRETARY and ADMIN roles.
 */
export async function getClinicAppointmentsAction(formData: GetClinicAppointmentsDto) {
  try {
    // Assert SECRETARY or above role
    await authorizeRole('SECRETARY');

    const validFilters = getClinicAppointmentsSchema.parse(formData);
    const supabase = await createClient();

    const useCase = getClinicAppointmentsUseCase(getAppointmentsByClinicQuery(supabase));

    const appointments = await useCase(validFilters);
    return { success: true, data: appointments };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed: ' + error.issues[0].message,
      };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (getClinicAppointments):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
