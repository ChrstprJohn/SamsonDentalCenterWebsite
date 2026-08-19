'use server';

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { ActionResponse } from '@/shared/utils/action-response';
import { createNotificationUseCase } from '@/modules/notifications/use-cases/management/create-notification.use-case';

const wellbeingSchema = z.object({
  appointmentId: z.string().uuid(),
  feeling: z.enum(['FEELING_GREAT', 'OKAY', 'NOT_SO_GOOD']),
  note: z.string().trim().max(2000).optional().or(z.literal('')),
  symptoms: z.array(z.string()).max(10).optional(),
  callBack: z.enum(['YES', 'NO']).optional(),
});

export type SubmitWellbeingInput = z.infer<typeof wellbeingSchema>;

export async function submitWellbeingAction(
  input: SubmitWellbeingInput
): Promise<ActionResponse<{ appointmentId: string; feeling: string }>> {
  try {
    const parsed = wellbeingSchema.parse(input);
    const note = (parsed.note || '').trim() || null;

    const details: Record<string, unknown> = {};
    if (parsed.symptoms && parsed.symptoms.length > 0) details.symptoms = parsed.symptoms;
    if (parsed.callBack !== undefined) details.callBack = parsed.callBack;

    // Routine reply (doing great / okay, no symptoms, no callback request)
    // auto-resolves — no secretary action needed.
    const isRoutine =
      parsed.feeling !== 'NOT_SO_GOOD' &&
      !(parsed.symptoms && parsed.symptoms.length > 0) &&
      parsed.callBack !== 'YES';

    const supabase = await createAdminClient();

    const { data: appointment, error: appError } = await supabase
      .from('appointments')
      .select('id')
      .eq('id', parsed.appointmentId)
      .maybeSingle();

    if (appError || !appointment) {
      return { success: false, error: 'This link is invalid or the appointment no longer exists.' };
    }

    const { error } = await supabase.from('checkout_follow_up_responses').insert({
      appointment_id: parsed.appointmentId,
      feeling: parsed.feeling,
      note,
      details: Object.keys(details).length > 0 ? details : null,
      status: isRoutine ? 'NO_ACTION_NEEDED' : 'UNRESOLVED',
    });

    if (error) {
      return { success: false, error: `Failed to save your response: ${error.message}` };
    }

    // ponytail: routine replies auto-resolve — notify only when a human must act
    if (isRoutine) {
      return { success: true, data: { appointmentId: parsed.appointmentId, feeling: parsed.feeling } };
    }

    await createNotificationUseCase(supabase)({
      recipientRole: 'SECRETARY',
      recipientId: null,
      type: 'WELLBEING_CHECK_IN_SUBMITTED',
      priority: 'STANDARD',
      title: 'Aftercare Check-In',
      message: `Patient replied to the 48h aftercare email: feeling ${parsed.feeling.replace(/_/g, ' ').toLowerCase()}${parsed.symptoms?.length ? ` — symptoms: ${parsed.symptoms.join(', ').toLowerCase()}` : ''}${note ? ` — "${note.slice(0, 120)}"` : ''}`,
      linkUrl: '/secretary-v2/check-in/follow-up',
      entityId: parsed.appointmentId,
    });

    return { success: true, data: { appointmentId: parsed.appointmentId, feeling: parsed.feeling } };
  } catch (error: any) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message };
    return { success: false, error: error?.message || 'Failed to save your response.' };
  }
}