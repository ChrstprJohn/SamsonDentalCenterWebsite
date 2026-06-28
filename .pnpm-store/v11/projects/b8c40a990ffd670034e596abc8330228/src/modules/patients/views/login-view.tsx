'use client';

import React from 'react';
import { useLoginView } from '../hooks/auth/login/use-login-view';
import { LoginForm } from '../components/auth/login-form';

export function LoginView() {
  const { isLoading, register, handleSubmit, errors, onSubmit } = useLoginView();

  return (
    <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl">
      <div className="flex flex-col gap-2 mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Welcome Back
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your credentials to access your account.
        </p>
      </div>

      <LoginForm
        register={register}
        onSubmit={handleSubmit(onSubmit)}
        errors={errors}
        isLoading={isLoading}
      />

      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-6">
        Don&apos;t have an account yet?{' '}
        <a href="/auth/signup" className="text-blue-500 font-semibold hover:underline">
          Sign Up
        </a>
      </p>
    </div>
  );
}
