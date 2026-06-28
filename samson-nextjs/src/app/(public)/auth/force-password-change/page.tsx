import React, { Suspense } from 'react';
import { ForcePasswordChangeForm } from '@/modules/doctors/components/force-password-change-form';

export const dynamic = 'force-dynamic';

export default function ForcePasswordChangePage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-905 dark:to-slate-950 min-h-screen">
      <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}>
        <ForcePasswordChangeForm />
      </Suspense>
    </main>
  );
}
