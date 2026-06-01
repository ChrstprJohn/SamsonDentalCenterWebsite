'use client';

import React from 'react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

interface ServiceStepProps {
  services: ServiceResponseDto[];
  selectedService: ServiceResponseDto | null;
  onSelect: (service: ServiceResponseDto) => void;
}

export function ServiceStep({ services, selectedService, onSelect }: ServiceStepProps) {
  const getEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('whitening') || n.includes('bleach')) return '✨';
    if (n.includes('implants') || n.includes('crown') || n.includes('bridge')) return '🦷';
    if (n.includes('ortho') || n.includes('brace') || n.includes('aligner')) return '🪥';
    if (n.includes('clean') || n.includes('hyg')) return '🧼';
    return '🦷';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Choose a Treatment</h3>
        <p className="text-xs text-slate-500">Select the dental service you wish to schedule today.</p>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12 px-6 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mb-4">
            💤
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">No Services Available</h4>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            There are currently no dental services available for online booking. Please check back later or contact the clinic directly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => {
            const isSelected = selectedService?.id === service.id;
            return (
              <div
                key={service.id}
                onClick={() => onSelect(service)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-4 items-start ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-500/10 ring-2 ring-blue-500/20'
                    : 'border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900/30 hover:border-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl">
                  {getEmoji(service.name)}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base">
                      {service.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {service.description || 'Professional dental procedural session conducted by certified experts.'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-bold text-slate-400">⏳ {service.durationMinutes} mins</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {service.price !== null ? `$${service.price}` : 'Pricing TBD'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
