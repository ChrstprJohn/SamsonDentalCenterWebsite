import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ResetPasswordDto } from '../../dtos/auth/reset-password.dto';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ResetPasswordFormProps {
  register: UseFormRegister<ResetPasswordDto>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<ResetPasswordDto>;
  isLoading: boolean;
}

export function ResetPasswordForm({ register, onSubmit, errors, isLoading }: ResetPasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full">
      <Input
        label="New Password *"
        type="password"
        error={errors.password?.message}
        {...register('password')}
        placeholder="••••••••"
        disabled={isLoading}
      />

      <Input
        label="Confirm New Password *"
        type="password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
        placeholder="••••••••"
        disabled={isLoading}
      />

      <Button type="submit" variant="primary" className="w-full mt-4" disabled={isLoading}>
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );
}
