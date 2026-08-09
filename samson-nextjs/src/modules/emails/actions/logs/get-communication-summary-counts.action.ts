/**
 * @deprecated Communication History feature removed from UI.
 * Failed notifications are resent via the Notification Lifecycle tab in the
 * appointment detail pane (AppointmentNotificationsTab). Kept for reference only.
 */
'use server';

import { z } from 'zod';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { getCommunicationSummaryCountsQuery } from '../../repositories/logs/communication-summary-page.queries';

const schema = z.object({
  search: z.string().trim().max(120).optional().or(z.literal('').transform(() => undefined)),
});

export async function getCommunicationSummaryCountsAction(params: { search?: string }) {
  try {
    await authorizeRole('SECRETARY');
    const validated = schema.parse(params);
    const data = await getCommunicationSummaryCountsQuery(await createClient())(validated.search);
    return { success: true as const, data };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false as const, error: `Validation failed: ${error.issues[0].message}` };
    console.error('getCommunicationSummaryCountsAction error:', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Failed to fetch communication totals' };
  }
}
