'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
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
  const [selectedService, setSelectedService] = useState<ServiceResponseDto | null>(null);
  const cardServices = services.slice(0, CARD_COUNT);
  const listServices = services.slice(CARD_COUNT);

  const handleSelect = (svc: ServiceResponseDto) => {
    if (pendingId) return;
    setPendingId(svc.id);
    setSelectedService(null);
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
            <ServiceList services={cardServices} onSelect={setSelectedService} />
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
                onClick={() => setSelectedService(svc)}
              />
            ))}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selectedService && (
          <motion.div
            onClick={() => setSelectedService(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-[#070808]/90 backdrop-blur-sm p-4 sm:p-8"
          >
            <motion.div
              onClick={(event) => event.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-md bg-[#FDFDFD] p-6 sm:p-8"
            >
              <button
                onClick={() => setSelectedService(null)}
                aria-label="Close"
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-[#1D1E1E]/50 hover:text-[#D94E4E] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
                Our Services
              </span>
              <h3 className="font-sans text-[18px] sm:text-[22px] font-normal tracking-[-0.03em] text-[#1D1E1E] leading-[1.2]">
                {selectedService.name}
              </h3>
              {selectedService.description && (
                <div className="mt-3 font-sans text-[13px] leading-relaxed text-gray-500">
                  {renderDescription(selectedService.description)}
                </div>
              )}
              <button
                onClick={() => handleSelect(selectedService)}
                className="mt-6 w-full py-3.5 bg-[#1D1E1E] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#D94E4E] transition-all duration-300 cursor-pointer"
              >
                Request Appointment
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {pendingId && (
        <div className="fixed inset-0 z-50 bg-[#1D1E1E]/85 backdrop-blur-md flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-[#D94E4E] animate-spin" />
          <p className="text-white text-sm tracking-wide">Taking you to booking...</p>
        </div>
      )}
    </section>
  );
}

function renderDescription(desc: string) {
  const lines = desc.split('\n').map((l) => l.trim()).filter(Boolean);
  let bulleted = false;
  return lines.map((line, i) => {
    if (line.endsWith(':')) {
      bulleted = true;
      return (
        <p key={i} className="mt-3 pt-3 border-t border-gray-100 text-[11px] font-semibold uppercase tracking-widest text-[#1D1E1E]">
          {line !== 'Includes:' ? line : ''}
        </p>
      );
    }
    if (bulleted) {
      return (
        <p key={i} className="flex items-start gap-2 mt-1.5">
          <span className="mt-[7px] w-1 h-1 rounded-full bg-[#D94E4E] shrink-0" />
          {line}
        </p>
      );
    }
    return <p key={i}>{line}</p>;
  });
}
