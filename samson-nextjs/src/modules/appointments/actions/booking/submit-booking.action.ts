'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { submitBookingSchema, SubmitBookingDto } from '../../dtos';
import {
  getDoctorSchedulesQuery,
  getExistingAppointmentsQuery,
  getServiceDurationQuery,
  resolveDoctorDisplayNameQuery,
  createAppointmentCommand,
} from '../../repositories';
import {
  getAvailableTimeSlotsUseCase,
  submitBookingUseCase,
} from '../../use-cases';

/**
 * Submits an appointment booking request for the authenticated user.
 */
export async function submitBookingAction(formData: SubmitBookingDto) {
  try {
    const validData = submitBookingSchema.parse(formData);
    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    const getAvailableTimeSlots = getAvailableTimeSlotsUseCase({
      getServiceDuration: getServiceDurationQuery(supabase),
      getDoctorSchedules: getDoctorSchedulesQuery(supabase),
      getExistingAppointments: getExistingAppointmentsQuery(supabase),
      resolveDoctorDisplayName: resolveDoctorDisplayNameQuery(supabase),
    });

    const { addDependentCommand } = await import('@/modules/patients/repositories');
    const createDependent = addDependentCommand(supabase);

    const useCase = submitBookingUseCase({
      createAppointment: createAppointmentCommand(supabase),
      createDependent,
      getAvailableTimeSlots,
    });

    const appointment = await useCase(user.id, validData);
    return { success: true, data: appointment };
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
    console.error('ACTION ERROR (submitBooking):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
