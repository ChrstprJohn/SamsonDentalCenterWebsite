'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createManualBookingSchema, CreateManualBookingDto } from '../../dtos/booking/create-manual-booking.dto';
import { createManualBookingUseCase } from '../../use-cases/booking/create-manual-booking.use-case';
import { createManualBookingCommand } from '../../repositories/booking/create-manual-booking.command';

export async function createManualBookingAction(data: CreateManualBookingDto) {
  try {
    // 1. Zod input validation
    const parsed = createManualBookingSchema.parse(data);

    // 2. DI Setup & Auth boundary verification
    const user = await authorizeRole('SECRETARY');

    const supabase = await createClient();

    const useCase = createManualBookingUseCase({
      createManualBooking: createManualBookingCommand(supabase),
    });

    // 3. Execution
    const result = await useCase(parsed, user.id);

    const { scheduleAppointmentOutboxDispatch } = await import('@/shared/outbox/dispatch-appointment-outbox');
    await scheduleAppointmentOutboxDispatch(result.appointmentId);

    return { success: true, data: result };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed: ' + error.issues[0].message,
      };
    }
    console.error('ACTION ERROR (createManualBooking):', error);
    return { success: false, error: error.message || 'An unexpected system error occurred' };
  }
}
