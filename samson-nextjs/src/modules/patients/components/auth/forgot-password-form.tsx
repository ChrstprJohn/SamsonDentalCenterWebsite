import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ForgotPasswordDto } from '../../dtos/auth/forgot-password.dto';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ForgotPasswordFormProps {
  register: UseFormRegister<ForgotPasswordDto>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<ForgotPasswordDto>;
  isLoading: boolean;
}

export function ForgotPasswordForm({ register, onSubmit, errors, isLoading }: ForgotPasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full">
      <Input
        label="Email Address *"
        type="email"
        error={errors.email?.message}
        {...register('email')}
        placeholder="john.doe@example.com"
        disabled={isLoading}
      />

      <Button type="submit" variant="primary" className="w-full mt-4" disabled={isLoading}>
        {isLoading ? 'Sending Link...' : 'Send Reset Link'}
      </Button>
    </form>
  );
}
