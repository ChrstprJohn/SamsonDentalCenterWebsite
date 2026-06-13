'use server';

import { createClient } from '@/shared/database/server';
import { getActiveDoctorsQuery } from '../../repositories/exports';
import { getDoctorsUseCase } from '../../use-cases/exports';

export async function getDoctorsAction(params?: { serviceId?: string }) {
  try {
    const supabase = await createClient();
    const query = getActiveDoctorsQuery(supabase);
    const useCase = getDoctorsUseCase(query);
    const doctors = await useCase(params?.serviceId);
    return { success: true, data: doctors };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch doctors' };
  }
}
