'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Service } from '../types';
import { Stethoscope, Pencil, X, Check, Trash2 } from 'lucide-react';

interface ServiceDetailPanelProps {
  service: Service | null;
  onToggleVisibility: () => void;
  onArchive: () => void;
  onEdit: () => void;
  isPending: boolean;
}

export function ServiceDetailPanel({
  service,
  onToggleVisibility,
  onArchive,
  onEdit,
  isPending,
}: ServiceDetailPanelProps) {
  if (!service) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
          <Stethoscope className="size-6 text-muted-foreground/60" />
        </div>
        <p className="text-xs font-medium text-foreground">No service selected</p>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px]">
          Select a service from the list to view details.
        </p>
      </div>
    );
  }

  const getBadgeVariant = (status: string) => {
    if (status === 'ACTIVE') return 'success';
    if (status === 'HIDDEN') return 'warning';
    return 'error';
  };

  const imgUrl = service.imageUrl || (service as any).image_url;

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <div
        className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        style={{ scrollbarWidth: 'thin' }}
        data-lenis-prevent
      >
        {/* Header Profile Section */}
        {imgUrl ? (
          <div className="w-full h-48 sm:h-56 overflow-hidden relative border-b border-card-border/40 bg-muted/20">
            <img src={imgUrl} alt={service.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent flex flex-col items-center justify-end p-5 text-center">
              <h2 className="text-2xl font-bold text-foreground">{service.name}</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {service.serviceType === 'SPECIALIZED' ? 'Specialized Service' : 'General Service'}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-48 sm:h-56 overflow-hidden relative border-b border-card-border/40 bg-muted/20 flex flex-col items-center justify-end p-5 text-center">
            <div className="size-14 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border border-border/60 overflow-hidden mb-3">
              <Stethoscope className="size-8 text-muted-foreground/70" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{service.name}</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {service.serviceType === 'SPECIALIZED' ? 'Specialized Service' : 'General Service'}
            </p>
          </div>
        )}

        {/* Current Status Section */}
        <div className="py-4 px-5 border-b border-card-border/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-medium text-foreground">Current Status</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              disabled={isPending}
              className="h-7 px-2.5 text-xs gap-1"
            >
              <Pencil className="size-3.5" /> Edit
            </Button>
          </div>
          <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">
            {service.status === 'ACTIVE'
              ? '🟢 Active (Available for online booking & internal system)'
              : service.status === 'HIDDEN'
              ? '🟡 Hidden Online (Hidden from online booking portal, internal staff only)'
              : '🔴 Archived (Disabled across all platforms and clinic catalog)'}
          </div>
        </div>

        {/* Service Information Section */}
        <div className="py-4 px-5 border-b border-card-border/40">
          <span className="text-base font-medium text-foreground block mb-3">Service Information</span>
          <div className="flex flex-col gap-3">
            <ServiceField label="Service Title" value={service.name} />

            <div className="grid grid-cols-2 gap-3">
              <ServiceField label="Category Type" value={service.serviceType || 'GENERAL'} />
              <ServiceField
                label="Display Ranking"
                value={service.ranking != null ? String(service.ranking) : 'Alphabetical'}
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Description</span>
              <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground leading-relaxed border-card-border cursor-default min-h-[80px]">
                {service.description || 'No detailed description provided.'}
              </div>
            </div>
          </div>
        </div>

        {/* Service Photo Section */}
        <div className="py-4 px-5">
          <span className="text-base font-medium text-foreground block mb-3">Service Photo</span>
          {imgUrl ? (
            <div className="flex items-center gap-3 p-3 border border-card-border rounded-xl bg-muted/50">
              <img
                src={imgUrl}
                alt={service.name}
                className="w-12 h-12 rounded-lg object-cover border border-card-border"
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">Current Service Photo</span>
                <span className="text-[11px] text-muted-foreground">Displayed on online booking portal & clinic catalog.</span>
              </div>
            </div>
          ) : (
            <div className="w-full px-4 py-3 rounded-xl border bg-muted/50 text-xs text-muted-foreground border-card-border cursor-default italic">
              No cover image uploaded yet. Click &quot;Edit&quot; to upload an image.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function ServiceField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground leading-5 border-card-border cursor-default">
        {value}
      </div>
    </div>
  );
}
