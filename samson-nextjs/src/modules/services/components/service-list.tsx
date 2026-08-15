'use client';

import React from 'react';
import { ServiceCard } from './service-card';
import type { Service } from '../types';
import { Layers } from 'lucide-react';

interface ServiceListProps {
  services: Service[];
  selectedId: string | null;
  onSelect: (service: Service) => void;
}

export function ServiceList({ services, selectedId, onSelect }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="size-10 rounded-full bg-muted/30 flex items-center justify-center mb-2.5">
          <Layers className="size-5 text-muted-foreground/60" />
        </div>
        <span className="text-xs font-medium text-foreground">No services found</span>
        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">Try adjusting your search query or tab filter.</p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      style={{ scrollbarWidth: 'thin' }}
      data-lenis-prevent
    >
      <div className="flex flex-col">
        {services.map((svc, index) => (
          <ServiceCard
            key={svc.id}
            index={index}
            service={svc as any}
            isSelected={selectedId === svc.id}
            onSelect={onSelect as any}
          />
        ))}
      </div>
    </div>
  );
}
