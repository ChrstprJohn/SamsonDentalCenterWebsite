'use client';

import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateServiceFormValues } from '../hooks/use-service-form-schema';
import { Button } from '@/components/ui/button';

interface ServiceFormProps {
  form: UseFormReturn<CreateServiceFormValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  serverError: string | null;
  isEditMode: boolean;
}

export function ServiceForm({
  form,
  onSubmit,
  onCancel,
  isSubmitting,
  serverError,
  isEditMode,
}: ServiceFormProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={onSubmit} className="bg-card border border-card-border p-6 rounded-3xl shadow-sm flex flex-col gap-5 text-xs">
      <div>
        <h3 className="text-sm font-bold text-text-primary">
          {isEditMode ? '🔧 Edit Treatment Details' : '✨ Add New Treatment'}
        </h3>
        <p className="text-[10px] text-text-muted mt-0.5">
          Enter treatment specifications. Offerings display in booking system if active.
        </p>
      </div>

      {serverError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl font-medium border border-red-200">
          ⚠️ {serverError}
        </div>
      )}

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="font-semibold text-text-secondary">Service Name</label>
        <input
          type="text"
          required
          {...register('name')}
          className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
        />
        {errors.name && <span className="text-[10px] text-red-600 font-semibold">{errors.name.message}</span>}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="font-semibold text-text-secondary">Description</label>
        <textarea
          rows={3}
          {...register('description')}
          className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Price */}
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-text-secondary">Base Price ($)</label>
          <input
            type="number"
            step="0.01"
            required
            {...register('price')}
            className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary w-full"
          />
          {errors.price && <span className="text-[10px] text-red-600 font-semibold">{errors.price.message}</span>}
        </div>

        {/* Duration */}
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-text-secondary">Duration (minutes)</label>
          <input
            type="number"
            required
            {...register('durationMinutes')}
            className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary w-full"
          />
          {errors.durationMinutes && <span className="text-[10px] text-red-600 font-semibold">{errors.durationMinutes.message}</span>}
        </div>
      </div>

      {/* Service Type */}
      <div className="flex flex-col gap-1.5">
        <label className="font-semibold text-text-secondary">Service Category</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" value="GENERAL" {...register('serviceType')} className="accent-accent-blue-text" />
            <span>General Dentistry</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" value="SPECIALIZED" {...register('serviceType')} className="accent-accent-blue-text" />
            <span>Specialized Service</span>
          </label>
        </div>
      </div>

      {/* Image File Input */}
      <div className="flex flex-col gap-1.5">
        <label className="font-semibold text-text-secondary">Service Image (Optional)</label>
        {form.watch('imageUrl') && (
          <div className="flex items-center gap-3 p-2 border border-card-border rounded-xl bg-card-border/5 mb-1.5">
            <img
              src={form.watch('imageUrl') || undefined}
              alt="Current service image"
              className="w-12 h-12 rounded-lg object-cover border border-card-border"
            />
            <div className="flex flex-col">
              <span className="font-medium text-text-primary">Current Image</span>
              <span className="text-[10px] text-text-muted">Will be overwritten if you select a new file.</span>
            </div>
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          {...register('imageFile')}
          className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary w-full file:mr-4 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-accent-blue-bg file:text-accent-blue-text hover:file:bg-accent-blue-bg/80"
        />
        <span className="text-[10px] text-text-muted">JPG, PNG, or WebP. Max size 2MB.</span>
      </div>

      {/* Buttons */}
      <div className="flex justify-end items-center gap-2 pt-2 border-t border-card-border">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Treatment'}
        </Button>
      </div>
    </form>
  );
}
