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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services.map((service) => {
            const isSelected = selectedService?.id === service.id;
            return (
              <div
                key={service.id}
                onClick={() => onSelect(service)}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-4 items-start hover:scale-[1.01] active:scale-[0.99] ${
                  isSelected
                    ? 'border-blue-500 bg-blue-550/5 dark:bg-blue-500/10 ring-2 ring-blue-500/20 shadow-md shadow-blue-500/5'
                    : 'border-slate-200 dark:border-white/10 bg-card/60 backdrop-blur-md hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 ${
                  isSelected 
                    ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/30' 
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                }`}>
                  {getEmoji(service.name)}
                </div>
                <div className="flex-1 flex flex-col justify-between min-h-[90px]">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base tracking-tight leading-snug">
                      {service.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed font-medium">
                      {service.description || 'Professional dental procedural session conducted by certified experts.'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-150/60 dark:border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase flex items-center gap-1">
                      ⏱ {service.durationMinutes} mins
                    </span>
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                      isSelected
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
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
