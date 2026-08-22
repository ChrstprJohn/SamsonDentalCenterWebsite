'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MoveRight } from 'lucide-react';

export interface ServiceDetail {
  name: string;
  description: string;
  subOptions?: string[];
}

export interface ServiceCategoryGroup {
  id: string;
  category: string;
  services: ServiceDetail[];
}

export interface FlatServiceItem extends ServiceDetail {
  categoryId: string;
  category: string;
}

const CATEGORY_SERVICES_DATA: ServiceCategoryGroup[] = [
  {
    id: 'consultation',
    category: 'Consultation',
    services: [
      {
        name: 'Consultation',
        description: 'Comprehensive oral examination, clinical assessment, and personalized treatment planning with our dental specialists.',
      },
    ],
  },
  {
    id: 'diagnostics',
    category: 'Diagnostics',
    services: [
      {
        name: 'Periapical digital x-ray',
        description: 'High-resolution close-up imaging of individual teeth to detect hidden decay, root conditions, and bone levels.',
      },
      {
        name: 'Panoramic and cephalometric digital x-ray',
        description: 'Full-mouth panoramic scan and orthodontic skull imaging for overall jaw alignment, wisdom teeth evaluation, and structural analysis.',
      },
      {
        name: 'CBCT',
        description: 'Advanced 3D Cone Beam Computed Tomography volumetric imaging for precise implant planning and complex surgical navigation.',
      },
      {
        name: 'Digital oral scanning and smile designing',
        description: 'Intraoral 3D optical scanning for comfortable, highly accurate digital impressions and aesthetic smile simulation.',
      },
    ],
  },
  {
    id: 'preventive',
    category: 'Preventive Dentistry',
    services: [
      {
        name: 'Oral prophylaxis',
        description: 'Professional ultrasonic scaling and polishing to eliminate plaque, calculus (tartar), and surface stains for optimal gum health.',
      },
      {
        name: 'Fluoride treatments',
        description: 'Enamel-strengthening mineral application to protect teeth against cavities and reduce sensitivity.',
      },
      {
        name: 'Sealants',
        description: 'Protective resin coating applied to the chewing surfaces of back teeth to prevent food trapping and cavity formation.',
      },
    ],
  },
  {
    id: 'restorative',
    category: 'Restorative Dentistry',
    services: [
      {
        name: 'Dental fillings',
        description: 'Natural tooth-colored composite restorations to repair decay, fractures, and wear seamlessly.',
      },
      {
        name: 'Inlays and Onlays',
        description: 'Custom-crafted laboratory restorations designed for moderate tooth damage, providing superior strength while preserving healthy enamel.',
      },
    ],
  },
  {
    id: 'prosthodontics',
    category: 'Prosthodontics',
    services: [
      {
        name: 'Crowns and Bridges',
        description: 'Durable custom full-coverage restorations designed to cap damaged teeth or span gaps from missing teeth.',
        subOptions: ['Metal', 'Porcelain', 'Zirconia'],
      },
      {
        name: 'Dentures (full and partial)',
        description: 'Custom-crafted removable dental prosthetics to restore chewing function, speech clarity, and facial aesthetics.',
        subOptions: ['Precision attachments', 'Flexible denture', 'Ivocap', 'Metal frameworks'],
      },
    ],
  },
  {
    id: 'endodontics',
    category: 'Endodontics',
    services: [
      {
        name: 'Root canal treatment',
        description: 'Specialized therapy to remove infected dental pulp, thoroughly disinfect the canal system, and save the natural tooth.',
      },
      {
        name: 'Apicoectomy',
        description: 'Microsurgical procedure to remove persistent infection at the root tip and seal the canal terminus.',
      },
      {
        name: 'Pulpotomy / Pulpectomy',
        description: 'Targeted vital pulp therapy or emergency pulp removal to relieve severe pain and preserve compromised teeth.',
      },
    ],
  },
  {
    id: 'cosmetic',
    category: 'Cosmetic Dentistry',
    services: [
      {
        name: 'Tooth whitening',
        description: 'Safe, clinically proven whitening treatments designed to lift stubborn deep stains and brighten your smile.',
        subOptions: ['Chair-side', 'Take home'],
      },
      {
        name: 'Laser crown lengthening',
        description: 'Gentle laser recontouring of gum tissue to expose more natural tooth structure for cosmetic balance or restorations.',
      },
      {
        name: 'Veneers',
        description: 'Ultra-thin handcrafted ceramic or composite facings bonded to front teeth to perfect color, shape, and alignment.',
        subOptions: ['Porcelain', 'Composite'],
      },
    ],
  },
  {
    id: 'orthodontics',
    category: 'Orthodontics',
    services: [
      {
        name: 'Traditional metal braces',
        description: 'Reliable orthodontic brackets and archwires engineered for comprehensive correction of complex alignment and bite issues.',
      },
      {
        name: 'Clear aligners',
        description: 'Discreet, removable transparent aligner trays that gently shift teeth into proper position without metal hardware.',
        subOptions: ['Invisalign', 'Realigner'],
      },
      {
        name: 'Retainers and space maintainers',
        description: 'Custom fixed or removable appliances to preserve teeth in their corrected positions post-treatment or hold space for growing teeth.',
      },
    ],
  },
  {
    id: 'oral-surgery',
    category: 'Oral Surgery and Implants',
    services: [
      {
        name: 'Dental implants',
        description: 'Biocompatible titanium fixtures surgically anchored into the jawbone to serve as permanent artificial tooth roots.',
      },
      {
        name: 'Bone grafting and sinus implants',
        description: 'Advanced regenerative procedures to augment deficient jawbone volume and create a solid anchor for implants.',
      },
      {
        name: 'Tooth extraction',
        description: 'Gentle and precise removal of severely damaged, non-restorable, or problematic teeth under local anesthesia.',
        subOptions: ['Simple', 'Complex', 'Impacted'],
      },
    ],
  },
  {
    id: 'specialized',
    category: 'Specialized Care',
    services: [
      {
        name: 'Periodontal treatments for gum disease',
        description: 'Deep scaling, root planing, and therapeutic antimicrobial care to halt active gum infections and bone loss.',
      },
      {
        name: 'TMJ / TMD Therapy',
        description: 'Comprehensive diagnosis and therapeutic solutions including custom splints to relieve jaw joint pain, clicking, and clenching.',
      },
      {
        name: 'Sleep Appliance (anti-snoring device)',
        description: 'Custom-engineered nighttime oral appliance that comfortably repositions the jaw to maintain open airways and reduce snoring.',
      },
      {
        name: 'Botox for gummy smile',
        description: 'Minimally invasive neuromodulator injections that gently relax hyperactive upper lip muscles for a balanced smile line.',
      },
    ],
  },
];

interface CategoryServicesSectionProps {
  onBook?: (serviceName?: string) => void;
}

export function CategoryServicesSection({ onBook }: CategoryServicesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allServices: FlatServiceItem[] = useMemo(() => {
    return CATEGORY_SERVICES_DATA.flatMap((cat) =>
      cat.services.map((svc) => ({
        ...svc,
        categoryId: cat.id,
        category: cat.category,
      }))
    );
  }, []);

  const displayedServices = useMemo(() => {
    if (selectedCategory === 'all') {
      return allServices;
    }
    return allServices.filter((svc) => svc.categoryId === selectedCategory);
  }, [allServices, selectedCategory]);

  const handleBooking = (serviceName: string) => {
    if (onBook) {
      onBook(serviceName);
    }
  };

  return (
    <section id="services-directory" className="relative w-full bg-[#FDFDFD] py-16 sm:py-24 border-t border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4 sm:gap-6">
          <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
            <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
              Comprehensive Services
            </span>
            <h2 className="font-sans text-[20px] sm:text-[clamp(22px,2vw+10px,32px)] font-normal leading-[1.3] sm:leading-[1.2] md:leading-[1.15] tracking-[-0.03em] text-[#1D1E1E]">
              Specialized Care &amp; Treatments
            </h2>
          </div>
          <p className="max-w-sm pt-2 sm:pt-2 md:max-w-[280px] lg:max-w-sm font-sans text-[13px] sm:text-[clamp(12px,0.3vw+11px,14px)] font-normal leading-relaxed text-gray-500">
            Filter by specialty or view all procedures. Choose your required service and book directly online.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="mb-10 sm:mb-12 overflow-x-auto no-scrollbar pb-2">
          <div className="inline-flex items-center gap-2 p-1.5 bg-[#F4F4F5] rounded-xl border border-gray-200/80 min-w-full sm:min-w-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold font-sans tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#1D1E1E] text-white shadow-xs'
                  : 'text-gray-600 hover:text-[#1D1E1E] hover:bg-white'
              }`}
            >
              <span>All</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200/70 text-gray-500'
                }`}
              >
                {allServices.length}
              </span>
            </button>
            {CATEGORY_SERVICES_DATA.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold font-sans tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1D1E1E] text-white shadow-xs'
                      : 'text-gray-600 hover:text-[#1D1E1E] hover:bg-white'
                  }`}
                >
                  <span>{cat.category}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-200/70 text-gray-500'
                    }`}
                  >
                    {cat.services.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
          <p className="text-xs text-gray-400 font-sans">
            Showing <span className="font-semibold text-[#1D1E1E]">{displayedServices.length}</span> {displayedServices.length === 1 ? 'service' : 'services'}
            {selectedCategory !== 'all' && (
              <> in <span className="text-[#D94E4E] font-medium">{CATEGORY_SERVICES_DATA.find((c) => c.id === selectedCategory)?.category}</span></>
            )}
          </p>
        </div>

        {/* Grid of Service Cards */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          <AnimatePresence mode="popLayout">
            {displayedServices.map((svc, idx) => (
              <motion.div
                key={svc.name}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: (idx % 6) * 0.03, ease: 'easeOut' }}
                className="group border border-gray-100 bg-white p-5 sm:p-7 transition-all duration-300 hover:border-[#D94E4E]/30 hover:shadow-md flex flex-col justify-between h-full rounded-sm"
              >
                <div>
                  {/* Category Tag before/above name */}
                  <div className="mb-2">
                    <span className="inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#D94E4E] font-sans">
                      {svc.category}
                    </span>
                  </div>

                  {/* Main Service Title */}
                  <h4 className="text-[#1D1E1E] text-[15px] sm:text-[17px] font-semibold tracking-tight min-h-0 sm:min-h-[44px] flex items-center group-hover:text-[#D94E4E] transition-colors leading-snug">
                    {svc.name}
                  </h4>

                  {/* Main Service Description */}
                  <p className="mt-1.5 sm:mt-2 text-[12px] sm:text-[14px] text-gray-500 leading-relaxed font-light">
                    {svc.description}
                  </p>

                  {/* Sub-items (Only when subOptions exist) */}
                  {svc.subOptions && svc.subOptions.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-col gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 font-sans block">
                        Includes / Options:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {svc.subOptions.map((opt) => (
                          <div key={opt} className="flex items-center gap-2 text-[12px] sm:text-[13px] text-[#4F5454] font-light">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D94E4E] shrink-0" />
                            <span className="leading-snug">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end">
                  {onBook ? (
                    <button
                      type="button"
                      onClick={() => handleBooking(svc.name)}
                      aria-label={`Book ${svc.name}`}
                      className="w-9 h-9 sm:w-10 sm:h-10 bg-[#1D1E1E]/5 group-hover:bg-[#D94E4E] rounded-full border border-[#1D1E1E]/10 flex items-center justify-center text-[#1D1E1E] group-hover:text-white transition-all duration-300 shadow-2xs cursor-pointer"
                    >
                      <MoveRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
                    </button>
                  ) : (
                    <Link
                      href="/book"
                      aria-label={`Book ${svc.name}`}
                      className="w-9 h-9 sm:w-10 sm:h-10 bg-[#1D1E1E]/5 group-hover:bg-[#D94E4E] rounded-full border border-[#1D1E1E]/10 flex items-center justify-center text-[#1D1E1E] group-hover:text-white transition-all duration-300 shadow-2xs"
                    >
                      <MoveRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

