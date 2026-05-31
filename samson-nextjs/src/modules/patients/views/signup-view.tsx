'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignUpForm } from '../hooks/auth/use-sign-up-form.hook';
import { SignUpInput } from '../dtos/auth/sign-up.dto';
import { SignUpForm } from '../components/auth/signup-form';
import { useToast } from '@/components/feedback/toast-container';

export function SignUpView() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useSignUpForm();

  const onSubmit = async (data: SignUpInput) => {
    setIsLoading(true);
    // Simulate API registration call (mock-first)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    addToast('Account created successfully! Please verify your email with the OTP.', 'success');
    router.push(`/auth/verify?email=${encodeURIComponent(data.email)}&type=signup`);
  };

  return (
    <div className="w-full max-w-lg p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl">
      <div className="flex flex-col gap-2 mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Create Patient Account
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sign up to schedule and manage your dental appointments.
        </p>
      </div>

      <SignUpForm
        register={register}
        onSubmit={handleSubmit(onSubmit)}
        errors={errors}
        isLoading={isLoading}
      />

      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-6">
        Already have an account?{' '}
        <a href="/auth/login" className="text-blue-500 font-semibold hover:underline">
          Log In
        </a>
      </p>
    </div>
  );
}
