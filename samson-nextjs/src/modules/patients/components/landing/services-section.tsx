'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { ServiceList } from './sub-components/service-list';
import { ServiceListRow, NoiseOverlay } from './sub-components/service-list-row';

interface ServicesSectionProps {
  services: ServiceResponseDto[];
  onSelectService: (service: ServiceResponseDto) => void;
}

const CARD_COUNT = 5;

export function ServicesSection({ services, onSelectService }: ServicesSectionProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const cardServices = services.slice(0, CARD_COUNT);
  const listServices = services.slice(CARD_COUNT);

  const handleSelect = (svc: ServiceResponseDto) => {
    if (pendingId) return;
    setPendingId(svc.id);
    // ponytail: 800ms artificial delay so loading shows; client nav is instant otherwise
    setTimeout(() => onSelectService(svc), 800);
  };

  return (
    <section id="services" className="bg-[#FDFDFD] relative overflow-hidden w-full">
      {/* Upper Part: Elegant White background with Header and service list */}
      <div className="relative z-10 pt-24 sm:pt-32 pb-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          {/* Header Layout */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-20 md:mb-24 gap-4 sm:gap-6">
            <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
              <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
                Our Services
              </span>
              <h2 className="font-sans text-[20px] sm:text-[clamp(22px,2vw+10px,32px)] font-normal leading-[1.3] sm:leading-[1.2] md:leading-[1.15] tracking-[-0.03em] text-[#1D1E1E]">
                Explore the range of services{' '}
                <br className="hidden lg:block" />
                we offer at our clinic.
              </h2>
            </div>
            <p className="max-w-sm pt-2 sm:pt-2 md:max-w-[280px] lg:max-w-sm font-sans text-[13px] sm:text-[clamp(12px,0.3vw+11px,14px)] font-normal leading-relaxed text-gray-500">
              We offer a complete range of dental treatments, from routine cleanings to advanced procedures, so you can find the service that is right for you.
            </p>
          </div>

          {/* First Block: Plain list (01 to 05) */}
          <div className="relative z-10">
            <ServiceList services={cardServices} onSelect={handleSelect} />
          </div>
        </div>
      </div>

      {/* Lower Part: Dark charcoal match to the marquee */}
      <div className="bg-[#1D1E1E] relative pt-0 pb-16 sm:pb-20 mt-0 z-0">
        <NoiseOverlay />
        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
          <div className="divide-y divide-[#D94E4E]/10">
            {listServices.map((svc, idx) => (
              <ServiceListRow
                key={svc.id}
                nr={String(cardServices.length + idx + 1).padStart(2, '0')}
                title={svc.name}
                onClick={() => handleSelect(svc)}
              />
            ))}
          </div>
        </div>
      </div>
      {pendingId && (
        <div className="fixed inset-0 z-50 bg-[#1D1E1E]/85 backdrop-blur-md flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-[#D94E4E] animate-spin" />
          <p className="text-white text-sm tracking-wide">Taking you to booking...</p>
        </div>
      )}
    </section>
  );
}
