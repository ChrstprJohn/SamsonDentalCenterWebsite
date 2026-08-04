'use server';

import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { getCoordinationLogsByInquiryIdQuery } from '../../repositories/coordination/coordination.queries';

export async function getCoordinationLogsAction(inquiryId: string) {
  try {
    await authorizeRole('DOCTOR');

    const supabase = await createClient();
    const query = getCoordinationLogsByInquiryIdQuery(supabase);
    const result = await query(inquiryId);

    return { success: true, data: result };
  } catch (error: any) {
    console.error('ACTION ERROR (getCoordinationLogsAction):', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}
