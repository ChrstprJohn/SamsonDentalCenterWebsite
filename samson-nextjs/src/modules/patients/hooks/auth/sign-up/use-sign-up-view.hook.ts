'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignUpForm } from './use-sign-up-form.hook';
import { useToast } from '@/components/feedback/toast-container';
import { registerPatientAction } from '../../../actions/profile/register-patient.action';
import { handleActionError } from '@/shared/utils/action-response';
import type { SignUpInput } from '../../../dtos/auth/sign-up.dto';

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
  const form = useSignUpForm();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  const onSubmit = async (data: SignUpInput): Promise<void> => {
    setIsLoading(true);
    
    // Call the server action
    const response = await registerPatientAction(data);
    
    setIsLoading(false);

    if (!response.success) {
      // Pipe the server action field errors into React Hook Form
      const globalError = handleActionError(response, setError);
      
      // If there's a global error that wasn't just field validation, show a toast
      if (globalError) {
        addToast(globalError, 'error');
      }
      return;
    }

    addToast('Account created successfully! Please verify your email with the OTP.', 'success');
    router.push(`/auth/verify?email=${encodeURIComponent(data.email)}&type=signup`);
  };

  return { isLoading, register, handleSubmit, errors, onSubmit };
}
