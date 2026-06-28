'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { SignUpInput } from '../../dtos/auth/sign-up.dto';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SignUpFormProps {
  register: UseFormRegister<SignUpInput>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<SignUpInput>;
  isLoading: boolean;
}

export function SignUpForm({ register, onSubmit, errors, isLoading }: SignUpFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name *"
          error={errors.firstName?.message}
          {...register('firstName')}
          placeholder="John"
          disabled={isLoading}
        />
        <Input
          label="Middle Name"
          error={errors.middleName?.message}
          {...register('middleName')}
          placeholder="Robert"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Last Name *"
          error={errors.lastName?.message}
          {...register('lastName')}
          placeholder="Doe"
          disabled={isLoading}
        />
        <Input
          label="Suffix"
          error={errors.suffix?.message}
          {...register('suffix')}
          placeholder="Jr. / III"
          disabled={isLoading}
        />
      </div>

      <Input
        label="Email Address *"
        type="email"
        error={errors.email?.message}
        {...register('email')}
        placeholder="john.doe@example.com"
        disabled={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone Number (E.164) *"
          type="tel"
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
          placeholder="+1234567890"
          disabled={isLoading}
        />
        <Input
          label="Date of Birth *"
          type="date"
          error={errors.dateOfBirth?.message}
          {...register('dateOfBirth')}
          disabled={isLoading}
        />
      </div>

      <Input
        label="Password *"
        type="password"
        error={errors.password?.message}
        {...register('password')}
        placeholder="Create a strong password"
        autoComplete="new-password"
        disabled={isLoading}
      />

      <Input
        label="Confirm Password *"
        type="password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
        placeholder="Re-enter your password"
        autoComplete="new-password"
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
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </form>
  );
}
