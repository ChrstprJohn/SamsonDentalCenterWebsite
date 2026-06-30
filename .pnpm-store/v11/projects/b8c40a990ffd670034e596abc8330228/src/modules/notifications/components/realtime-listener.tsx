'use client';

import { useNotificationsRealtime } from '../hooks/use-notifications-realtime';

export function RealtimeListener({ userId }: { userId: string | null }) {
  useNotificationsRealtime(userId);
  return null;
}
