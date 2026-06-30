'use server';

import { createClient } from '@/shared/database/server';
import { updateNotificationSchema } from '../../dtos/management/update-notification.dto';
import { markReadUseCase } from '../../use-cases/management/mark-read.use-case';
import { authorizeRole } from '@/shared/auth/auth.util';
import { revalidatePath } from 'next/cache';

export async function markReadAction(data: { id: string }) {
  try {
    const user = await authorizeRole('SECRETARY');
    const validated = updateNotificationSchema.parse(data);
    const supabase = await createClient();

    const result = await markReadUseCase(supabase)(validated);
    revalidatePath('/secretary');
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to mark read' };
  }
}
