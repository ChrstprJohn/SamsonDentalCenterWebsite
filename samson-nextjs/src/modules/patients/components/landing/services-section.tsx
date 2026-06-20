'use client';

import React from 'react';
import { MoveRight } from 'lucide-react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

interface ServicesSectionProps {
  services: ServiceResponseDto[];
  onSelectService: (service: ServiceResponseDto) => void;
}

const CARD_SERVICES = [
  {
    nr: '01',
    title: 'Complex Diagnostics',
    image: '/images/svc-diagnostics.png',
  },
  {
    nr: '02',
    title: 'Professional Hygiene',
    image: '/images/svc-hygiene.png',
  },
  {
    nr: '03',
    title: 'Veneers',
    image: '/images/svc-veneers.png',
  },
  {
    nr: '04',
    title: 'Dental Implants',
    image: '/images/svc-implants.png',
  },
  {
    nr: '05',
    title: 'ALL-ON-X',
    image: '/images/svc-aligners.png',
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
  const getCardColSpan = (index: number) => {
    if (index === 0) return 'col-span-2 lg:col-span-4';
    return 'col-span-1 lg:col-span-1';
  };

  const handleItemClick = (title: string) => {
    // Try to find a matching service in the database payload
    const matched = services.find(
      (s) =>
        s.name.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(s.name.toLowerCase())
    );

    if (matched) {
      onSelectService(matched);
    } else if (services.length > 0) {
      // Fallback to first available service with updated title name
      onSelectService({
        ...services[0],
        name: title,
      });
    }
  };

  return (
    <section id="services" className="bg-[#FDFDFD] relative overflow-hidden w-full">
      {/* Upper Part: Header and Bento Image Grid */}
      <div className="relative z-10 pt-24 sm:pt-32 pb-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          {/* Header Layout */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-24 gap-6">
            <div className="max-w-xl">
              <span className="text-[10px] tracking-[0.34em] text-[#D94E4E] uppercase font-bold block mb-4">
                Clinical Expertise
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#1D1E1E]">
                Bespoke Treatment Programs
              </h2>
            </div>
            <p className="text-sm font-light text-gray-500 max-w-sm leading-relaxed">
              We approach every patient’s anatomy as a clinical masterpiece, designing custom therapeutic strategies that balance structural health and perfect facial balance.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 relative z-10">
            {CARD_SERVICES.map((svc, idx) => {
              const words = svc.title.split(' ');
              return (
                <div
                  key={svc.nr}
                  onClick={() => handleItemClick(svc.title)}
                  className={`group relative h-[250px] xs:h-[300px] sm:h-[380px] md:h-[400px] lg:h-[480px] rounded-[16px] sm:rounded-[24px] overflow-hidden shadow-md block ${getCardColSpan(idx)} bg-[#141515] cursor-pointer`}
                >
                  <img
                    src={svc.image}
                    alt={svc.title}
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.025] transition-transform duration-700 ease-out filter brightness-[0.75] saturate-[0.95] contrast-[1.01]"
                  />
                  <div className="absolute inset-0 bg-[#1D1E1E]/20 z-5 transition-opacity duration-300 group-hover:opacity-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-10" />

                  {/* Top Details */}
                  <span className="absolute top-3 left-3 sm:top-6 sm:left-6 text-white font-josefin font-bold text-[18px] sm:text-[22px] md:text-[26px] lg:text-[30px] z-15">
                    {svc.nr}
                  </span>
                  <div className="absolute top-3 right-3 sm:top-6 sm:right-6 w-7 h-7 sm:w-12 sm:h-12 bg-white text-[#141515] group-hover:bg-[#D94E4E] group-hover:text-white rounded-full flex items-center justify-center font-semibold shadow-md z-15 transition-all duration-300">
                    <MoveRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 z-15 max-w-[85%]">
                    <h3 className="font-josefin text-left text-[18px] sm:text-[22px] md:text-[26px] lg:text-[30px] font-bold text-white tracking-tight leading-tight">
                      {words.length === 2 ? (
                        <>
                          {words[0]}
                          <br />
                          {words[1]}
                        </>
                      ) : (
                        svc.title
                      )}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lower Part / Background Switch: Deep cohesive dark charcoal */}
      <div className="bg-[#141515] relative pt-20 pb-24 sm:pb-32 mt-[-45px] z-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
          <div className="mb-8 border-b border-[#D94E4E]/15" />
          <div className="divide-y divide-[#D94E4E]/10">
            {LIST_SERVICES.map((svc, idx) => {
              const words = svc.title.split(' ');
              return (
                <div
                  key={svc.nr}
                  onClick={() => handleItemClick(svc.title)}
                  className="group flex items-center justify-between py-6 sm:py-8 transition-colors duration-300 hover:bg-[#1C1D1D]/70 px-4 sm:px-6 rounded-2xl cursor-pointer"
                >
                  {/* Index Left */}
                  <span className="font-josefin font-bold text-white/90 group-hover:text-white transition-colors w-12 sm:w-24 text-left text-[18px] sm:text-[22px] md:text-[26px] lg:text-[30px]">
                    {svc.nr}
                  </span>

                  {/* Title Center */}
                  <h4 className="font-josefin font-semibold tracking-tight text-white/95 group-hover:text-white transition-colors flex-1 text-center text-[18px] sm:text-[22px] md:text-[26px] lg:text-[30px] leading-tight">
                    {words.length === 2 ? (
                      <>
                        {words[0]}
                        <br />
                        {words[1]}
                      </>
                    ) : words.length === 3 && words[1] === '&' ? (
                      <>
                        {words[0]} &
                        <br />
                        {words[2]}
                      </>
                    ) : (
                      svc.title
                    )}
                  </h4>

                  {/* Right container matching width of left container */}
                  <div className="w-12 sm:w-24 flex justify-end">
                    <div className="w-11 h-11 bg-white/5 group-hover:bg-[#D94E4E] rounded-full border border-white/10 flex items-center justify-center text-white/80 group-hover:text-white transition-all duration-300">
                      <MoveRight className="w-5 h-5 transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
