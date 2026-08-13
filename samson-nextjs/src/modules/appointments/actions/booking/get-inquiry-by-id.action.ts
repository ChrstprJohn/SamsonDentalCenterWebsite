'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { getInquiryByIdQuery } from '../../repositories/booking/appointment-inquiries.queries';

const getInquiryByIdSchema = z.object({
  inquiryId: z.string().uuid(),
});

/**
 * Retrieves a single appointment inquiry by id for the secretary pending queue
 * (deep link support: /secretary-v2/pending?id=...).
 */
export async function getInquiryByIdAction(inquiryId: string) {
  try {
    await authorizeRole('SECRETARY');
    const { inquiryId: parsedId } = getInquiryByIdSchema.parse({ inquiryId });
    const supabase = await createClient();

    const getInquiryById = getInquiryByIdQuery(supabase);
    const inquiry = await getInquiryById(parsedId);

    return { success: true as const, data: inquiry };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: 'Validation failed: ' + error.issues[0].message };
    }
    if (error instanceof DomainError) {
      return { success: false as const, error: error.message };
    }
    console.error('ACTION ERROR (getInquiryByIdAction):', error);
    return { success: false as const, error: 'An unexpected system error occurred' };
  }
}
