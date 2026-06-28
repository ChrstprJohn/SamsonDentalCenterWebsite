import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/shared/database/server';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import type { AuthHeaderUser } from '@/modules/patients/hooks/auth/header/use-auth-header';

export const dynamic = 'force-dynamic';

export default async function SecretaryPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let headerUser: AuthHeaderUser | null = null;
  let isAuthorized = false;
  
  // Secure route access and authorize roles
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect('/auth/login?redirect=/secretary');
    }

    const role = user.user_metadata?.role as string;
    isAuthorized = role === 'SECRETARY' || role === 'ADMIN';

    headerUser = {
      firstName: user.user_metadata?.first_name || user.user_metadata?.firstName || 'Staff',
      lastName: user.user_metadata?.last_name || user.user_metadata?.lastName || '',
      email: user.email || '',
      avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.avatarUrl || null,
    };
  } catch (err) {
    console.error('Secretary portal auth check failed, redirecting:', err);
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
    console.error('Failed to load clinic config in secretary portal:', err);
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
        <Navbar user={headerUser} />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-6 pt-[120px]">
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
        </main>
        <Footer config={clinicConfig} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <Navbar user={headerUser} />
      
      {/* Sidebar + Main content layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 pt-[100px] grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Secretary sub sidebar */}
        <aside className="lg:col-span-3 flex flex-col gap-1.5 border-r border-card-border/50 pr-4">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-4 mb-2">
            Operations
          </div>
          <Link
            href="/secretary"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-secondary-bg transition-colors text-text-secondary hover:text-text-primary"
          >
            <span>🏠</span>
            Dashboard
          </Link>
          <Link
            href="/secretary/pending"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-secondary-bg transition-colors text-text-secondary hover:text-text-primary"
          >
            <span>📋</span>
            Appointment Requests
          </Link>
          <Link
            href="/secretary/reschedule-requests"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-secondary-bg transition-colors text-text-secondary hover:text-text-primary"
          >
            <span>🔄</span>
            Reschedule Requests
          </Link>
          <Link
            href="/secretary/inquiries"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-secondary-bg transition-colors text-text-secondary hover:text-text-primary"
          >
            <span>💬</span>
            Inquiries Queue
          </Link>
          <Link
            href="/secretary/book"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-secondary-bg transition-colors text-text-secondary hover:text-text-primary"
          >
            <span>📅</span>
            Book Appointment
          </Link>
          <Link
            href="/secretary/appointments"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-secondary-bg transition-colors text-text-secondary hover:text-text-primary"
          >
            <span>🗂️</span>
            Appointments Directory
          </Link>
          <Link
            href="/secretary/check-in"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-secondary-bg transition-colors text-text-secondary hover:text-text-primary"
          >
            <span>🚀</span>
            Check-In / Out
          </Link>
          <Link
            href="/secretary/invoices"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-secondary-bg transition-colors text-text-secondary hover:text-text-primary"
          >
            <span>💵</span>
            Invoices
          </Link>
          
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-4 mt-4 mb-2">
            System & Logs
          </div>
          <Link
            href="/secretary/emails"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-secondary-bg transition-colors text-text-secondary hover:text-text-primary"
          >
            <span>✉️</span>
            Email Logs
          </Link>
          <Link
            href="/secretary/audits"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-secondary-bg transition-colors text-text-secondary hover:text-text-primary"
          >
            <span>🛡️</span>
            Audit Logs
          </Link>
          <Link
            href="/secretary/profile"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-secondary-bg transition-colors text-text-secondary hover:text-text-primary"
          >
            <span>👤</span>
            Profile Settings
          </Link>
        </aside>

        {/* Content container */}
        <main className="lg:col-span-9 flex flex-col min-h-[70vh]">
          {children}
        </main>
      </div>

      <Footer config={clinicConfig} />
    </div>
  );
}
