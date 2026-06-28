"use server";

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { archiveServiceUseCase } from '../../use-cases/management/archive-service.use-case';
import { archiveServiceCommand } from '../../repositories/management/service.commands';

export async function archiveServiceAction(id: string) {
  try {
    // 1. Session verification
    await authorizeRole('SECRETARY');

    // 2. DI Setup
    const supabase = await createClient();
    const command = archiveServiceCommand(supabase);
    const useCase = archiveServiceUseCase(command);

    // 3. Execution
    const result = await useCase(id);

    // 4. Revalidate cache
    revalidatePath('/secretary/services');

    return { data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to archive service" };
  }
}
