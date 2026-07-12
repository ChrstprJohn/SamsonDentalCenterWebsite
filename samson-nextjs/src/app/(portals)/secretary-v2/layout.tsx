import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/shared/database/server';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { Button } from '@/components/ui/button';
import type { AuthHeaderUser } from '@/modules/patients/hooks/auth/header/use-auth-header';
import { getUnreadNotifications, getUnreadCount, NotificationPopover, RealtimeListener } from '@/modules/notifications/exports';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SecretarySidebar } from '@/components/secretary-sidebar';
import { Separator } from '@/components/ui/separator';

export const dynamic = 'force-dynamic';

export default async function SecretaryPortalV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  let headerUser: AuthHeaderUser | null = null;
  let isAuthorized = false;
  let userId: string | null = null;
  let user: any = null;
  
  // Secure route access and authorize roles
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    console.error('Secretary portal V2 auth check failed:', err);
  }

  if (!user) {
    redirect('/auth/login?redirect=/secretary-v2');
  }

  userId = user.id;
  const role = user.user_metadata?.role as string;
  isAuthorized = role === 'SECRETARY' || role === 'ADMIN';

  headerUser = {
    firstName: user.user_metadata?.first_name || user.user_metadata?.firstName || 'Staff',
    lastName: user.user_metadata?.last_name || user.user_metadata?.lastName || '',
    email: user.email || '',
    avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.avatarUrl || null,
  };

  // Fetch clinic config
  let clinicConfig = null;
  try {
    const response = await getClinicConfigAction();
    if (response && 'data' in response && response.data) {
      clinicConfig = response.data;
    }
  } catch (err) {
    console.error('Failed to load clinic config in secretary portal V2:', err);
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center p-6 text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-3xl text-red-500">
          ⚠️
        </div>
        <div className="flex flex-col gap-2 max-w-md">
          <h1 className="text-2xl font-bold text-text-primary">Access Denied</h1>
          <p className="text-xs text-text-muted leading-relaxed">
            Your patient account lacks necessary administrative credentials to access the Secretary operational dashboard. Please contact a roster administrator if you require clinical clearance.
          </p>
        </div>
        <Link href="/user">
          <Button variant="secondary">Go to My Portal</Button>
        </Link>
      </div>
    );
  }

  // Fetch notifications
  let unreadNotifications: any[] = [];
  let unreadCount = 0;
  try {
    const supabase = await createClient();
    unreadNotifications = await getUnreadNotifications(supabase)(userId, 'SECRETARY');
    unreadCount = await getUnreadCount(supabase)(userId, 'SECRETARY');
  } catch (err) {
    console.error('Failed to fetch unread notifications:', err);
  }

  const sidebarUser = {
    name: `${headerUser.firstName} ${headerUser.lastName}`,
    email: headerUser.email,
    avatar: headerUser.avatarUrl || "/avatars/placeholder.jpg",
  };

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <RealtimeListener userId={userId} />
      <SecretarySidebar userProfile={sidebarUser} />

      <SidebarInset className="min-h-0 overflow-hidden">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
