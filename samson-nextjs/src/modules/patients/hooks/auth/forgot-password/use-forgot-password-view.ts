'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { forgotPasswordSchema, ForgotPasswordDto } from '../../../dtos/auth/forgot-password.dto';
import { useToast } from '@/components/feedback/toast-container';
import { requestPasswordResetAction } from '../../../actions/auth/request-password-reset.action';

export function useForgotPasswordView() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const form = useForm<ForgotPasswordDto>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordDto) => {
    setIsLoading(true);
    const response = await requestPasswordResetAction(data);
    setIsLoading(false);

    if (!response.success) {
      if (response.fieldErrors) {
        Object.entries(response.fieldErrors).forEach(([field, errors]) => {
          form.setError(field as keyof ForgotPasswordDto, {
            type: 'server',
            message: errors[0],
          });
        });
      }
      addToast(response.error || 'Failed to request password reset', 'error');
      return;
    }

    addToast('If an account with that email exists, we sent a reset link.', 'success');
    router.push(`/auth/verify?email=${encodeURIComponent(data.email)}&type=recovery`);
  };

  return { form, isLoading, onSubmit };
}
