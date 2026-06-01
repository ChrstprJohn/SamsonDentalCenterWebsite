'use client';

import React from 'react';
import { useForgotPasswordView } from '../hooks/auth/forgot-password/use-forgot-password-view.hook';
import { ForgotPasswordForm } from '../components/auth/forgot-password-form';

export function ForgotPasswordView() {
  const { form, isLoading, onSubmit } = useForgotPasswordView();

  return (
    <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl">
      <div className="flex flex-col gap-2 mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Reset Password
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we'll send you a verification code to reset your password.
        </p>
      </div>

      <ForgotPasswordForm
        register={form.register}
        onSubmit={form.handleSubmit(onSubmit)}
        errors={form.formState.errors}
        isLoading={isLoading}
      />

      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-6">
        Remember your password?{' '}
        <a href="/auth/login" className="text-blue-500 font-semibold hover:underline">
          Log In
        </a>
      </p>
    </div>
  );
}
