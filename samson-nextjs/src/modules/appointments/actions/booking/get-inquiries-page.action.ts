'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { getInquiriesPageSchema, type GetInquiriesPageDto } from '../../dtos/booking/get-inquiries-page.dto';
import { getInquiriesPageQuery } from '../../repositories/booking/appointment-inquiries-page.queries';

export async function getInquiriesPageAction(params: GetInquiriesPageDto) {
  try {
    const user = await getAuthenticatedUser();
    const role = user.user_metadata?.role || user.role;
    if (role !== 'SECRETARY' && role !== 'ADMIN') {
      throw new DomainError('Unauthorized: Access restricted to clinic staff.', 'UNAUTHORIZED_ACCESS');
    }
    const validated = getInquiriesPageSchema.parse(params);
    const supabase = await createClient();
    const result = await getInquiriesPageQuery(supabase)(validated);
    return { success: true as const, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false as const, error: `Validation failed: ${error.issues[0].message}` };
    if (error instanceof DomainError) return { success: false as const, error: error.message };
    console.error('ACTION ERROR (getInquiriesPageAction):', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Could not load inquiries.' };
  }
}
