import { LoginView } from '@/modules/patients/views/login-view';

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-905 dark:to-slate-950 min-h-screen">
      <LoginView />
    </main>
  );
}
