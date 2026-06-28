'use client';

import React from 'react';
import { useDoctorForm } from '../hooks/use-doctor-form';
import { ServicePillSelector } from './service-pill-selector';
import { Button } from '@/components/ui/button';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';

interface Service {
  id: string;
  name: string;
}

interface DoctorEditFormProps {
  doctor: any | null; // null if adding new
  allServices: Service[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function DoctorEditForm({ doctor, allServices, onSuccess, onCancel }: DoctorEditFormProps) {
  const { form, onSubmit, isSubmitting, serverError } = useDoctorForm({
    doctor,
    onSuccess,
  });

  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 p-5 bg-card rounded-2xl border border-card-border h-full">
      <h3 className="font-bold text-sm text-text-primary">
        {doctor ? 'Modify Doctor Profile' : 'Onboard New Doctor'}
      </h3>

      {serverError && (
        <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First Name"
          error={errors.firstName?.message}
          {...register('firstName')}
          className="text-xs py-2 px-3 h-9"
        />

        <Input
          label="Last Name"
          error={errors.lastName?.message}
          {...register('lastName')}
          className="text-xs py-2 px-3 h-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Middle Name"
          {...register('middleName')}
          className="text-xs py-2 px-3 h-9"
        />

        <Input
          label="Suffix"
          {...register('suffix')}
          className="text-xs py-2 px-3 h-9"
        />
      </div>

      <Input
        label="Email Address"
        type="email"
        error={errors.email?.message}
        {...register('email')}
        className="text-xs py-2 px-3 h-9"
      />

      <Input
        label="Phone Number"
        type="text"
        placeholder="+12345678901"
        error={errors.phoneNumber?.message}
        {...register('phoneNumber')}
        className="text-xs py-2 px-3 h-9"
      />

      <Input
        label="Specialization"
        type="text"
        error={errors.specialization?.message}
        {...register('specialization')}
        className="text-xs py-2 px-3 h-9"
      />

      {!doctor && (
        <Input
          label="Default Password"
          type="text"
          error={errors.defaultPassword?.message}
          {...register('defaultPassword')}
          className="text-xs py-2 px-3 h-9"
        />
      )}

      {doctor && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-[10px] font-bold text-text-secondary uppercase">
            Operational Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="w-full text-xs py-2 px-3 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="HIDDEN">HIDDEN (Hidden on Website)</option>
            <option value="ARCHIVED">ARCHIVED (Retired/Inactive)</option>
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5 border-t border-card-border/50 pt-3">
        <label className="text-[10px] font-bold text-text-secondary uppercase">Services Mapped</label>
        <Controller
          name="serviceIds"
          control={control}
          render={({ field }) => (
            <ServicePillSelector
              allServices={allServices}
              selectedServiceIds={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex gap-2 mt-2 pt-3 border-t border-card-border/50">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1 text-[11px] h-9 rounded-xl font-bold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 text-[11px] h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
        >
          {isSubmitting ? 'Saving...' : 'Save Doctor'}
        </Button>
      </div>
    </form>
  );
}
