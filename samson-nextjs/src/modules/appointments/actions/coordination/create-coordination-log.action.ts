'use server';

import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { CreateCoordinationLogDto, createCoordinationLogSchema } from '../../dtos/coordination/create-coordination-log.dto';
import { insertCoordinationLogCommand } from '../../repositories/coordination/coordination.commands';

export async function createCoordinationLogAction(data: CreateCoordinationLogDto) {
  try {
    const user = await getAuthenticatedUser();
    const role = user.user_metadata?.role || user.role;
    if (role !== 'SECRETARY' && role !== 'ADMIN') {
      throw new DomainError('Unauthorized: Access restricted to clinic staff.', 'UNAUTHORIZED_ACCESS');
    }

    const parsed = createCoordinationLogSchema.parse(data);
    const supabase = await createClient();
    const command = insertCoordinationLogCommand(supabase);
    const result = await command(parsed, user.id);

    return { success: true, data: result };
  } catch (error: any) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    if (error.name === 'ZodError') return { success: false, error: error.errors?.[0]?.message || 'Invalid input' };
    console.error('ACTION ERROR (createCoordinationLogAction):', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}
