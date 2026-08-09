/**
 * @deprecated Communication History feature removed from UI.
 * Failed notifications are resent via the Notification Lifecycle tab in the
 * appointment detail pane (AppointmentNotificationsTab). Kept for reference only.
 */
"use server";

import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';

export interface CommunicationActivity {
  lastActivity: string;
  hasFailed: boolean;
  failureCount: number;
  latestEventType?: string;
  latestRecipient?: string;
}

export type CommunicationActivityMap = Record<string, CommunicationActivity>;

export async function getCommunicationActivityAction(): Promise<{
  success: boolean;
  data?: CommunicationActivityMap;
  error?: string;
}> {
  try {
    await authorizeRole('SECRETARY');

    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from('outbox')
      .select('created_at, status, event_type, payload')
      .order('created_at', { ascending: false })
      .limit(2000);

    if (error) {
      throw new Error(`Failed to fetch outbox: ${error.message}`);
    }

    const activityMap: CommunicationActivityMap = {};

    for (const r of (data || []) as any[]) {
      const payload = r.payload || {};
      const appId = payload.appointmentId;
      if (!appId) continue;

      if (!activityMap[appId]) {
        const recipient = payload.email || payload.guestEmail || payload.phoneNumber || '';
        activityMap[appId] = { lastActivity: r.created_at, hasFailed: false, failureCount: 0, latestEventType: r.event_type, latestRecipient: recipient };
      }
      if (r.status === 'FAILED') {
        activityMap[appId].hasFailed = true;
        activityMap[appId].failureCount += 1;
      }
    }

    return { success: true, data: activityMap };
  } catch (error: any) {
    console.error('getCommunicationActivityAction error:', error);
    return { success: false, error: error.message || 'Failed to fetch communication activity' };
  }
}
