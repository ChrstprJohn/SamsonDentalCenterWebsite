'use client';

import React from 'react';
import { ServiceCard } from './service-card';
import type { Service } from '../types';

interface ServiceListProps {
  services: Service[];
  selectedId: string | null;
  onSelect: (service: Service) => void;
}

export function ServiceList({ services, selectedId, onSelect }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-card-border rounded-3xl bg-card">
        <span className="text-3xl mb-2">🔍</span>
        <h4 className="text-sm font-bold text-text-primary">No treatments found</h4>
        <p className="text-xs text-text-muted mt-1">Try adjusting your filters or add a new treatment.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-2">
      {services.map((svc) => (
        <div
          key={svc.id}
          className={`${
            selectedId === svc.id ? 'ring-2 ring-accent-blue-text' : ''
          } rounded-3xl`}
        >
          <ServiceCard service={svc as any} onSelect={onSelect as any} />
        </div>
      ))}
    </div>
  );
}
