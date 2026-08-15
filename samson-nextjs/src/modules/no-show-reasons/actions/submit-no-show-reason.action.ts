'use server';

import { createAdminClient } from '@/shared/database/server';
import { ActionResponse } from '@/shared/utils/action-response';

export type SubmitNoShowReasonInput = {
  appointmentId: string;
  reason: string;
};

export async function submitNoShowReasonAction(
  input: SubmitNoShowReasonInput
): Promise<ActionResponse<{ appointmentId: string }>> {
  try {
    const reason = (input.reason || '').trim();
    if (!reason) {
      return { success: false, error: 'Please choose a reason or write your own.' };
    }
    if (reason.length > 1000) {
      return { success: false, error: 'Reason is too long. Please keep it under 1000 characters.' };
    }

    const appointmentId = (input.appointmentId || '').trim();
    if (!appointmentId) {
      return { success: false, error: 'No-show link is invalid. Please use the link from your email.' };
    }

    const supabase = await createAdminClient();

    const { data: appointment, error: appError } = await supabase
      .from('appointments')
      .select('id')
      .eq('id', appointmentId)
      .maybeSingle();

    if (appError || !appointment) {
      return { success: false, error: 'No-show link is invalid or the appointment no longer exists.' };
    }

    const { error } = await supabase.from('no_show_reasons').upsert(
      { appointment_id: appointmentId, reason },
      { onConflict: 'appointment_id' }
    );

    if (error) {
      return { success: false, error: `Failed to save your reason: ${error.message}` };
    }

    return { success: true, data: { appointmentId } };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to save your reason.' };
  }
}