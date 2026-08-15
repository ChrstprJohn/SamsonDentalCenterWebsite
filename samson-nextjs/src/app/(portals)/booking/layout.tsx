import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/shared/database/server';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { Navbar } from '@/components/ui/navbar';
import type { AuthHeaderUser } from '@/modules/patients/hooks/auth/header/use-auth-header';

export const dynamic = 'force-dynamic';

export default async function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let headerUser: AuthHeaderUser | null = null;
  let user: any = null;
  
  // Secure route access
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    console.error('Portal auth check failed:', err);
  }

  if (!user) {
    redirect('/auth/staff-login?redirect=/booking');
  }

  headerUser = {
    firstName: user.user_metadata?.first_name || user.user_metadata?.firstName || 'Patient',
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
    console.error('Failed to load clinic config in booking layout:', err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <Navbar user={headerUser} config={clinicConfig} />
      
      {/* Main content layout (no sidebar) */}
      <div className="flex-1 w-full pt-[100px] flex flex-col">
        {children}
      </div>
    </div>
  );
}
