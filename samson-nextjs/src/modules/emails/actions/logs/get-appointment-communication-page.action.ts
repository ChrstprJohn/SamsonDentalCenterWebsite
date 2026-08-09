/**
 * @deprecated Communication History feature removed from UI.
 * Failed notifications are resent via the Notification Lifecycle tab in the
 * appointment detail pane (AppointmentNotificationsTab). Kept for reference only.
 */
'use server';

import { z } from 'zod';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createAdminClient } from '@/shared/database/server';
import { getAppointmentCommunicationPageSchema, type GetAppointmentCommunicationPageDto } from '../../dtos/logs/get-appointment-communication-page.dto';
import { getAppointmentCommunicationPageQuery } from '../../repositories/logs/appointment-communication-page.queries';

export async function getAppointmentCommunicationPageAction(params: GetAppointmentCommunicationPageDto) {
  try {
    await authorizeRole('SECRETARY');
    const validated = getAppointmentCommunicationPageSchema.parse(params);
    const result = await getAppointmentCommunicationPageQuery(await createAdminClient())(validated);
    return { success: true as const, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false as const, error: `Validation failed: ${error.issues[0].message}` };
    console.error('getAppointmentCommunicationPageAction error:', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Failed to fetch appointment communication' };
  }
}
