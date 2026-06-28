"use server";

import { CreateServiceDto, createServiceSchema } from '../../dtos/management/create-service.dto';
import { createServiceUseCase } from '../../use-cases/management/create-service.use-case';
import { createServiceCommand } from '../../repositories/management/service.commands';
import { createClient } from '../../../../shared/database/server';

export async function createServiceAction(data: CreateServiceDto) {
  try {
    // 1. Validation
    const parsed = createServiceSchema.parse(data);

    // 2. DI Setup
    const supabase = await createClient();
    const command = createServiceCommand(supabase);
    const useCase = createServiceUseCase(command);

    // 3. Execution
    const result = await useCase(parsed);
    return { data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to create service" };
  }
}
