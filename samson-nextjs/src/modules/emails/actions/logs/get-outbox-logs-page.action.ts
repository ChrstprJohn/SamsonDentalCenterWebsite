'use server';

import { z } from 'zod';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createAdminClient } from '@/shared/database/server';
import { getOutboxLogsPageSchema, type GetOutboxLogsPageDto } from '../../dtos/logs/get-outbox-logs-page.dto';
import { getOutboxLogsPageQuery } from '../../repositories/logs/outbox-page.queries';

export async function getOutboxLogsPageAction(params: GetOutboxLogsPageDto) {
  try {
    await authorizeRole('SECRETARY');
    const validated = getOutboxLogsPageSchema.parse(params);
    const supabase = await createAdminClient();
    const result = await getOutboxLogsPageQuery(supabase)(validated);
    return { success: true as const, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false as const, error: `Validation failed: ${error.issues[0].message}` };
    console.error('getOutboxLogsPageAction error:', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Failed to fetch outbox logs' };
  }
}
