'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { resetPasswordSchema, ResetPasswordDto } from '../../../dtos/auth/reset-password.dto';
import { useToast } from '@/components/feedback/toast-container';
import { resetPasswordAction } from '../../../actions/auth/reset-password.action';

export function useResetPasswordView() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const form = useForm<ResetPasswordDto>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordDto) => {
    setIsLoading(true);
    const response = await resetPasswordAction(data);
    setIsLoading(false);

    if (!response.success) {
      if (response.fieldErrors) {
        Object.entries(response.fieldErrors).forEach(([field, errors]) => {
          form.setError(field as keyof ResetPasswordDto, {
            type: 'server',
            message: errors[0],
          });
        });
      }
      addToast(response.error || 'Failed to reset password', 'error');
      return;
    }

    addToast('Password successfully reset! You can now log in.', 'success');
    router.push('/');
  };

  return { form, isLoading, onSubmit };
}
