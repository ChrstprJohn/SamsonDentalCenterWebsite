'use client';

import React, { useState } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { LoginInput } from '../../dtos/auth/login.dto';
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

      <div className="flex flex-col gap-1.5">
        <Input
          label="Password *"
          type="password"
          error={errors.password?.message}
          {...register('password')}
          placeholder="••••••••"
          disabled={isLoading}
        />
        <div className="flex justify-end">
          <a href="/auth/forgot-password" className="text-xs text-blue-500 font-semibold hover:underline">
            Forgot Password?
          </a>
        </div>
      </div>



      <Button type="submit" variant="primary" className="w-full mt-4" disabled={isLoading}>
        {isLoading ? 'Signing In...' : 'Log In'}
      </Button>
    </form>
  );
}
