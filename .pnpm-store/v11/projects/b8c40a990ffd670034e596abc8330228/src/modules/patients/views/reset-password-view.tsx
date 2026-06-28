'use client';

import React from 'react';
import { useResetPasswordView } from '../hooks/auth/reset-password/use-reset-password-view';
import { ResetPasswordForm } from '../components/auth/reset-password-form';

export function ResetPasswordView() {
  const { form, isLoading, onSubmit } = useResetPasswordView();

  return (
    <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl">
      <div className="flex flex-col gap-2 mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Enter New Password
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Please enter your new password below.
        </p>
      </div>

      <ResetPasswordForm
        register={form.register}
        onSubmit={form.handleSubmit(onSubmit)}
        errors={form.formState.errors}
        isLoading={isLoading}
      />
    </div>
  );
}
