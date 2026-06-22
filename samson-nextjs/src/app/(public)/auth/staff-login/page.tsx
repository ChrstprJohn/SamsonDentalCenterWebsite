import { Suspense } from 'react';
import { StaffLoginView } from '@/modules/staff/views/staff-login-view';

export default function StaffLoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 min-h-screen">
      <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}>
        <StaffLoginView />
      </Suspense>
    </main>
  );
}
