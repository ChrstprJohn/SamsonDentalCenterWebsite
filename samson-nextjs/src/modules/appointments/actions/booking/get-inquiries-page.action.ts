'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { getInquiriesPageSchema, type GetInquiriesPageDto } from '../../dtos/booking/get-inquiries-page.dto';
import { getInquiriesPageQuery } from '../../repositories/booking/appointment-inquiries-page.queries';

export async function getInquiriesPageAction(params: GetInquiriesPageDto) {
  try {
    await authorizeRole('SECRETARY');
    const validated = getInquiriesPageSchema.parse(params);
    const supabase = await createClient();
    const result = await getInquiriesPageQuery(supabase)(validated);
    return { success: true as const, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false as const, error: `Validation failed: ${error.issues[0].message}` };
    console.error('ACTION ERROR (getInquiriesPageAction):', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Could not load inquiries.' };
  }
}
