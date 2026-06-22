'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { convertInquirySchema, ConvertInquiryDto } from '../../dtos/booking/convert-inquiry.dto';
import { getDoctorSchedulesQuery, getExistingAppointmentsQuery, getServiceDurationQuery } from '../../repositories/exports';
import { getAvailableTimeSlotsUseCase } from '../../use-cases/exports';
import { convertInquiryUseCase } from '../../use-cases/booking/convert-inquiry.use-case';
import { convertInquiryToAppointmentCommand } from '../../repositories/booking/appointment-conversion.commands';

export async function convertInquiryAction(data: ConvertInquiryDto) {
  try {
    // 1. Zod input validation
    const parsed = convertInquirySchema.parse(data);

    // 2. DI Setup & Auth boundary verification
    const user = await getAuthenticatedUser();
    
    // Auth Role validation (Must be SECRETARY or ADMIN to execute conversion)
    if (user.role !== 'SECRETARY' && user.role !== 'ADMIN') {
      throw new DomainError('Unauthorized: Access restricted to clinic staff.', 'UNAUTHORIZED_ACCESS');
    }

    const supabase = await createClient();
    const duration = getServiceDurationQuery(supabase)(parsed.serviceId);

    const getAvailableTimeSlots = getAvailableTimeSlotsUseCase({
      duration,
      getDoctorSchedules: getDoctorSchedulesQuery(supabase),
      getExistingAppointments: getExistingAppointmentsQuery(supabase),
    });

    const useCase = convertInquiryUseCase({
      executeConversionTransaction: convertInquiryToAppointmentCommand(supabase),
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
    console.error('ACTION ERROR (convertInquiry):', error);
    return { success: false, error: error.message || 'An unexpected system error occurred' };
  }
}
