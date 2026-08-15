'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/shared/database/server';
import { ActionResponse } from '@/shared/utils/action-response';

export async function deleteNoShowReasonAction(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.from('no_show_reasons').delete().eq('id', id);

    if (error) {
      return { success: false, error: error?.message || 'Failed to delete reason.' };
    }

    revalidatePath('/secretary-v2/no-show-reasons');
    return { success: true, data: { id } };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete reason.' };
  }
}