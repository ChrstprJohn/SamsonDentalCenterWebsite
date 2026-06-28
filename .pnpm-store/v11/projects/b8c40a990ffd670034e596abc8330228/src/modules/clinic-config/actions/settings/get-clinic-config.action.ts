"use server";

import { getClinicConfigUseCase } from '../../use-cases/settings/get-clinic-config.use-case';
import { getClinicConfigQuery } from '../../repositories/settings/clinic-config.queries';
import { createClient } from '../../../../shared/database/server';

export async function getClinicConfigAction() {
  try {
    const supabase = await createClient();
    const query = getClinicConfigQuery(supabase);
    const useCase = getClinicConfigUseCase(query);

    const result = await useCase();
    return { data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch clinic config" };
  }
}
