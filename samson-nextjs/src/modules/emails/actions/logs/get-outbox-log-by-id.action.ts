'use server';

import { z } from 'zod';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createAdminClient } from '@/shared/database/server';
import { mapOutboxRecord, type OutboxLogResponseDto } from '../../dtos/logs/outbox-log-response.dto';

const schema = z.object({ id: z.string().uuid() });

export async function getOutboxLogByIdAction(id: string): Promise<{ success: true; data: OutboxLogResponseDto } | { success: false; error: string }> {
  try {
    await authorizeRole('SECRETARY');
    const { id: parsedId } = schema.parse({ id });
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('outbox')
      .select('id, event_type, payload, status, error_logs, retry_count, created_at')
      .eq('id', parsedId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch communication detail: ${error.message}`);
    if (!data) return { success: false, error: 'Communication entry not found.' };
    return { success: true, data: mapOutboxRecord(data as Record<string, unknown>) };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: `Validation failed: ${error.issues[0].message}` };
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch communication detail' };
  }
}
