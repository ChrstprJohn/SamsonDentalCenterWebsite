"use server";

import { deleteServiceUseCase } from "../../use-cases/management/delete-service.use-case";
import { deleteServiceCommand } from "../../repositories/management/service.commands";
import { createClient } from "../../../../shared/database/server";

export async function deleteServiceAction(id: string) {
  try {
    if (!id || typeof id !== "string") throw new Error("Invalid ID");

    const supabase = await createClient();
    const command = deleteServiceCommand(supabase);
    const useCase = deleteServiceUseCase(command);

    await useCase(id);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete service" };
  }
}
