'use server';

import { z } from 'zod';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createAdminClient } from '@/shared/database/server';
import { getCommunicationSummaryPageSchema, type GetCommunicationSummaryPageDto } from '../../dtos/logs/get-communication-summary-page.dto';
import { getCommunicationSummaryPageQuery } from '../../repositories/logs/communication-summary-page.queries';

export async function getCommunicationSummaryPageAction(params: GetCommunicationSummaryPageDto) {
  try {
    await authorizeRole('SECRETARY');
    const validated = getCommunicationSummaryPageSchema.parse(params);
    const result = await getCommunicationSummaryPageQuery(await createAdminClient())(validated);
    return { success: true as const, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false as const, error: `Validation failed: ${error.issues[0].message}` };
    console.error('getCommunicationSummaryPageAction error:', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Failed to fetch communication summary' };
  }
}
