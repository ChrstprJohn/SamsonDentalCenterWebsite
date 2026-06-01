import { ResetPasswordView } from '@/modules/patients/views/reset-password-view';

export default function ResetPasswordPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-905 dark:to-slate-950 min-h-screen">
      <ResetPasswordView />
    </main>
  );
}
