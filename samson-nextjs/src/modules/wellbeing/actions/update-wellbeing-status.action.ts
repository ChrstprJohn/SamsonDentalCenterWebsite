'use server';

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { ActionResponse } from '@/shared/utils/action-response';

const updateWellbeingStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['UNRESOLVED', 'NO_ACTION_NEEDED', 'WITH_DOCTOR', 'COMPLETED']),
});

export type UpdateWellbeingStatusInput = z.infer<typeof updateWellbeingStatusSchema>;

export async function updateWellbeingStatusAction(
  input: UpdateWellbeingStatusInput
): Promise<ActionResponse<{ id: string; status: string; updatedAt: string }>> {
  try {
    const parsed = updateWellbeingStatusSchema.parse(input);
    await authorizeRole('SECRETARY');

    const supabase = await createAdminClient();

    const updatedAt = new Date().toISOString();
    const { error } = await supabase
      .from('checkout_follow_up_responses')
      .update({ status: parsed.status, updated_at: updatedAt })
      .eq('id', parsed.id);

    if (error) {
      return { success: false, error: `Failed to update status: ${error.message}` };
    }

    return { success: true, data: { id: parsed.id, status: parsed.status, updatedAt } };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message };
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update status.' };
  }
}
