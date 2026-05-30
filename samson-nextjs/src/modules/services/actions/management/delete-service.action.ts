"use server";

import { DeleteServiceUseCase } from "../../use-cases/management/delete-service.use-case";
import { ServiceCommandsRepository } from "../../repositories/management/service.commands";
import { createClient } from "../../../../shared/database/server";

export async function deleteServiceAction(id: string) {
  try {
    if (!id || typeof id !== "string") throw new Error("Invalid ID");

    const supabase = await createClient();
    const repository = new ServiceCommandsRepository(supabase);
    const useCase = new DeleteServiceUseCase(repository);

    await useCase.execute(id);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete service" };
  }
}
