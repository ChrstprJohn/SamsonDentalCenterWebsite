'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStaffLoginForm } from './use-staff-login-form.hook';
import { useToast } from '@/components/feedback/toast-container';
import { staffLoginAction } from '../../../actions/auth/staff-login.action';
import { handleActionError } from '@/shared/utils/action-response';
import type { StaffLoginDto } from '../../../dtos/auth/staff-login.dto';

export interface UseStaffLoginViewReturn {
  isLoading: boolean;
  register: ReturnType<typeof useStaffLoginForm>['register'];
  handleSubmit: ReturnType<typeof useStaffLoginForm>['handleSubmit'];
  errors: ReturnType<typeof useStaffLoginForm>['formState']['errors'];
  onSubmit: (data: StaffLoginDto) => Promise<void>;
}

export function useStaffLoginView(): UseStaffLoginViewReturn {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const form = useStaffLoginForm();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  const onSubmit = async (data: StaffLoginDto): Promise<void> => {
    setIsLoading(true);
    const response = await staffLoginAction(data);
    setIsLoading(false);

    if (!response.success) {
      const globalError = handleActionError(response, setError);
      if (globalError) {
        addToast(globalError, 'error');
      }
      return;
    }

    addToast('Logged in successfully!', 'success');

    // Determine redirect path based on staff role metadata
    const userRole = response.data?.user?.user_metadata?.role || 'SECRETARY';
    let defaultRedirect = '/secretary';
    if (userRole === 'ADMIN') {
      defaultRedirect = '/admin';
    } else if (userRole === 'DOCTOR') {
      defaultRedirect = '/doctor';
    }

    const redirectTo = searchParams.get('redirect') || defaultRedirect;
    router.push(redirectTo);
  };

  return { isLoading, register, handleSubmit, errors, onSubmit };
}
