'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { forcePasswordChangeAction } from '../actions/force-password-change.action';
import { useToast } from '@/components/feedback/toast-container';
import { Button } from '@/components/ui/button';

export function ForcePasswordChangeForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await forcePasswordChangeAction({ password });
      if (response.success) {
        addToast('Password updated successfully! Please log in again.', 'success');
        
        // Log out user to clear session
        const { createClient } = await import('@/shared/database/client');
        const supabase = createClient();
        await supabase.auth.signOut();
        
        router.push('/login');
      } else {
        setError(response.error || 'Failed to update password');
        addToast(response.error || 'Failed to update password', 'error');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl">
      <div className="flex flex-col gap-2 mb-6 text-center">
        <span className="text-3xl">🔒</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Reset Your Password
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This is your first login. For security reasons, please configure a new private password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-xs h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold mt-2"
        >
          {isSubmitting ? 'Updating...' : 'Set Password'}
        </Button>
      </form>
    </div>
  );
}
