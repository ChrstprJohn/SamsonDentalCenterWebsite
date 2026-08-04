'use server';

import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { getActiveDoctorsQuery } from '../../repositories/exports';
import { getDoctorsUseCase } from '../../use-cases/exports';

export async function getDoctorsAction(params?: { serviceId?: string; includeHidden?: boolean }) {
  try {
    if (params?.includeHidden) {
      await authorizeRole('SECRETARY');
    }

    // This action is also used by public booking availability. The query only
    // returns the safe doctor directory projection, while the admin client
    // prevents the users RLS policy from turning that read into a public
    // users-table grant.
    const supabase = await createAdminClient();
    const query = getActiveDoctorsQuery(supabase);
    const useCase = getDoctorsUseCase(query);
    const doctors = await useCase(params?.serviceId, params?.includeHidden ?? false);
    return { success: true, data: doctors };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch doctors' };
  }
}
