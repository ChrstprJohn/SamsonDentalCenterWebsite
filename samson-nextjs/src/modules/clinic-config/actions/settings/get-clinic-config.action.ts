"use server";

import { GetClinicConfigUseCase } from "../../use-cases/settings/get-clinic-config.use-case";
import { ClinicConfigQueriesRepository } from "../../repositories/settings/clinic-config.queries";
import { createClient } from "../../../../shared/database/server";

export async function getClinicConfigAction() {
  try {
    const supabase = await createClient();
    const repository = new ClinicConfigQueriesRepository(supabase);
    const useCase = new GetClinicConfigUseCase(repository);

    const result = await useCase.execute();
    return { data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch clinic config" };
  }
}
