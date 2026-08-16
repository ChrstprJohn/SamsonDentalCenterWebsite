'use server';

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { ActionResponse } from '@/shared/utils/action-response';
import { createNotificationUseCase } from '@/modules/notifications/use-cases/management/create-notification.use-case';

const wellbeingSchema = z.object({
  appointmentId: z.string().uuid(),
  feeling: z.enum(['FEELING_GREAT', 'OKAY', 'NOT_SO_GOOD']),
  note: z.string().trim().max(2000).optional().or(z.literal('')),
  medsTaken: z.boolean().optional(),
  medsManageable: z.boolean().optional(),
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
    if (parsed.medsTaken !== undefined) details.medsTaken = parsed.medsTaken;
    if (parsed.medsManageable !== undefined) details.medsManageable = parsed.medsManageable;
    if (parsed.symptoms && parsed.symptoms.length > 0) details.symptoms = parsed.symptoms;
    if (parsed.callBack !== undefined) details.callBack = parsed.callBack;

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
    });

    if (error) {
      return { success: false, error: `Failed to save your response: ${error.message}` };
    }

    await createNotificationUseCase(supabase)({
      recipientRole: 'SECRETARY',
      recipientId: null,
      type: 'WELLBEING_CHECK_IN_SUBMITTED',
      priority: 'STANDARD',
      title: 'Wellbeing Check-In',
      message: `Patient replied to the 48h follow-up: feeling ${parsed.feeling.replace(/_/g, ' ').toLowerCase()}${parsed.symptoms?.length ? ` — symptoms: ${parsed.symptoms.join(', ').toLowerCase()}` : ''}${note ? ` — "${note.slice(0, 120)}"` : ''}`,
      linkUrl: '/secretary-v2/check-in/follow-up',
      entityId: parsed.appointmentId,
    });

    return { success: true, data: { appointmentId: parsed.appointmentId, feeling: parsed.feeling } };
  } catch (error: any) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message };
    return { success: false, error: error?.message || 'Failed to save your response.' };
  }
}