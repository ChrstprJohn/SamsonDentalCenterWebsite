'use client';

import React from 'react';
import type { ServiceResponseDto } from '../dtos/management/service-response.dto';
import { Button } from '@/components/ui/button';

interface ServiceCardProps {
  service: ServiceResponseDto;
  onSelect: (service: ServiceResponseDto) => void;
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'Contact for pricing';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('whitening') || n.includes('bleach')) return '✨';
    if (n.includes('implants') || n.includes('crown') || n.includes('bridge')) return '🦷';
    if (n.includes('ortho') || n.includes('brace') || n.includes('aligner')) return '🪥';
    if (n.includes('clean') || n.includes('hyg')) return '🧼';
    if (n.includes('extract') || n.includes('surg')) return '🩺';
    return '🦷';
  };

  return (
    <div
      onClick={() => onSelect(service)}
      className="group relative flex flex-col justify-between p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-white/5 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-lg shadow-slate-100/5 dark:shadow-none hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
    >
      <div>
        {/* Dynamic Emoji Icon */}
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 mb-6">
          {getEmoji(service.name)}
        </div>

        {/* Specialization Badge */}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-3 ${
          service.serviceType === 'SPECIALIZED'
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-655 dark:text-purple-400'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-655 dark:text-blue-400'
        }`}>
          {service.serviceType}
        </span>

        {/* Name */}
        <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mb-2">
          {service.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-6">
          {service.description || 'Professional dental diagnostic or treatment session conducted by premier expert practitioners.'}
        </p>
      </div>

      {/* Badges & CTA */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4 mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Duration</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">
            ⏳ {service.durationMinutes} mins
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Price</span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(service.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
