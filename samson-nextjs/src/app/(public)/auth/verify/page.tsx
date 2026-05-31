import { OTPVerifyView } from '@/modules/patients/views/otp-verify-view';
import { Suspense } from 'react';

export default function VerifyPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-905 dark:to-slate-950 min-h-screen">
      <Suspense fallback={<div className="text-slate-400">Loading verification details...</div>}>
        <OTPVerifyView />
      </Suspense>
    </main>
  );
}
