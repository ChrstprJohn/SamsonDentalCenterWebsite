'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { StaffLoginDto } from '../../dtos/auth/staff-login.dto';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StaffLoginFormProps {
  register: UseFormRegister<StaffLoginDto>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<StaffLoginDto>;
  isLoading: boolean;
}

export function StaffLoginForm({ register, onSubmit, errors, isLoading }: StaffLoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full">
      <Input
        label="Staff Email *"
        type="email"
        error={errors.email?.message}
        {...register('email')}
        placeholder="staff@samsondental.com"
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
      </div>

      <Button type="submit" variant="primary" className="w-full mt-4" disabled={isLoading}>
        {isLoading ? 'Authenticating Staff...' : 'Staff Log In'}
      </Button>
    </form>
  );
}
