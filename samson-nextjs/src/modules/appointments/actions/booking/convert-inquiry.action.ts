'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { convertInquirySchema, ConvertInquiryDto } from '../../dtos/booking/convert-inquiry.dto';
import { convertInquiryUseCase } from '../../use-cases/booking/convert-inquiry.use-case';
import { convertInquiryToAppointmentCommand } from '../../repositories/booking/appointment-conversion.commands';

export async function convertInquiryAction(data: ConvertInquiryDto) {
  try {
    // 1. Zod input validation
    const parsed = convertInquirySchema.parse(data);

    // 2. DI Setup & Auth boundary verification
    const user = await authorizeRole('SECRETARY');

    const supabase = await createClient();

    const useCase = convertInquiryUseCase({
      executeConversionTransaction: convertInquiryToAppointmentCommand(supabase),
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
    console.error('ACTION ERROR (convertInquiry):', error);
    return { success: false, error: error.message || 'An unexpected system error occurred' };
  }
}
