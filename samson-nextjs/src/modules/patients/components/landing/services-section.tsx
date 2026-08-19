'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { ServiceCard } from './sub-components/service-card';
import { NoiseOverlay, ServiceListRow } from './sub-components/service-list-row';

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
      {/* Upper Part: Elegant White background with Header and image cards */}
      <div className="relative z-10 pt-24 sm:pt-32 pb-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          {/* Header Layout */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-24 gap-6">
            <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
              <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-4 font-sans">
                Our Services
              </span>
              <h2 className="font-sans text-[18px] sm:text-[clamp(20px,2vw+10px,32px)] font-normal leading-[1.05] tracking-[-0.04em] text-[#1D1E1E]">
                Explore the range of services
                <br className="hidden lg:block" />
                we offer at our clinic.
              </h2>
            </div>
<p className="max-w-sm pt-1 font-sans text-[12px] sm:pt-2 md:max-w-[280px] lg:max-w-sm sm:text-[clamp(12px,0.3vw+11px,14px)] font-normal leading-[1.65] text-gray-500">
                We offer a complete range of dental treatments, from routine cleanings to advanced procedures, so you can find the service that is right for you.
              </p>
          </div>

          {/* First Block: Gorgeous Bento Grid (01 to 05) overlap section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 relative z-10">
            {cardServices.map((svc, idx) => (
              <ServiceCard
                key={svc.id}
                nr={String(idx + 1).padStart(2, '0')}
                title={svc.name}
                image={svc.imageUrl ?? undefined}
                index={idx}
                onClick={() => handleSelect(svc)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Lower Part / Background Switch: Deep cohesive dark charcoal match to the marquee */}
      {/* Negative margins allow the image grid cards to gorgeously overlap onto the dark section by ~12.5% (45px) */}
      <div className="bg-[#1D1E1E] relative pt-[115px] sm:pt-[135px] pb-24 sm:pb-32 mt-[-85px] z-0">
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
