'use client';

export function BookToast({ toast }: { toast: { message: string; type: 'success' | 'error' } | null }) {
  if (!toast) return null;

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slideUp ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
      <span className="text-xs font-bold">{toast.message}</span>
    </div>
  );
}
