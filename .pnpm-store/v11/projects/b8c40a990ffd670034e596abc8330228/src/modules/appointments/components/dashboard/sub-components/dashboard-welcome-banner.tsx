import React from 'react';

interface DashboardWelcomeBannerProps {
  patientName: string;
}

export function DashboardWelcomeBanner({ patientName }: DashboardWelcomeBannerProps) {
  return (
    <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-700/80 dark:to-violet-800/80 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden text-left">
      <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_70%)] pointer-events-none" />
      <div className="flex flex-col gap-2 relative z-10">
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome back, {patientName}!</h2>
        <p className="text-sm text-blue-100/90 max-w-xl leading-relaxed">
          Welcome to your patient portal. Easily view details, make booking requests, manage your schedules, and track your clinical notifications.
        </p>
      </div>
    </div>
  );
}
