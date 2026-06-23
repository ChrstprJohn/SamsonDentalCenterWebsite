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
  const getCardColSpan = (index: number) => {
    if (index === 0) return 'col-span-2 md:col-span-4';
    return 'col-span-1 md:col-span-1';
  };

  const getCardHeightClass = (index: number) => {
    if (index === 0) return 'h-[195px] xs:h-[235px] sm:h-[275px] md:h-[220px] lg:h-[315px]';
    return 'h-[240px] xs:h-[275px] sm:h-[315px] md:h-[250px] lg:h-[365px]';
  };

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
            {CARD_SERVICES.map((svc, idx) => {
              const words = svc.title.split(' ');
              return (
                <div
                  key={svc.nr}
                  onClick={() => handleItemClick(svc.title)}
                  className={`group relative ${getCardHeightClass(idx)} rounded-none overflow-hidden block ${getCardColSpan(idx)} bg-[#1D1E1E] cursor-pointer`}
                >
                  <img
                    src={svc.image}
                    alt={svc.title}
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.025] transition-transform duration-700 ease-out filter brightness-[0.9] saturate-[0.95] contrast-[1.01]"
                  />
                  {/* Consistent Light-Dark overlay and contrast enhancement */}
                  <div className="absolute inset-0 bg-[#1D1E1E]/5 z-5 transition-opacity duration-350 group-hover:opacity-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent z-10" />

                  {/* Top Details */}
                  <span className="absolute top-3 left-3 sm:top-6 sm:left-6 text-white font-josefin font-normal text-[clamp(16px,1.2vw+8px,22px)] z-15">
                    {svc.nr}
                  </span>
                  <div className="absolute top-3 right-3 sm:top-6 sm:right-6 w-[clamp(36px,3.5vw+12px,54px)] h-[clamp(36px,3.5vw+12px,54px)] bg-white text-[#141515] group-hover:bg-[#D94E4E] group-hover:text-white rounded-full flex items-center justify-center font-normal shadow-md z-15 transition-all duration-300">
                    <MoveRight className="w-[clamp(16px,1.2vw+6px,24px)] h-[clamp(16px,1.2vw+6px,24px)] transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
                  </div>

                  {/* Title (Bottom Left) - Pure White Font consistent with Hero */}
                  <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 z-15 max-w-[85%]">
                    <h3 className="font-josefin text-left text-[clamp(16px,2vw+10px,30px)] font-normal text-white tracking-tight leading-tight">
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

      {/* Lower Part / Background Switch: Deep cohesive dark charcoal match to the marquee */}
      {/* Negative margins allow the image grid cards to gorgeously overlap onto the dark section by ~12.5% (45px) */}
      <div className="bg-[#1D1E1E] relative pt-[115px] sm:pt-[135px] pb-24 sm:pb-32 mt-[-85px] z-0">
        {/* ponytail: CSS SVG noise overlay */}
        <div 
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />
        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
          <div className="divide-y divide-[#D94E4E]/10">
            {LIST_SERVICES.map((svc, idx) => (
              <div
                key={svc.nr}
                onClick={() => handleItemClick(svc.title)}
                className="group relative flex items-center justify-between py-6 sm:py-8 transition-colors duration-300 hover:bg-[#1C1D1D]/70 px-4 sm:px-6 rounded-2xl cursor-pointer overflow-hidden"
              >
                {/* ponytail: CSS SVG noise overlay visible on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-[0.06] mix-blend-overlay pointer-events-none z-0 transition-opacity duration-300"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                  }}
                />
                {/* Index Left */}
                <span className="relative z-10 text-[clamp(18px,1vw+10px,24px)] font-josefin font-normal text-white/75 group-hover:text-white transition-colors w-12 sm:w-24 text-left">
                  {svc.nr}
                </span>

                {/* Title Center - Consistent with Hero typography */}
                <h4 className="relative z-10 font-josefin text-[clamp(16px,2vw+10px,30px)] font-normal tracking-tight text-white/90 group-hover:text-white transition-colors flex-1 text-center leading-[1.1]">
                  {(() => {
                    const listWords = svc.title.split(' ');
                    if (listWords.length === 2) {
                      return (
                        <>
                          {listWords[0]}
                          <br />
                          {listWords[1]}
                        </>
                      );
                    }
                    if (listWords.length === 3 && (listWords[1] === '&' || listWords[1].toLowerCase() === 'and')) {
                      return (
                        <>
                          {listWords[0]} {listWords[1]}
                          <br />
                          {listWords[2]}
                        </>
                      );
                    }
                    return svc.title;
                  })()}
                </h4>

                {/* Right container matching width of left container to guarantee true centering of the title */}
                <div className="relative z-10 w-12 sm:w-24 flex justify-end">
                  {/* Circular Arrow Button (pointing North-East initially, clockwise rot to East under hover) */}
                  <div className="w-[clamp(36px,3.5vw+12px,54px)] h-[clamp(36px,3.5vw+12px,54px)] bg-white/5 group-hover:bg-[#D94E4E] rounded-full border border-white/10 flex items-center justify-center text-white/80 group-hover:text-white transition-all duration-305">
                    <MoveRight className="w-[clamp(16px,1.2vw+6px,24px)] h-[clamp(16px,1.2vw+6px,24px)] transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
