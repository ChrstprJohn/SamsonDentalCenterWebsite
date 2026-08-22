import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthenticatedUser, getTrustedUserProfile, type TrustedUserProfile } from '@/shared/auth/auth.util';
import { Button } from '@/components/ui/button';
import type { AuthHeaderUser } from '@/modules/patients/hooks/auth/header/use-auth-header';
import { RealtimeListener } from '@/modules/notifications/exports';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SecretarySidebar } from '@/components/secretary-sidebar';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { createClient } from '@/shared/database/server';
import { getUnreadCount } from '@/modules/notifications/exports';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';

export const dynamic = 'force-dynamic';

export default async function SecretaryPortalV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  let headerUser: AuthHeaderUser | null = null;
  let isAuthorized = false;
  let userId: string | null = null;
  let user: Awaited<ReturnType<typeof getAuthenticatedUser>> | null = null;
  let profile: TrustedUserProfile | null = null;
  
  // Secure route access and authorize roles
  try {
    user = await getAuthenticatedUser();
    profile = await getTrustedUserProfile(user.id);
  } catch (err) {
    console.error('Secretary portal V2 auth check failed:', err);
  }

  if (!user) {
    redirect('/auth/staff-login?redirect=/secretary-v2');
  }

  userId = user.id;
  const role = profile?.role;
  isAuthorized = role === 'SECRETARY' || role === 'ADMIN';

  headerUser = {
    firstName: profile?.firstName || 'Staff',
    lastName: profile?.lastName || '',
    email: profile?.email || user.email || '',
    avatarUrl: profile?.avatarUrl || null,
  };

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

  const sidebarUser = {
    name: `${headerUser.firstName} ${headerUser.lastName}`,
    email: headerUser.email,
    avatar: headerUser.avatarUrl || "/avatars/placeholder.jpg",
  };
  const clinicConfig = await getClinicConfigAction();
  let notificationCount = 0;
  let appointmentRequestCount = 0;
  try {
    const supabase = await createClient();
    notificationCount = await getUnreadCount(supabase)(userId, 'SECRETARY');
    const pendingResult = await getClinicAppointmentsAction({ status: 'PENDING' });
    if (pendingResult && 'data' in pendingResult && pendingResult.data) appointmentRequestCount = pendingResult.data.length;
  } catch (err) {
    console.error('Failed to load secretary notification count:', err);
  }
  const logoUrl = clinicConfig && 'data' in clinicConfig ? clinicConfig.data?.websiteLogoUrl ?? null : null;

  return (
    <SidebarProvider defaultOpen={true} className="h-svh overflow-hidden">
      <RealtimeListener userId={userId} />
      <SecretarySidebar userProfile={sidebarUser} logoUrl={logoUrl} notificationCount={notificationCount} appointmentRequestCount={appointmentRequestCount} />

      <SidebarInset className="min-h-0 overflow-hidden">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
