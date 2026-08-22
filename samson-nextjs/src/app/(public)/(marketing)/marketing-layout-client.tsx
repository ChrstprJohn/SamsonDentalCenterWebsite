'use client';

import React from 'react';
import { BookingNavProvider } from '@/modules/patients/contexts/booking-nav-context';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import type { AuthHeaderUser } from '@/modules/patients/hooks/auth/header/use-auth-header';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

interface MarketingLayoutClientProps {
  children: React.ReactNode;
  user: AuthHeaderUser | null;
  config: ClinicConfigResponseDto | null;
  services: ServiceResponseDto[];
}

export function MarketingLayoutClient({ children, user, config, services }: MarketingLayoutClientProps) {
  return (
    <BookingNavProvider services={services}>
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} config={config} />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer config={config} />
      </div>
    </BookingNavProvider>
  );
}