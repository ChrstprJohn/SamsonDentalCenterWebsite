'use server';

import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { getCoordinationLogsByInquiryIdQuery } from '../../repositories/coordination/coordination.queries';

export async function getCoordinationLogsAction(inquiryId: string) {
  try {
    const user = await getAuthenticatedUser();
    const role = user.user_metadata?.role || user.role;
    if (role !== 'SECRETARY' && role !== 'ADMIN' && role !== 'DOCTOR') {
      throw new DomainError('Unauthorized: Access restricted to clinic staff.', 'UNAUTHORIZED_ACCESS');
    }

    const supabase = await createClient();
    const query = getCoordinationLogsByInquiryIdQuery(supabase);
    const result = await query(inquiryId);

    return { success: true, data: result };
  } catch (error: any) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error('ACTION ERROR (getCoordinationLogsAction):', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}
