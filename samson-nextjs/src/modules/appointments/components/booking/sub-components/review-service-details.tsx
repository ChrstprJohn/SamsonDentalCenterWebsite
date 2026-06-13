import React from 'react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

interface ReviewServiceDetailsProps {
  service: ServiceResponseDto | null;
  onEditStep?: (step: 1 | 2 | 3 | 4) => void;
}

export function ReviewServiceDetails({ service, onEditStep }: ReviewServiceDetailsProps) {
  return (
    <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 bg-card/50 dark:bg-slate-900/30 relative shadow-sm hover:scale-[1.01] transition-all duration-300 text-left">
      {onEditStep && (
        <button
          onClick={() => onEditStep(1)}
          className="absolute top-5 right-5 text-xs font-bold text-blue-500 hover:text-blue-600 hover:underline cursor-pointer"
        >
          Edit
        </button>
      )}
      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">1. Service Details</h4>
      <div className="flex flex-col gap-2">
        <span className="font-bold text-slate-800 dark:text-slate-200 text-base">{service?.name}</span>
        {service?.description && <p className="text-sm text-slate-500 dark:text-slate-400">{service.description}</p>}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10">
            ⏱ {service?.durationMinutes} mins
          </span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
            💰 {service?.price !== null ? `$${service?.price}` : 'Pricing TBD'}
          </span>
        </div>
      </div>
    </div>
  );
}
