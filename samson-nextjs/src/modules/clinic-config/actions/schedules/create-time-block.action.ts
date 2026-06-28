'use server';

import { createClient } from '@/shared/database/server';
import { ActionResponse } from '@/shared/utils/action-response';
import { revalidatePath } from 'next/cache';

export interface CreateTimeBlockInput {
  doctorId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export async function createTimeBlockAction(
  input: CreateTimeBlockInput
): Promise<ActionResponse<void>> {
  try {
    if (!input.reason || input.reason.trim().length < 3) {
      return { success: false, error: 'Reason must be at least 3 characters' };
    }

    if (input.startTime > input.endTime) {
      return { success: false, error: 'End time must be after start time' };
    }

    const supabase = await createClient();

    // Get current user for tracking who created the block
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('time_blocks')
      .insert({
        doctor_id: input.doctorId,
        date: input.date,
        start_time: input.startTime,
        end_time: input.endTime,
        reason: input.reason.trim(),
        created_by: user?.id || null,
      });

    if (error) throw new Error(error.message);

    revalidatePath('/secretary/schedules');
    return { success: true, data: undefined };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create time block exception' };
  }
}
