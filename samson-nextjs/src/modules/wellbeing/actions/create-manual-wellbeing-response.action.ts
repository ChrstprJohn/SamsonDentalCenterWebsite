'use server';

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { ActionResponse } from '@/shared/utils/action-response';

const manualResponseSchema = z.object({
  appointmentId: z.string().uuid(),
  feeling: z.enum(['FEELING_GREAT', 'OKAY', 'NOT_SO_GOOD']),
  note: z.string().trim().max(2000).optional().or(z.literal('')),
  symptoms: z.array(z.string()).max(10).optional(),
  source: z.enum(['PHONE', 'EMAIL']),
});

export type CreateManualWellbeingResponseInput = z.infer<typeof manualResponseSchema>;

export async function createManualWellbeingResponseAction(
  input: CreateManualWellbeingResponseInput
): Promise<ActionResponse<{ appointmentId: string; feeling: string }>> {
  try {
    const parsed = manualResponseSchema.parse(input);
    const note = (parsed.note || '').trim() || null;

    await authorizeRole('SECRETARY');

    const supabase = await createAdminClient();

    const { data: appointment, error: appError } = await supabase
      .from('appointments')
      .select('id')
      .eq('id', parsed.appointmentId)
      .maybeSingle();

    if (appError || !appointment) {
      return { success: false, error: 'This appointment no longer exists.' };
    }

    const { error } = await supabase.from('checkout_follow_up_responses').insert({
      appointment_id: parsed.appointmentId,
      feeling: parsed.feeling,
      note,
      source: parsed.source,
      details: { symptoms: parsed.symptoms ?? [], channel: parsed.source },
    });

    if (error) {
      return { success: false, error: `Failed to save response: ${error.message}` };
    }

    return { success: true, data: { appointmentId: parsed.appointmentId, feeling: parsed.feeling } };
  } catch (error: any) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message };
    return { success: false, error: error?.message || 'Failed to save response.' };
  }
}