'use client';

import React from 'react';
import type { ServiceResponseDto } from '../dtos/management/service-response.dto';
import { Button } from '@/components/ui/button';

interface ServiceCardProps {
  service: ServiceResponseDto;
  index?: number;
  isSelected?: boolean;
  onSelect: (service: ServiceResponseDto) => void;
}

export function ServiceCard({ service, index, isSelected, onSelect }: ServiceCardProps) {
  return (
    <button
      onClick={() => onSelect(service)}
      className={`flex items-start w-full gap-3 border-b border-card-border/40 p-4 text-sm leading-tight text-left transition-colors last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
        isSelected
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-foreground'
      }`}
    >
      <div className="flex flex-col min-w-0 flex-1 gap-1.5">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="font-semibold text-foreground truncate">{service.name}</span>
          <span className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
            service.status === 'ACTIVE'
              ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400'
              : service.status === 'HIDDEN'
              ? 'text-amber-600 bg-amber-500/10 dark:text-amber-400'
              : 'text-rose-600 bg-rose-500/10 dark:text-rose-400'
          }`}>
            {service.status}
          </span>
        </div>

        <span className="text-xs text-text-secondary font-medium">
          {service.category || 'Uncategorized'}
        </span>

        {service.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 w-full">
            {service.description}
          </p>
        )}
      </div>
    </button>
  );
}
