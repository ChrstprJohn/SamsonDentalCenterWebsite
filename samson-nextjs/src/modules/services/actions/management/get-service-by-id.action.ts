"use server";

import { GetServiceByIdUseCase } from "../../use-cases/management/get-service-by-id.use-case";
import { ServiceQueriesRepository } from "../../repositories/management/service.queries";
import { createClient } from "../../../../shared/database/server";

export async function getServiceByIdAction(id: string) {
  try {
    if (!id || typeof id !== "string") throw new Error("Invalid service ID");

    const supabase = await createClient();
    const repository = new ServiceQueriesRepository(supabase);
    const useCase = new GetServiceByIdUseCase(repository);

    const result = await useCase.execute(id);

    if (!result) {
      return { error: "Service not found" };
    }

    return { data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch service" };
  }
}
