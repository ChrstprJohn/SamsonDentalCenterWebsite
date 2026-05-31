'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginForm } from './use-login-form.hook';
import { useToast } from '@/components/feedback/toast-container';
import type { LoginInput } from '../../../dtos/auth/login.dto';

export interface UseLoginViewReturn {
  isLoading: boolean;
  register: ReturnType<typeof useLoginForm>['register'];
  handleSubmit: ReturnType<typeof useLoginForm>['handleSubmit'];
  errors: ReturnType<typeof useLoginForm>['formState']['errors'];
  onSubmit: (data: LoginInput) => Promise<void>;
}

export function useLoginView(): UseLoginViewReturn {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useLoginForm();

  const onSubmit = async (data: LoginInput): Promise<void> => {
    setIsLoading(true);
    // Mock-first: simulate login API
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsLoading(false);

    addToast('Verification code sent to your email!', 'success');
    router.push(`/auth/verify?email=${encodeURIComponent(data.email)}&type=login`);
  };

  return { isLoading, register, handleSubmit, errors, onSubmit };
}
