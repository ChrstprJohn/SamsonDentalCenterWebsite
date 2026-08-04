'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { updateInquirySchema, UpdateInquiryDto } from '../../dtos/booking/update-inquiry.dto';
import { updateInquiryUseCase } from '../../use-cases/booking/update-inquiry.use-case';
import { updateInquiryCommand } from '../../repositories/booking/update-inquiry.command';

export async function updateInquiryAction(data: UpdateInquiryDto) {
  try {
    const parsed = updateInquirySchema.parse(data);

    await authorizeRole('SECRETARY');

    const supabase = await createClient();
    const useCase = updateInquiryUseCase({
      executeUpdate: updateInquiryCommand(supabase),
    });

    await useCase(parsed);

    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed: ' + error.issues[0].message,
      };
    }
    console.error('ACTION ERROR (updateInquiry):', error);
    return { success: false, error: error.message || 'An unexpected system error occurred' };
  }
}
