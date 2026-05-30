"use server";

import { GetServicesUseCase } from "../../use-cases/management/get-services.use-case";
import { ServiceQueriesRepository } from "../../repositories/management/service.queries";
import { createClient } from "../../../../shared/database/server";

export async function getServicesAction(includeInactive = false) {
  try {
    const supabase = await createClient();
    const repository = new ServiceQueriesRepository(supabase);
    const useCase = new GetServicesUseCase(repository);

    const result = await useCase.execute(includeInactive);
    return { data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch services" };
  }
}
