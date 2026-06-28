"use server";

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { toggleServiceVisibilityUseCase } from '../../use-cases/management/toggle-service-visibility.use-case';
import { toggleServiceVisibilityCommand } from '../../repositories/management/service.commands';

export async function toggleServiceVisibilityAction(id: string, currentIsActive: boolean) {
  try {
    // 1. Session verification
    await authorizeRole('SECRETARY');

    // 2. DI Setup
    const supabase = await createClient();
    const command = toggleServiceVisibilityCommand(supabase);
    const useCase = toggleServiceVisibilityUseCase(command);

    // 3. Execution
    const result = await useCase(id, currentIsActive);

    // 4. Revalidate cache
    revalidatePath('/secretary/services');

    return { data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle service visibility" };
  }
}
