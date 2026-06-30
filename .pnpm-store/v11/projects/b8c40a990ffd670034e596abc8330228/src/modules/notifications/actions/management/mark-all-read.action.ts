'use server';

import { createClient } from '@/shared/database/server';
import { markAllReadUseCase } from '../../use-cases/management/mark-all-read.use-case';
import { authorizeRole } from '@/shared/auth/auth.util';
import { revalidatePath } from 'next/cache';

export async function markAllReadAction() {
  try {
    const user = await authorizeRole('SECRETARY');
    const supabase = await createClient();

    await markAllReadUseCase(supabase)(user.id, 'SECRETARY');
    revalidatePath('/secretary');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to mark all read' };
  }
}
