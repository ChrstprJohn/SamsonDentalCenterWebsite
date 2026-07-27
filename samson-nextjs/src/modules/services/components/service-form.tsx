'use client';

import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateServiceFormValues } from '../hooks/use-service-form-schema';
import { Button } from '@/components/ui/button';
import { Stethoscope, Check, X } from 'lucide-react';

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

  const titleVal = form.watch('name') || 'New Treatment Service';
  const categoryVal = form.watch('serviceType') || 'GENERAL';
  const imgUrl = form.watch('imageUrl') || form.watch('image_url' as any) || undefined;

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
        {imgUrl ? (
          <div className="w-full h-48 sm:h-56 overflow-hidden relative border-b border-card-border/40 bg-muted/20">
            <img src={imgUrl} alt={titleVal} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent flex flex-col items-center justify-end p-5 text-center">
              <h2 className="text-2xl font-bold text-foreground">{isEditMode ? titleVal : 'Add New Treatment Service'}</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {categoryVal === 'SPECIALIZED' ? 'Specialized Service' : 'General Service'}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-48 sm:h-56 overflow-hidden relative border-b border-card-border/40 bg-muted/20 flex flex-col items-center justify-end p-5 text-center">
            <div className="size-14 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border border-border/60 overflow-hidden mb-3">
              <Stethoscope className="size-8 text-muted-foreground/70" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {isEditMode ? titleVal : 'Add New Treatment Service'}
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {categoryVal === 'SPECIALIZED' ? 'Specialized Service' : 'General Service'}
            </p>
          </div>
        )}

        {/* Service Information Section */}
        <div className="py-4 px-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-medium text-foreground">Service Information</span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting} className="h-7 px-2.5 text-xs gap-1">
                <X className="size-3.5" /> Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="h-7 px-2.5 text-xs gap-1 bg-slate-900 text-white rounded-md disabled:cursor-not-allowed">
                <Check className="size-3.5" /> {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Service Title</span>
              <input
                type="text"
                required
                {...register('name')}
                className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
              />
              {errors.name && <span className="text-[10px] text-red-600 font-semibold">{errors.name.message}</span>}
            </div>

            {/* Service Status Select */}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground font-medium">Current Status</span>
              <select
                {...register('status')}
                className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border font-medium"
              >
                <option value="ACTIVE">🟢 Active (Available for online booking & internal system)</option>
                <option value="HIDDEN">🟡 Hidden Online (Hidden from online booking portal, internal staff only)</option>
                <option value="ARCHIVED">🔴 Archived (Disabled across all platforms and clinic catalog)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Category Type</span>
                <select
                  {...register('serviceType')}
                  className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border font-medium"
                >
                  <option value="GENERAL">GENERAL</option>
                  <option value="SPECIALIZED">SPECIALIZED</option>
                </select>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Duration (Minutes)</span>
                <input
                  type="number"
                  required
                  {...register('durationMinutes')}
                  className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                />
                {errors.durationMinutes && <span className="text-[10px] text-red-600 font-semibold">{errors.durationMinutes.message}</span>}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Base Price ($)</span>
              <input
                type="number"
                step="0.01"
                required
                {...register('price')}
                className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
              />
              {errors.price && <span className="text-[10px] text-red-600 font-semibold">{errors.price.message}</span>}
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Description</span>
              <textarea
                rows={3}
                {...register('description')}
                className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
              />
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-xs text-muted-foreground">Service Cover Image</span>
              {form.watch('imageUrl') && (
                <div className="flex items-center gap-3 p-2 border border-card-border rounded-xl bg-card-border/5 mb-1">
                  <img
                    src={form.watch('imageUrl') || undefined}
                    alt="Current service image"
                    className="w-10 h-10 rounded-lg object-cover border border-card-border"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">Current Image</span>
                    <span className="text-[10px] text-muted-foreground">Will be replaced if a new file is uploaded.</span>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                {...register('imageFile')}
                className="w-full px-3 py-2 rounded-xl border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
