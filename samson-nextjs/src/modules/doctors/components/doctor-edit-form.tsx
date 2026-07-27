'use client';

import React from 'react';
import { useDoctorForm } from '../hooks/use-doctor-form';
import { ServicePillSelector } from './service-pill-selector';
import { Button } from '@/components/ui/button';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { UserRound, Check, X } from 'lucide-react';


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
    setValue,
    watch,
    formState: { errors },
  } = form;

  const firstName = watch('firstName') || doctor?.firstName || '';
  const lastName = watch('lastName') || doctor?.lastName || '';
  const fullName = firstName || lastName
    ? `Dr. ${firstName} ${lastName}`.trim()
    : 'Add New Doctor';

  const avatarUrl = watch('avatarUrl') || doctor?.avatarUrl;

  return (
    <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 h-full">
      <div
        className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        style={{ scrollbarWidth: 'thin' }}
        data-lenis-prevent
      >
        {serverError && (
          <div className="bg-red-50 text-red-600 p-3 mx-5 mt-4 rounded-xl text-xs font-medium border border-red-200">
            ⚠️ {serverError}
          </div>
        )}

        {/* Header Profile Section */}
        <div className="w-full py-8 px-5 border-b border-card-border/40 bg-muted/20 flex flex-col items-center justify-center text-center">
          {avatarUrl ? (
            <div className="size-20 shrink-0 rounded-full border-2 border-primary/20 overflow-hidden bg-card shadow-sm mb-3">
              <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="size-20 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border border-border/60 overflow-hidden mb-3">
              <UserRound className="size-12 text-muted-foreground/70 translate-y-0.5" />
            </div>
          )}
          <h2 className="text-2xl font-bold text-foreground">
            {fullName}
          </h2>
        </div>

        {/* Current Status Section */}
        <div className="py-4 px-5 border-b border-card-border/40">
          <span className="text-base font-medium text-foreground block mb-3">Current Status</span>
          {doctor ? (
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border font-medium"
            >
              <option value="ACTIVE">🟢 Active (Available for schedule & internal roster)</option>
              <option value="ARCHIVED">🔴 Archived (Disabled across all platforms and clinic roster)</option>
            </select>
          ) : (
            <div className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground border-card-border font-medium cursor-default">
              🟢 Active (Will be set automatically upon onboarding)
            </div>
          )}
        </div>

        {/* Doctor Information Section */}
        <div className="py-4 px-5 border-b border-card-border/40">
          <span className="text-base font-medium text-foreground block mb-3">Doctor Information</span>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">First Name <span className="text-red-500 font-bold ml-0.5">*</span></span>
                <input
                  type="text"
                  required
                  {...register('firstName')}
                  className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                />
                {errors.firstName && <span className="text-[10px] text-red-600 font-semibold">{errors.firstName.message}</span>}
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Last Name <span className="text-red-500 font-bold ml-0.5">*</span></span>
                <input
                  type="text"
                  required
                  {...register('lastName')}
                  className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                />
                {errors.lastName && <span className="text-[10px] text-red-600 font-semibold">{errors.lastName.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Middle Name</span>
                <input
                  type="text"
                  {...register('middleName')}
                  className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Suffix</span>
                <input
                  type="text"
                  {...register('suffix')}
                  className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Contact Section */}
        <div className="py-4 px-5 border-b border-card-border/40">
          <span className="text-base font-medium text-foreground block mb-3">Doctor Contact</span>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Phone Number</span>
              <input
                type="text"
                placeholder="+12345678901"
                {...register('phoneNumber')}
                className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
              />
              {errors.phoneNumber && <span className="text-[10px] text-red-600 font-semibold">{errors.phoneNumber.message}</span>}
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Email Address <span className="text-red-500 font-bold ml-0.5">*</span></span>
              <input
                type="email"
                required
                {...register('email')}
                className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
              />
              <span className="text-[11px] text-muted-foreground">
                This email address serves as the login username for the doctor&apos;s account.
              </span>
              {errors.email && <span className="text-[10px] text-red-600 font-semibold">{errors.email.message}</span>}
            </div>
          </div>
        </div>

        {/* Account Credentials Section (Only when onboarding new doctor) */}
        {!doctor && (
          <div className="py-4 px-5 border-b border-card-border/40">
            <span className="text-base font-medium text-foreground block mb-3">Account Credentials</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Default Password <span className="text-red-500 font-bold ml-0.5">*</span></span>
              <input
                type="text"
                required
                {...register('defaultPassword')}
                className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
              />
              <span className="text-[11px] text-muted-foreground">
                Initial password for doctor portal authentication. The doctor will be prompted to change this upon first login.
              </span>
              {errors.defaultPassword && <span className="text-[10px] text-red-600 font-semibold">{errors.defaultPassword.message}</span>}
            </div>
          </div>
        )}

        {/* Doctor Photo Section */}
        <div className="py-4 px-5">
          <span className="text-base font-medium text-foreground block mb-3">Doctor Photo / Avatar</span>
          <div className="flex flex-col gap-2">
            {avatarUrl && (
              <div className="flex items-center gap-3 p-3 border border-card-border rounded-xl bg-card-border/5 mb-1">
                <img
                  src={avatarUrl}
                  alt="Current doctor photo"
                  className="w-12 h-12 rounded-full object-cover border border-card-border"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">Current Photo</span>
                  <span className="text-[11px] text-muted-foreground">Will be replaced if a new photo is uploaded.</span>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              {...register('imageFile')}
              className="w-full px-3 py-2 rounded-xl border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary"
            />
            <span className="text-[11px] text-muted-foreground">
              Supports JPEG, PNG, WebP • Maximum file size: 5MB • Recommended aspect ratio: 1:1 (Square)
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-card-border/40 bg-background/95 backdrop-blur-sm flex items-center justify-end gap-3 z-10 shrink-0 shadow-lg">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-9 px-4 text-xs font-semibold rounded-xl gap-1.5"
        >
          <X className="size-4" /> Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          className="h-9 px-4 text-xs font-semibold rounded-xl gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:cursor-not-allowed"
        >
          <Check className="size-4" /> {isSubmitting ? (doctor ? 'Saving Changes...' : 'Creating Doctor...') : (doctor ? 'Save Changes' : 'Create Doctor')}
        </Button>
      </div>
    </form>
  );
}

