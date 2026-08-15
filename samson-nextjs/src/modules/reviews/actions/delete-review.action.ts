'use server';

import { createClient } from '@/shared/database/server';
import { ActionResponse } from '@/shared/utils/action-response';
import { revalidatePath } from 'next/cache';

export async function deleteReviewAction(id: string): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('reviews').delete().eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/secretary-v2/reviews');
    return { success: true, data: undefined };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete review.' };
  }
}