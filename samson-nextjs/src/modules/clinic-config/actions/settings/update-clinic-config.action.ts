"use server";

import { UpdateClinicConfigDto, UpdateClinicConfigSchema } from "../../dtos/settings/update-clinic-config.dto";
import { UpdateClinicConfigUseCase } from "../../use-cases/settings/update-clinic-config.use-case";
import { ClinicConfigCommandsRepository } from "../../repositories/settings/clinic-config.commands";
import { createClient } from "../../../../shared/database/server";

export async function updateClinicConfigAction(data: UpdateClinicConfigDto) {
  try {
    // 1. Validation
    const parsed = UpdateClinicConfigSchema.parse(data);

    // 2. DI Setup
    const supabase = await createClient();
    const repository = new ClinicConfigCommandsRepository(supabase);
    const useCase = new UpdateClinicConfigUseCase(repository);

    // 3. Execution
    const result = await useCase.execute(parsed);
    return { data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to update clinic config" };
  }
}
