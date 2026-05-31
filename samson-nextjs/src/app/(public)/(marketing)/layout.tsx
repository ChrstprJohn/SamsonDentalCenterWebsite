import React from 'react';
import { createClient } from '@/shared/database/server';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import type { AuthHeaderUser } from '@/modules/patients/hooks/auth/header/use-auth-header.hook';

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let headerUser: AuthHeaderUser | null = null;
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      headerUser = {
        firstName: user.user_metadata?.first_name || user.user_metadata?.firstName || 'Patient',
        lastName: user.user_metadata?.last_name || user.user_metadata?.lastName || '',
        email: user.email || '',
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.avatarUrl || null,
      };
    }
  } catch (err) {
    console.error('Failed to authenticate session in marketing layout:', err);
  }

  // Fetch clinic config
  let clinicConfig = null;
  try {
    const response = await getClinicConfigAction();
    if (response && 'data' in response && response.data) {
      clinicConfig = response.data;
    }
  } catch (err) {
    console.error('Failed to load clinic config in marketing layout:', err);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={headerUser} />
      <main className="flex-1 flex flex-col pt-[80px]">
        {children}
      </main>
      <Footer config={clinicConfig} />
    </div>
  );
}
