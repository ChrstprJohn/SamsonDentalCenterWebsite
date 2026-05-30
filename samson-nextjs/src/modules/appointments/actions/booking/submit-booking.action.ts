'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { submitBookingSchema, SubmitBookingDto } from '../../dtos';
import {
  AppointmentAvailabilityQueries,
  AppointmentBookingCommands,
} from '../../repositories';
import {
  GetAvailabilityUseCase,
  SubmitBookingUseCase,
} from '../../use-cases';

/**
 * Submits an appointment booking request for the authenticated user.
 */
export async function submitBookingAction(formData: SubmitBookingDto) {
  try {
    const validData = submitBookingSchema.parse(formData);
    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    const availabilityQueries = new AppointmentAvailabilityQueries(supabase);
    const availabilityUseCase = new GetAvailabilityUseCase(availabilityQueries);

    const bookingCommands = new AppointmentBookingCommands(supabase);
    const useCase = new SubmitBookingUseCase(bookingCommands, availabilityUseCase);

    const appointment = await useCase.execute(user.id, validData);
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
