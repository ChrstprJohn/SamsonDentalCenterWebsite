import { ForgotPasswordView } from '@/modules/patients/views/forgot-password-view';

export default function ForgotPasswordPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-905 dark:to-slate-950 min-h-screen">
      <ForgotPasswordView />
    </main>
  );
}
