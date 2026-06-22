'use client';

import React from 'react';
import { useStaffLoginView } from '../hooks/auth/login/use-staff-login-view.hook';
import { StaffLoginForm } from '../components/auth/staff-login-form';

export function StaffLoginView() {
  const { isLoading, register, handleSubmit, errors, onSubmit } = useStaffLoginView();

  return (
    <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl">
      <div className="flex flex-col gap-2 mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Staff Portal
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your staff credentials to log in.
        </p>
      </div>

      <StaffLoginForm
        register={register}
        onSubmit={handleSubmit(onSubmit)}
        errors={errors}
        isLoading={isLoading}
      />
    </div>
  );
}
