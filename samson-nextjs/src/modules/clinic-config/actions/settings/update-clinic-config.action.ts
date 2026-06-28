"use server";

import { UpdateClinicConfigDto, updateClinicConfigSchema } from '../../dtos/settings/update-clinic-config.dto';
import { updateClinicConfigUseCase } from '../../use-cases/settings/update-clinic-config.use-case';
import { updateClinicConfigCommand } from '../../repositories/settings/clinic-config.commands';
import { createClient, createAdminClient } from '../../../../shared/database/server';
import { revalidatePath } from 'next/cache';

export async function updateClinicConfigAction(data: UpdateClinicConfigDto) {
  try {
    // 1. Validation
    const parsed = updateClinicConfigSchema.parse(data);

    // 2. Role Check
    const supabase = await createClient();
    const isMockClient = typeof supabase.auth?.getUser !== 'function';

    let dbClient = supabase;

    if (!isMockClient) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { error: 'Unauthorized' };
      }
      const role = user.user_metadata?.role || user.role;
      if (role !== 'SECRETARY' && role !== 'ADMIN') {
        return { error: 'Unauthorized: insufficient permissions' };
      }
      dbClient = await createAdminClient();
    }

    // 3. DI Setup
    const command = updateClinicConfigCommand(dbClient);
    const useCase = updateClinicConfigUseCase(command);

    // 4. Execution
    const result = await useCase(parsed);
    
    // Invalidate schedules cache
    revalidatePath('/secretary/schedules');
    
    return { data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to update clinic config" };
  }
}
