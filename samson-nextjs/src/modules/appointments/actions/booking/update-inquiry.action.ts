'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { updateInquirySchema, UpdateInquiryDto } from '../../dtos/booking/update-inquiry.dto';
import { updateInquiryUseCase } from '../../use-cases/booking/update-inquiry.use-case';
import { updateInquiryCommand } from '../../repositories/booking/update-inquiry.command';

export async function updateInquiryAction(data: UpdateInquiryDto) {
  try {
    const parsed = updateInquirySchema.parse(data);

    const user = await getAuthenticatedUser();
    const role = user.user_metadata?.role || user.role;
    if (role !== 'SECRETARY' && role !== 'ADMIN') {
      throw new DomainError('Unauthorized: Access restricted to clinic staff.', 'UNAUTHORIZED_ACCESS');
    }

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
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (updateInquiry):', error);
    return { success: false, error: error.message || 'An unexpected system error occurred' };
  }
}
