'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { createManualBookingSchema, CreateManualBookingDto } from '../../dtos/booking/create-manual-booking.dto';
import { getDoctorSchedulesQuery, getExistingAppointmentsQuery, getServiceDurationQuery } from '../../repositories/exports';
import { getAvailableTimeSlotsUseCase } from '../../use-cases/exports';
import { createManualBookingUseCase } from '../../use-cases/booking/create-manual-booking.use-case';
import { createManualBookingCommand } from '../../repositories/booking/create-manual-booking.command';

export async function createManualBookingAction(data: CreateManualBookingDto) {
  try {
    // 1. Zod input validation
    const parsed = createManualBookingSchema.parse(data);

    // 2. DI Setup & Auth boundary verification
    const user = await getAuthenticatedUser();
    
    // Auth Role validation (Must be SECRETARY or ADMIN to manually book)
    const role = user.user_metadata?.role || user.role;
    if (role !== 'SECRETARY' && role !== 'ADMIN') {
      throw new DomainError('Unauthorized: Access restricted to clinic staff.', 'UNAUTHORIZED_ACCESS');
    }

    const supabase = await createClient();
    const duration = getServiceDurationQuery(supabase)(parsed.serviceId);

    const getAvailableTimeSlots = getAvailableTimeSlotsUseCase({
      duration,
      getDoctorSchedules: getDoctorSchedulesQuery(supabase),
      getExistingAppointments: getExistingAppointmentsQuery(supabase),
    });

    const useCase = createManualBookingUseCase({
      createManualBooking: createManualBookingCommand(supabase),
      getAvailableTimeSlots,
    });

    // 3. Execution
    const result = await useCase(parsed, user.id);

    // Non-blocking outbox processing for async side-effects
    const { after } = await import('next/server');
    const { bootstrapEventSubscribers } = await import('@/orchestrators/event-subscribers');
    const { globalOutboxDispatcher } = await import('@/shared/outbox/outbox.dispatcher');
    const { createAdminClient } = await import('@/shared/database/server');

    after(async () => {
      bootstrapEventSubscribers();
      await globalOutboxDispatcher(await createAdminClient())();
    });

    return { success: true, data: result };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed: ' + error.issues[0].message,
      };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (createManualBooking):', error);
    return { success: false, error: error.message || 'An unexpected system error occurred' };
  }
}
