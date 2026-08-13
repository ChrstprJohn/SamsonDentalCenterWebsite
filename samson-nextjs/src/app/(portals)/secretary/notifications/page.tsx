import React from 'react';
import { createClient } from '@/shared/database/server';
import { getNotificationsPage, getUnreadCount } from '@/modules/notifications/exports';
import { authorizeRole } from '@/shared/auth/auth.util';
import { redirect } from 'next/navigation';
import { NotificationsListView } from '@/modules/notifications/views/notifications-list-view';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  let userId: string | null = null;
  let hasError = false;
  try {
    const user = await authorizeRole('SECRETARY');
    userId = user.id;
  } catch {
    hasError = true;
  }

  if (hasError || !userId) {
    redirect('/auth/login');
  }

  const supabase = await createClient();
  const [initialPage, unreadCount] = await Promise.all([
    getNotificationsPage(supabase)(userId, 'SECRETARY', { limit: 25 }),
    getUnreadCount(supabase)(userId, 'SECRETARY'),
  ]);

  return <NotificationsListView initialPage={initialPage} initialUnreadCount={unreadCount} />;
}
