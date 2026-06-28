"use server";

import { getServiceByIdUseCase } from '../../use-cases/management/get-service-by-id.use-case';
import { getServiceByIdQuery } from '../../repositories/management/service.queries';
import { createClient } from '../../../../shared/database/server';

export async function getServiceByIdAction(id: string) {
  try {
    if (!id || typeof id !== "string") throw new Error("Invalid service ID");

    const supabase = await createClient();
    const query = getServiceByIdQuery(supabase);
    const useCase = getServiceByIdUseCase(query);

    const result = await useCase(id);

    if (!result) {
      return { error: "Service not found" };
    }

    return { data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch service" };
  }
}
