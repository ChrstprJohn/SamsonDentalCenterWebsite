import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/shared/database/server';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { UserSidebar } from '@/modules/patients/components/profile/user-sidebar';
import type { AuthHeaderUser } from '@/modules/patients/hooks/auth/header/use-auth-header.hook';

export const dynamic = 'force-dynamic';

export default async function UserPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let headerUser: AuthHeaderUser | null = null;
  
  // Secure route access
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect('/auth/login?redirect=/user');
    }

    headerUser = {
      firstName: user.user_metadata?.first_name || user.user_metadata?.firstName || 'Patient',
      lastName: user.user_metadata?.last_name || user.user_metadata?.lastName || '',
      email: user.email || '',
      avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.avatarUrl || null,
    };
  } catch (err) {
    console.error('Portal auth check failed, redirecting:', err);
    redirect('/auth/login');
  }

  // Fetch clinic config
  let clinicConfig = null;
  try {
    const response = await getClinicConfigAction();
    if (response && 'data' in response && response.data) {
      clinicConfig = response.data;
    }
  } catch (err) {
    console.error('Failed to load clinic config in portal:', err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <Navbar user={headerUser} />
      
      {/* Sidebar + Main content layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 pt-[100px] grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Portal sub sidebar */}
        <UserSidebar />

        {/* Content container */}
        <main className="lg:col-span-9 flex flex-col min-h-[70vh]">
          {children}
        </main>
      </div>

      <Footer config={clinicConfig} />
    </div>
  );
}
