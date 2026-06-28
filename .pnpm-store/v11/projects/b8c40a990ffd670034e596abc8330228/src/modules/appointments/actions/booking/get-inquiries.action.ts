'use server';

import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { getInquiriesQuery } from '../../repositories/exports';

/**
 * Server Action for fetching NEW appointment inquiries.
 * Restricts access to SECRETARY or ADMIN roles.
 */
export async function getInquiriesAction() {
  try {
    // 1. Auth boundary verification
    const user = await getAuthenticatedUser();
    const role = user.user_metadata?.role || user.role;
    if (role !== 'SECRETARY' && role !== 'ADMIN') {
      throw new DomainError('Unauthorized: Access restricted to clinic staff.', 'UNAUTHORIZED_ACCESS');
    }

    // 2. DI Setup
    const supabase = await createClient();
    const query = getInquiriesQuery(supabase);

    // 3. Execution
    const result = await query();

    return { success: true, data: result };
  } catch (error: any) {
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (getInquiriesAction):', error);
    return { success: false, error: error.message || 'An unexpected system error occurred' };
  }
}
