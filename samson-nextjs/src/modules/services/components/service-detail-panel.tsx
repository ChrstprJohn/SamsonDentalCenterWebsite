'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { Service } from '../types';

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
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-card-border rounded-3xl bg-card h-full min-h-[400px]">
        <span className="text-4xl mb-4">🦷</span>
        <h4 className="text-sm font-bold text-text-primary">No Service Selected</h4>
        <p className="text-xs text-text-muted mt-1">Select a service from the left list to view or edit details.</p>
      </div>
    );
  }

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'Contact for pricing';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="bg-card border border-card-border p-6 rounded-3xl shadow-sm flex flex-col gap-6">
      {service.imageUrl && (
        <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-card-border shadow-inner">
          <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-card-border">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🦷</span>
          <div>
            <h3 className="text-lg font-bold text-text-primary">{service.name}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mt-1 ${
              service.serviceType === 'SPECIALIZED'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-accent-blue-bg text-accent-blue-text'
            }`}>
              {service.serviceType}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button onClick={onEdit} variant="outline" size="sm" disabled={isPending || service.status === 'ARCHIVED'}>
            Edit
          </Button>
          <Button onClick={onArchive} variant="destructive" size="sm" disabled={isPending || service.status === 'ARCHIVED'}>
            Archive
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 text-xs">
        <div className="flex justify-between items-center bg-card-border/10 p-3 rounded-xl">
          <span className="text-text-muted font-medium">Online Booking Status</span>
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${
              service.status === 'ACTIVE' 
                ? 'text-green-600' 
                : service.status === 'HIDDEN' 
                ? 'text-amber-600' 
                : 'text-red-600'
            }`}>
              {service.status === 'ACTIVE' ? 'Active' : service.status === 'HIDDEN' ? 'Hidden' : 'Archived'}
            </span>
            {service.status !== 'ARCHIVED' && (
              <button
                onClick={onToggleVisibility}
                disabled={isPending}
                className={`w-9 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  service.status === 'ACTIVE' ? 'bg-green-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                    service.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card-border/10 p-4 rounded-xl flex flex-col gap-1">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Duration</span>
            <span className="text-sm font-bold text-text-primary">⏳ {service.durationMinutes} mins</span>
          </div>
          <div className="bg-card-border/10 p-4 rounded-xl flex flex-col gap-1">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Base Price</span>
            <span className="text-sm font-bold text-accent-blue-text">{formatPrice(service.price)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Description</span>
          <p className="text-xs text-text-secondary leading-relaxed bg-card-border/10 p-4 rounded-xl min-h-[80px]">
            {service.description || 'No description provided.'}
          </p>
        </div>
      </div>
    </div>
  );
}
