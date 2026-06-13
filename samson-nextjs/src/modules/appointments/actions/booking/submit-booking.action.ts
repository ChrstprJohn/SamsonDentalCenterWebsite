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
  executeBookingTransactionCommand,
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
    const duration = getServiceDurationQuery(supabase)(validData.serviceId);

    const getAvailableTimeSlots = getAvailableTimeSlotsUseCase({
      duration,
      getDoctorSchedules: getDoctorSchedulesQuery(supabase),
      getExistingAppointments: getExistingAppointmentsQuery(supabase),
    });

    const useCase = submitBookingUseCase({
      executeBookingTransaction: executeBookingTransactionCommand(supabase),
      getAvailableTimeSlots,
    });

    const appointment = await useCase(user.id, validData);
    
    // Non-blocking outbox processing for side effects
    const { after } = await import('next/server');
    const { bootstrapEventSubscribers } = await import('@/orchestrators/event-subscribers');
    const { globalOutboxDispatcher } = await import('@/shared/outbox/outbox.dispatcher');
    const { createAdminClient } = await import('@/shared/database/server');

    after(async () => {
      bootstrapEventSubscribers();
      await globalOutboxDispatcher(await createAdminClient())();
    });

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
