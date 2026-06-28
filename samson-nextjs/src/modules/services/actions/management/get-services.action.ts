"use server";

import { getServicesUseCase } from '../../use-cases/management/get-services.use-case';
import { getServicesQuery } from '../../repositories/management/service.queries';
import { createClient } from '../../../../shared/database/server';

export async function getServicesAction(includeInactive: boolean | 'ALL' | 'BOOKABLE' = false) {
  try {
    const supabase = await createClient();
    const query = getServicesQuery(supabase);
    const useCase = getServicesUseCase(query);

    const result = await useCase(includeInactive);
    return { data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch services" };
  }
}
