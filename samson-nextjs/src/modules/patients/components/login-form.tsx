import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { LoginInput } from '../hooks/use-auth-schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LoginFormProps {
  register: UseFormRegister<LoginInput>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<LoginInput>;
  isLoading: boolean;
}

export function LoginForm({ register, onSubmit, errors, isLoading }: LoginFormProps) {
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

      <div className="flex flex-col gap-2 mt-2">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-350 dark:border-white/10 text-blue-600 focus:ring-blue-500/50 cursor-pointer"
            {...register('acceptTerms')}
            disabled={isLoading}
          />
          <span className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
            I accept the{' '}
            <a href="#" className="text-blue-500 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-500 hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-[11px] font-semibold text-red-500">{errors.acceptTerms.message}</p>
        )}
      </div>

      <Button type="submit" variant="primary" className="w-full mt-4" disabled={isLoading}>
        {isLoading ? 'Sending OTP Verification...' : 'Log In'}
      </Button>
    </form>
  );
}
