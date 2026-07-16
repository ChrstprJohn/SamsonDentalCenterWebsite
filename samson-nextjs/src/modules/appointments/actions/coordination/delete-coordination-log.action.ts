'use server';

import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { deleteCoordinationLogCommand } from '../../repositories/coordination/coordination.commands';

export async function deleteCoordinationLogAction(logId: string) {
  try {
    const user = await getAuthenticatedUser();
    const role = user.user_metadata?.role || user.role;
    if (role !== 'SECRETARY' && role !== 'ADMIN') {
      throw new DomainError('Unauthorized: Access restricted to clinic staff.', 'UNAUTHORIZED_ACCESS');
    }

    const supabase = await createClient();
    const command = deleteCoordinationLogCommand(supabase);
    await command(logId);

    return { success: true };
  } catch (error: any) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error('ACTION ERROR (deleteCoordinationLogAction):', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}
