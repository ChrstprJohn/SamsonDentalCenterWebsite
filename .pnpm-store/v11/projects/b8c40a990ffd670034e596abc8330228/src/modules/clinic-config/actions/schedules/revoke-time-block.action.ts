'use server';

import { createClient } from '@/shared/database/server';
import { ActionResponse } from '@/shared/utils/action-response';
import { revalidatePath } from 'next/cache';

export async function revokeTimeBlockAction(
  id: string
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('time_blocks')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/secretary/schedules');
    return { success: true, data: undefined };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to revoke time block exception' };
  }
}
