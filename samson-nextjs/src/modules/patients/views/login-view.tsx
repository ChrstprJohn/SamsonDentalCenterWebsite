'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, LoginInput } from '../hooks/use-auth-schema';
import { LoginForm } from '../components/login-form';
import { useToast } from '@/components/feedback/toast-container';

export function LoginView() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    // Simulate API login call (mock-first)
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsLoading(false);
    
    addToast('Verification code sent to your email!', 'success');
    router.push(`/auth/verify?email=${encodeURIComponent(data.email)}&type=login`);
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl">
      <div className="flex flex-col gap-2 mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Welcome Back
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your email to verify and access your account.
        </p>
      </div>

      <LoginForm
        register={register}
        onSubmit={handleSubmit(onSubmit)}
        errors={errors}
        isLoading={isLoading}
      />

      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-6">
        Don't have an account yet?   {' '}
        <a href="/auth/signup" className="text-blue-500 font-semibold hover:underline">
          Sign Up
        </a>
      </p>
    </div>
  );
}
