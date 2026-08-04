'use server';

import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { deleteCoordinationLogCommand } from '../../repositories/coordination/coordination.commands';

export async function deleteCoordinationLogAction(logId: string) {
  try {
    await authorizeRole('SECRETARY');

    const supabase = await createClient();
    const command = deleteCoordinationLogCommand(supabase);
    await command(logId);

    return { success: true };
  } catch (error: any) {
    console.error('ACTION ERROR (deleteCoordinationLogAction):', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}
