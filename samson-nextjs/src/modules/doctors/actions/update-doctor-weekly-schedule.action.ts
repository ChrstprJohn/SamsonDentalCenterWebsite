'use server';

import { createClient, createAdminClient } from '@/shared/database/server';
import { ActionResponse } from '@/shared/utils/action-response';
import { revalidatePath } from 'next/cache';

export interface UpdateDoctorWeeklyScheduleInput {
  doctorId: string;
  shifts: {
    dayOfWeek: number;
    isOpen: boolean;
    startTime: string | null;
    endTime: string | null;
    breakStartTime: string | null;
    breakEndTime: string | null;
    isCustom: boolean;
  }[];
}

export async function updateDoctorWeeklyScheduleAction(
  input: UpdateDoctorWeeklyScheduleInput
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' };
    }
    const role = user.user_metadata?.role || user.role;
    if (role !== 'SECRETARY' && role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: insufficient permissions' };
    }

    const adminSupabase = await createAdminClient();

    for (const shift of input.shifts) {
      if (shift.isCustom) {
        // Upsert custom shift
        const { error } = await adminSupabase
          .from('doctor_schedules')
          .upsert({
            doctor_id: input.doctorId,
            day_of_week: shift.dayOfWeek,
            is_open: shift.isOpen,
            start_time: shift.isOpen ? shift.startTime : null,
            end_time: shift.isOpen ? shift.endTime : null,
            break_start_time: shift.isOpen ? shift.breakStartTime : null,
            break_end_time: shift.isOpen ? shift.breakEndTime : null,
            is_custom: true,
          }, { onConflict: 'doctor_id,day_of_week' });

        if (error) throw new Error(error.message);
      } else {
        // Delete shift override to fallback to baseline
        const { error } = await adminSupabase
          .from('doctor_schedules')
          .delete()
          .match({ doctor_id: input.doctorId, day_of_week: shift.dayOfWeek });

        if (error) throw new Error(error.message);
      }
    }

    revalidatePath('/secretary/schedules');
    return { success: true, data: undefined };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update schedules' };
  }
}
