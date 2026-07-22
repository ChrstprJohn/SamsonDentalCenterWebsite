'use server';

import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { getInquiriesQuery, InquiryStatus } from '../../repositories/exports';

/**
 * Server Action for fetching appointment inquiries by status.
 * Restricts access to SECRETARY or ADMIN roles.
 */
export async function getInquiriesAction(status?: InquiryStatus) {
  try {
    const user = await getAuthenticatedUser();
    const role = user.user_metadata?.role || user.role;
    if (role !== 'SECRETARY' && role !== 'ADMIN') {
      throw new DomainError('Unauthorized: Access restricted to clinic staff.', 'UNAUTHORIZED_ACCESS');
    }

    const supabase = await createClient();
    const query = getInquiriesQuery(supabase);
    const result = await query(status);

    return { success: true, data: result };
  } catch (error: any) {
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (getInquiriesAction):', error);
    return { success: false, error: error.message || 'An unexpected system error occurred' };
  }
}
