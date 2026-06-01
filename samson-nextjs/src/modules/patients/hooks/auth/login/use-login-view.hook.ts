'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginForm } from './use-login-form.hook';
import { useToast } from '@/components/feedback/toast-container';
import { loginAction } from '../../../actions/auth/login.action';
import { handleActionError } from '@/shared/utils/action-response';
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
  const form = useLoginForm();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  const onSubmit = async (data: LoginInput): Promise<void> => {
    setIsLoading(true);
    
    // Call the server action
    const response = await loginAction(data);
    
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

    // Success flow - Check if it was OTP or Password
    addToast('Logged in successfully!', 'success');
    // If password login succeeded, we have a session immediately. Navigate to portal.
    // (Typically you might check roles and route, but for now route to user portal)
    router.push('/user');
  };

  return { isLoading, register, handleSubmit, errors, onSubmit };
}
