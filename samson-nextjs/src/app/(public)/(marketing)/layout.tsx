import React from 'react';
import { createClient } from '@/shared/database/server';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { MarketingLayoutClient } from './marketing-layout-client';
import type { AuthHeaderUser } from '@/modules/patients/hooks/auth/header/use-auth-header';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

export const dynamic = 'force-dynamic';

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
  let clinicConfig: ClinicConfigResponseDto | null = null;
  try {
    const response = await getClinicConfigAction();
    if (response && 'data' in response && response.data) {
      clinicConfig = response.data;
    }
  } catch (err) {
    console.error('Failed to load clinic config in marketing layout:', err);
  }

  // Fetch services for booking nav context
  let services: ServiceResponseDto[] = [];
  try {
    const servicesResponse = await getServicesAction(false);
    if (servicesResponse && 'data' in servicesResponse && servicesResponse.data) {
      services = servicesResponse.data;
    }
  } catch (err) {
    console.error('Failed to load services for marketing layout:', err);
  }

  return (
    <MarketingLayoutClient user={headerUser} config={clinicConfig} services={services}>
      {children}
    </MarketingLayoutClient>
  );
}
