"use server";

import { UpdateClinicConfigDto, updateClinicConfigSchema } from '../../dtos/settings/update-clinic-config.dto';
import { updateClinicConfigUseCase } from '../../use-cases/settings/update-clinic-config.use-case';
import { updateClinicConfigCommand } from '../../repositories/settings/clinic-config.commands';
import { createClient } from '../../../../shared/database/server';

export async function updateClinicConfigAction(data: UpdateClinicConfigDto) {
  try {
    // 1. Validation
    const parsed = updateClinicConfigSchema.parse(data);

    // 2. DI Setup
    const supabase = await createClient();
    const command = updateClinicConfigCommand(supabase);
    const useCase = updateClinicConfigUseCase(command);

    // 3. Execution
    const result = await useCase(parsed);
    return { data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to update clinic config" };
  }
}
