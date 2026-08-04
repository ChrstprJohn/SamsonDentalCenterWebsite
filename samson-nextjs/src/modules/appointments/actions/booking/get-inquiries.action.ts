'use server';

import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { getInquiriesQuery, InquiryStatus } from '../../repositories/exports';

/**
 * Server Action for fetching appointment inquiries by status.
 * Restricts access to SECRETARY or ADMIN roles.
 */
export async function getInquiriesAction(status?: InquiryStatus) {
  try {
    await authorizeRole('SECRETARY');

    const supabase = await createClient();
    const query = getInquiriesQuery(supabase);
    const result = await query(status);

    return { success: true, data: result };
  } catch (error: any) {
    console.error('ACTION ERROR (getInquiriesAction):', error);
    return { success: false, error: error.message || 'An unexpected system error occurred' };
  }
}
