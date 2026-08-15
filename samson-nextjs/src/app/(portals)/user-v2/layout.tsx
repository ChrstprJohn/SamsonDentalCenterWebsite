import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/shared/database/server';
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getPatientAppointmentsAction } from '@/modules/appointments/actions/patient/get-patient-appointments.action';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import type { AuthHeaderUser } from '@/modules/patients/hooks/auth/header/use-auth-header';

export const dynamic = 'force-dynamic';

export default async function UserV2PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: any = null;
  let headerUser: AuthHeaderUser = {
    firstName: 'Patient',
    lastName: '',
    email: '',
    avatarUrl: null,
  };
  let appointments: any[] = [];
  let maxReschedules = 1;
  
  // Secure route access
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (user) {
      headerUser = {
        firstName: user.user_metadata?.first_name || user.user_metadata?.firstName || 'Patient',
        lastName: user.user_metadata?.last_name || user.user_metadata?.lastName || '',
        email: user.email || '',
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.avatarUrl || null,
      };
    }
  } catch (err) {
    console.error('Portal auth check failed:', err);
  }

  if (!user) {
    redirect('/auth/staff-login?redirect=/user-v2');
  }

  // Load appointments and config
  try {
    const [apptsResponse, configResponse] = await Promise.all([
      getPatientAppointmentsAction(),
      getClinicConfigAction(),
    ]);
    
    if (apptsResponse && 'data' in apptsResponse && apptsResponse.data) {
      appointments = apptsResponse.data;
    }
    if (configResponse && 'data' in configResponse && configResponse.data) {
      maxReschedules = configResponse.data.maxReschedules;
    }
  } catch (err) {
    console.error('Failed to load clinic config/appointments in portal:', err);
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar userProfile={headerUser} appointments={appointments} />
      <SidebarInset>
        <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-6 transition-all duration-300">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Portal V2</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-6 bg-slate-50/50 dark:bg-zinc-900/50">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
