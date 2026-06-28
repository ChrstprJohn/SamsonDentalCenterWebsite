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
      className="group relative flex flex-col justify-between p-6 md:p-8 rounded-3xl border border-card-border bg-card shadow-lg shadow-slate-100/5 hover:shadow-2xl hover:shadow-primary-start/5 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
    >
      <div>
        {/* Dynamic Emoji Icon or Thumbnail */}
        <div className="w-12 h-12 rounded-2xl bg-accent-blue-bg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 mb-6 overflow-hidden border border-card-border">
          {service.imageUrl ? (
            <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
          ) : (
            getEmoji(service.name)
          )}
        </div>

        {/* Badges Container */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Specialization Badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${
            service.serviceType === 'SPECIALIZED'
              ? 'bg-purple-100/70 text-purple-700'
              : 'bg-accent-blue-bg text-accent-blue-text'
          }`}>
            {service.serviceType}
          </span>
          {/* Status Badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${
            service.status === 'ACTIVE'
              ? 'bg-green-100 text-green-700'
              : service.status === 'HIDDEN'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {service.status}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-blue-text transition-colors mb-2">
          {service.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 mb-6">
          {service.description || 'Professional dental diagnostic or treatment session conducted by premier expert practitioners.'}
        </p>
      </div>

      {/* Badges & CTA */}
      <div className="flex items-center justify-between border-t border-card-border pt-4 mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Duration</span>
          <span className="text-sm font-semibold text-text-secondary">
            ⏳ {service.durationMinutes} mins
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Price</span>
          <span className="text-sm font-bold text-accent-blue-text">
            {formatPrice(service.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
