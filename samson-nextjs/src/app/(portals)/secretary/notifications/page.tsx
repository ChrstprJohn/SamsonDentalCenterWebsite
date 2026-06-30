import React from 'react';
import { createClient } from '@/shared/database/server';
import { getUnreadNotifications } from '@/modules/notifications/exports';
import { authorizeRole } from '@/shared/auth/auth.util';
import { redirect } from 'next/navigation';
import { NotificationsListView } from '@/modules/notifications/views/notifications-list-view';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  let userId: string | null = null;
  try {
    const user = await authorizeRole('SECRETARY');
    userId = user.id;
  } catch {
    redirect('/auth/login');
  }

  const supabase = await createClient();
  const initialNotifications = await getUnreadNotifications(supabase)(userId, 'SECRETARY', 50);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-text-primary">In-App Notifications Log</h1>
          <p className="text-xs text-text-muted font-medium">View all operational notifications and alerts</p>
        </div>
      </div>
      <NotificationsListView initialNotifications={initialNotifications} />
    </div>
  );
}
