"use server";

import { UpdateServiceDto, updateServiceSchema } from "../../dtos/management/update-service.dto";
import { UpdateServiceUseCase } from "../../use-cases/management/update-service.use-case";
import { ServiceCommandsRepository } from "../../repositories/management/service.commands";
import { createClient } from "../../../../shared/database/server";

export async function updateServiceAction(data: UpdateServiceDto) {
  try {
    // 1. Validation
    const parsed = updateServiceSchema.parse(data);

    // 2. DI Setup
    const supabase = await createClient();
    const repository = new ServiceCommandsRepository(supabase);
    const useCase = new UpdateServiceUseCase(repository);

    // 3. Execution
    const result = await useCase.execute(parsed);
    return { data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to update service" };
  }
}
