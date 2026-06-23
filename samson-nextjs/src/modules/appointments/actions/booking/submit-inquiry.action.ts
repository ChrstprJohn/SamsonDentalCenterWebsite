'use server';

import { createAdminClient } from '@/shared/database/server';
import { submitInquirySchema, SubmitInquiryDto } from '../../dtos/booking/submit-inquiry.dto';
import { createInquiryCommand } from '../../repositories/booking/appointment-inquiries.commands';
import { submitInquiryUseCase } from '../../use-cases/booking/submit-inquiry.use-case';

export async function submitInquiryAction(data: SubmitInquiryDto) {
  try {
    // 1. Zod input validation
    const parsed = submitInquirySchema.parse(data);

    // 2. DI Setup (Functional)
    const supabase = await createAdminClient();
    const repoCommand = createInquiryCommand(supabase);
    const useCase = submitInquiryUseCase({ createInquiry: repoCommand });

    // 3. Execution
    const result = await useCase(parsed);
    return { success: true, data: result };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to submit booking inquiry',
    };
  }
}
