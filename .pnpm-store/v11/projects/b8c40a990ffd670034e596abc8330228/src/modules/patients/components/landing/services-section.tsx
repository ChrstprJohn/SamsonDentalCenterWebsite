'use client';

import React from 'react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { ServiceCard } from './sub-components/service-card';
import { NoiseOverlay, ServiceListRow } from './sub-components/service-list-row';

interface ServicesSectionProps {
  services: ServiceResponseDto[];
  onSelectService: (service: ServiceResponseDto) => void;
}

const CARD_SERVICES = [
  {
    nr: '01',
    title: 'Complex Diagnostics',
    image: 'https://lavadental.lv/cms/api/media/file/Complex%20diagnostics-1290x300.avif',
  },
  {
    nr: '02',
    title: 'Professional Hygiene',
    image: 'https://lavadental.lv/cms/api/media/file/Hygien-600x820.avif',
  },
  {
    nr: '03',
    title: 'Veneers',
    image: 'https://lavadental.lv/cms/api/media/file/Veneers-600x820.avif',
  },
  {
    nr: '04',
    title: 'Dental Implants',
    image: 'https://lavadental.lv/cms/api/media/file/Implants-600x820.avif',
  },
  {
    nr: '05',
    title: 'ALL-ON-X',
    image: 'https://lavadental.lv/cms/api/media/file/Aligners-600x820.avif',
  },
];

const LIST_SERVICES = [
  { nr: '06', title: 'Sedation & Anaesthesia' },
  { nr: '07', title: 'Therapy' },
  { nr: '08', title: 'Endodontics' },
  { nr: '09', title: 'Surgery' },
  { nr: '10', title: 'Aligners' },
];

export function ServicesSection({ services, onSelectService }: ServicesSectionProps) {
  const handleItemClick = (title: string) => {
    const matched = services.find(
      (s) =>
        s.name.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(s.name.toLowerCase())
    );

    if (matched) {
      onSelectService(matched);
    } else if (services.length > 0) {
      onSelectService({
        ...services[0],
        name: title,
      });
    }
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
              <h2 className="font-sans text-[clamp(20px,2vw+10px,32px)] font-normal tracking-[-0.04em] text-[#141515] leading-[1.05]">
                Advanced biological dentistry designed to restore pristine harmony and structural balance.
              </h2>
            </div>
            <p className="text-[clamp(12px,0.3vw+11px,14px)] font-normal text-gray-500 max-w-sm leading-[1.65] font-sans pt-2">
              Experience the art and science of premium aesthetic treatments through our personalized therapeutic procedures, demonstrating pristine biological harmony and clinical perfection.
            </p>
          </div>

          {/* First Block: Gorgeous Bento Grid (01 to 05) overlap section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 relative z-10">
            {CARD_SERVICES.map((svc, idx) => (
              <ServiceCard key={svc.nr} {...svc} index={idx} onClick={() => handleItemClick(svc.title)} />
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
            {LIST_SERVICES.map((svc) => (
              <ServiceListRow key={svc.nr} {...svc} onClick={() => handleItemClick(svc.title)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
