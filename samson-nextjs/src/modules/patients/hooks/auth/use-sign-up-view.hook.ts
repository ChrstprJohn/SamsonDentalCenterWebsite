'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignUpForm } from './use-sign-up-form.hook';
import { useToast } from '@/components/feedback/toast-container';
import type { SignUpInput } from '../../dtos/auth/sign-up.dto';

export interface UseSignUpViewReturn {
  isLoading: boolean;
  register: ReturnType<typeof useSignUpForm>['register'];
  handleSubmit: ReturnType<typeof useSignUpForm>['handleSubmit'];
  errors: ReturnType<typeof useSignUpForm>['formState']['errors'];
  onSubmit: (data: SignUpInput) => Promise<void>;
}

export function useSignUpView(): UseSignUpViewReturn {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useSignUpForm();

  const onSubmit = async (data: SignUpInput): Promise<void> => {
    setIsLoading(true);
    // Mock-first: simulate registration API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);

    addToast('Account created successfully! Please verify your email with the OTP.', 'success');
    router.push(`/auth/verify?email=${encodeURIComponent(data.email)}&type=signup`);
  };

  return { isLoading, register, handleSubmit, errors, onSubmit };
}
