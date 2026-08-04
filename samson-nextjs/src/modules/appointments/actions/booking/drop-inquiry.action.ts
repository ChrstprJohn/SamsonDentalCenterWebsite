'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { dropInquirySchema, DropInquiryDto } from '../../dtos/booking/drop-inquiry.dto';
import { dropInquiryCommand } from '../../repositories/booking/appointment-inquiries.commands';
import { dropInquiryUseCase } from '../../use-cases/booking/drop-inquiry.use-case';

export async function dropInquiryAction(data: DropInquiryDto) {
  try {
    // 1. Zod input validation
    const parsed = dropInquirySchema.parse(data);

    // 2. DI Setup & Auth boundary verification
    await authorizeRole('SECRETARY');

    const supabase = await createClient();
    const useCase = dropInquiryUseCase({
      dropInquiry: dropInquiryCommand(supabase),
    });

    // 3. Execution
    const result = await useCase(parsed);
    return { success: true, data: result };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed: ' + error.issues[0].message,
      };
    }
    console.error('ACTION ERROR (dropInquiry):', error);
    return { success: false, error: error.message || 'An unexpected system error occurred' };
  }
}
