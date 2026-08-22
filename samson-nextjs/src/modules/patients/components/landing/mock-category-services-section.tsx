'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Loader2, MoveRight, X } from 'lucide-react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface MockServiceItem {
  id: string;
  name: string;
  description: string;
  durationMinutes?: number | null;
  price?: number | null;
}

export interface MockCategoryGroup {
  id: string;
  nr: string;
  category: string;
  description?: string;
  services: MockServiceItem[];
}

export function parseServiceDescription(description?: string | null): {
  mainText: string;
  bullets: string[];
} {
  if (!description || !description.trim()) {
    return { mainText: '', bullets: [] };
  }

  const trimmed = description.trim();
  const match = trimmed.match(/^([\s\S]*?)(?:[\s,;:-]*\b(?:bullets?|bullet\s*points?|includes?)\b\s*[,;:-]\s*|\s*\n\s*\b(?:bullets?|bullet\s*points?|includes?)\b\s*[,;:-]?\s*|[\s,;:-]+\b(?:bullets?|bullet\s*points?)\b\s+|^\b(?:bullets?|bullet\s*points?)\b\s+)([\s\S]*)$/i);

  if (!match) {
    return {
      mainText: trimmed,
      bullets: [],
    };
  }

  const mainText = match[1].trim();
  const rawBullets = match[2].trim();

  const bullets = rawBullets
    ? rawBullets
        .split(/[\n,;]+/)
        .map((b) => b.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean)
    : [];

  return {
    mainText,
    bullets,
  };
}

export function ServiceDescription({
  description,
  className = '',
}: {
  description?: string | null;
  className?: string;
}) {
  const { mainText, bullets } = parseServiceDescription(description);

  if (!mainText && bullets.length === 0) return null;

  return (
    <div className={`mt-3 font-sans text-[13px] leading-relaxed text-gray-500 space-y-2 ${className}`}>
      {mainText && <p>{mainText}</p>}
      {bullets.length > 0 && (
        <ul className="space-y-1.5 pt-0.5">
          {bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-500">
              <span className="mt-[6.5px] w-1.5 h-1.5 rounded-full bg-[#D94E4E] shrink-0" />
              <span className="leading-snug">{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hardcoded category metadata (order, nr, description) — services come from DB
// ---------------------------------------------------------------------------
const CATEGORY_META: { id: string; nr: string; category: string; description: string }[] = [
  { id: 'consultation',   nr: '01', category: 'Consultation',             description: 'Initial examinations, specialist consultations, and customized dental treatment plans.' },
  { id: 'diagnostics',    nr: '02', category: 'Diagnostics',              description: 'High-precision digital imaging, panoramic X-rays, and 3D dental diagnostics.' },
  { id: 'preventive',     nr: '03', category: 'Preventive Dentistry',     description: 'Prophylaxis cleanings, sealants, and fluoride therapies to protect oral health.' },
  { id: 'restorative',    nr: '04', category: 'Restorative Dentistry',    description: 'Tooth-colored composite fillings, durable inlays, and onlays for damaged teeth.' },
  { id: 'prosthodontics', nr: '05', category: 'Prosthodontics',           description: 'Crowns, fixed bridges, and full/partial dentures to restore chewing and aesthetics.' },
  { id: 'endodontics',    nr: '06', category: 'Endodontics',              description: 'Painless root canal treatments, apicoectomies, and emergency pulp therapy.' },
  { id: 'cosmetic',       nr: '07', category: 'Cosmetic Dentistry',       description: 'Laser teeth whitening, porcelain veneers, and cosmetic gum contouring.' },
  { id: 'orthodontics',   nr: '08', category: 'Orthodontics',             description: 'Traditional metal brackets, clear aligners, and post-treatment retainers.' },
  { id: 'oral-surgery',   nr: '09', category: 'Oral Surgery and Implants',description: 'Permanent titanium dental implants, bone grafting, and gentle extractions.' },
  { id: 'specialized',    nr: '10', category: 'Specialized Care',         description: 'Periodontal therapies, TMJ/TMD splints, anti-snoring appliances, and Botox.' },
];

function slugify(cat: string) {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function buildCategories(dbServices: ServiceResponseDto[]): MockCategoryGroup[] {
  // Group DB services by their category field
  const byCategoryLabel: Record<string, MockServiceItem[]> = {};
  for (const svc of dbServices) {
    const cat = svc.category ?? 'Other';
    if (!byCategoryLabel[cat]) byCategoryLabel[cat] = [];
    byCategoryLabel[cat].push({
      id: svc.id,
      name: svc.name,
      description: svc.description ?? '',
      durationMinutes: svc.durationMinutes,
      price: svc.price,
    });
  }

  // Map to MockCategoryGroup using CATEGORY_META for order/nr/description
  const result: MockCategoryGroup[] = [];
  for (const meta of CATEGORY_META) {
    const services = byCategoryLabel[meta.category];
    if (!services || services.length === 0) continue;
    result.push({
      id: meta.id,
      nr: meta.nr,
      category: meta.category,
      description: meta.description,
      services,
    });
  }

  // Any DB categories not in CATEGORY_META get appended at the end
  for (const [label, services] of Object.entries(byCategoryLabel)) {
    const alreadyIncluded = CATEGORY_META.some((m) => m.category === label);
    if (!alreadyIncluded && services.length > 0) {
      result.push({
        id: slugify(label),
        nr: String(result.length + 1).padStart(2, '0'),
        category: label,
        services,
      });
    }
  }

  return result;
}

const CARD_COUNT = 5;

interface MockCategoryServicesSectionProps {
  onBook?: (serviceId?: string, serviceName?: string) => void;
  dbServices: ServiceResponseDto[];
}

export function MockCategoryServicesSection({ onBook, dbServices }: MockCategoryServicesSectionProps) {
  const [pendingServiceName, setPendingServiceName] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MockCategoryGroup | null>(null);
  const [desktopPage, setDesktopPage] = useState(0);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

  const categories = buildCategories(dbServices);
  const topCategories = categories.slice(0, CARD_COUNT);
  const bottomCategories = categories.slice(CARD_COUNT);

  const handleOpenCategory = (cat: MockCategoryGroup) => {
    setSelectedCategory(cat);
    setDesktopPage(0);
    setActiveMobileIndex(0);
  };

  const handleBooking = (service: MockServiceItem) => {
    setSelectedCategory(null);
    if (onBook) {
      onBook(service.id, service.name);
      return;
    }
    if (pendingServiceName) return;
    setPendingServiceName(service.name);
    setTimeout(() => {
      setPendingServiceName(null);
      window.location.href = `/book?serviceId=${encodeURIComponent(service.id)}`;
    }, 600);
  };

  return (
    <section id="services" className="bg-[#FDFDFD] relative overflow-hidden w-full">
      {/* Upper Part: White background with Header and Category list (01 to 05) */}
      <div className="relative z-10 pt-24 sm:pt-32 pb-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          {/* Header Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-20 md:mb-24 gap-4 sm:gap-6"
          >
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
              Select any dental category below to explore its specific treatments, clinical options, and direct booking details.
            </p>
          </motion.div>

          {/* First Block: Category list (01 to 05) */}
          <div className="relative z-10 divide-y divide-[#1D1E1E]/10 border-y border-[#1D1E1E]/10">
            {topCategories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.45, delay: idx * 0.06, ease: 'easeOut' }}
                onClick={() => handleOpenCategory(cat)}
                title={`Click to view ${cat.category} services`}
                className="group flex items-center justify-between py-6 sm:py-8 px-4 sm:px-6 cursor-pointer transition-colors duration-300 hover:bg-[#1D1E1E]/[0.03]"
              >
                <span className="font-sans text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-[#1D1E1E]/60 group-hover:text-[#D94E4E] transition-colors w-10 sm:w-14 md:w-16 lg:w-16 text-left shrink-0">
                  {cat.nr}
                </span>
                <h4 className="font-sans text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal tracking-tight text-[#1D1E1E] flex-1 text-center leading-[1.2] px-2 sm:px-3 max-w-[280px] sm:max-w-md md:max-w-xl mx-auto">
                  <CategoryTitle title={cat.category} />
                </h4>
                <div className="w-10 sm:w-14 md:w-16 lg:w-16 flex justify-end shrink-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-10 md:h-10 lg:w-11 lg:h-11 bg-[#1D1E1E]/5 group-hover:bg-[#D94E4E] rounded-full border border-[#1D1E1E]/10 flex items-center justify-center text-[#1D1E1E] group-hover:text-white transition-all duration-300 shadow-2xs">
                    <MoveRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Part: Dark charcoal background (06 to 10) */}
      <div className="bg-[#1D1E1E] relative pt-0 pb-16 sm:pb-20 mt-0 z-0">
        <NoiseOverlay />
        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
          <div className="divide-y divide-[#D94E4E]/10">
            {bottomCategories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.45, delay: idx * 0.06, ease: 'easeOut' }}
                onClick={() => handleOpenCategory(cat)}
                title={`Click to view ${cat.category} services`}
                className="group relative flex items-center justify-between py-6 sm:py-8 transition-colors duration-300 hover:bg-[#1C1D1D]/70 px-4 sm:px-6 rounded-2xl cursor-pointer overflow-hidden"
              >
                <NoiseOverlay className="opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300" />
                <span className="relative z-10 text-lg sm:text-xl md:text-2xl lg:text-3xl font-sans font-normal text-white/75 group-hover:text-white transition-colors w-10 sm:w-14 md:w-16 lg:w-16 text-left shrink-0">
                  {cat.nr}
                </span>
                <h4 className="relative z-10 font-sans text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal tracking-tight text-white/90 group-hover:text-white transition-colors flex-1 text-center leading-[1.2] px-2 sm:px-3 max-w-[280px] sm:max-w-md md:max-w-xl mx-auto">
                  <CategoryTitle title={cat.category} />
                </h4>
                <div className="relative z-10 w-10 sm:w-14 md:w-16 lg:w-16 flex justify-end shrink-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-10 md:h-10 lg:w-11 lg:h-11 bg-white/5 group-hover:bg-[#D94E4E] rounded-full border border-white/10 flex items-center justify-center text-white/80 group-hover:text-white transition-all duration-300 shadow-2xs">
                    <MoveRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Post-list CTA: Browse All Services Catalog */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-8"
          >
            <div className="text-left">
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-[#D94E4E] uppercase block mb-1 font-sans">
                Full Service Directory
              </span>
              <p className="text-xs sm:text-sm md:text-[15px] text-white/75 font-normal leading-relaxed font-sans max-w-md sm:max-w-lg">
                Explore our comprehensive directory of dental procedures,
                <br className="hidden sm:inline" />
                advanced treatments, and specialized care in one place.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 sm:gap-2.5 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white hover:bg-[#D94E4E] text-[#1D1E1E] hover:text-white font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-md group shrink-0 w-full sm:w-auto"
            >
              <span className="whitespace-nowrap">Browse All Services</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Modal Dialog */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            onClick={() => setSelectedCategory(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-[#070808]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-8"
          >
          {(() => {
            const count = selectedCategory.services.length;
            const totalPages = Math.ceil(count / 2);
            const hasPagination = totalPages > 1;
            const startIdx = desktopPage * 2;
            const displayedDesktopServices = selectedCategory.services.slice(startIdx, startIdx + 2);

            return (
              <div className="my-auto w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-12 py-4 sm:py-6">
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="font-sans"
                >
                  {/* Close Button */}
                  <div className="flex items-center justify-end mb-4 sm:mb-6">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      aria-label="Close dialog"
                      className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white bg-white/10 hover:bg-[#D94E4E] rounded-full transition-all duration-200 cursor-pointer backdrop-blur-sm shadow-md shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Desktop View: 2-up grid */}
                  <div className="hidden sm:flex sm:flex-wrap items-stretch justify-center gap-6 w-full">
                    <AnimatePresence mode="popLayout">
                      {displayedDesktopServices.map((svc, idx) => (
                        <motion.div
                          key={svc.name}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.25, delay: idx * 0.03, ease: 'easeOut' }}
                          className="relative w-full sm:w-[calc(50%-12px)] max-w-md lg:max-w-[480px] min-h-[400px] sm:min-h-[420px] bg-[#FDFDFD] p-6 sm:p-8 md:p-9 flex flex-col justify-between shadow-2xl"
                        >
                          <div className="flex-1 flex flex-col">
                            <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
                              {selectedCategory.category}
                            </span>
                            <h3 className="font-sans text-[18px] sm:text-[22px] font-normal tracking-[-0.03em] text-[#1D1E1E] leading-[1.2]">
                              {svc.name}
                            </h3>
                            <ServiceDescription description={svc.description} />
                          </div>
                          <div className="mt-6 pt-5 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => handleBooking(svc)}
                              className="w-full py-3.5 bg-[#1D1E1E] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#D94E4E] transition-all duration-300 cursor-pointer"
                            >
                              Request Appointment
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Desktop Pagination */}
                  <div
                    className={`hidden sm:flex items-center justify-center gap-4 mt-6 ${hasPagination ? '' : 'invisible select-none pointer-events-none'}`}
                    aria-hidden={!hasPagination}
                  >
                    <button
                      type="button"
                      disabled={desktopPage === 0}
                      onClick={() => setDesktopPage((prev) => Math.max(0, prev - 1))}
                      aria-label="Previous page"
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-30 disabled:pointer-events-none text-white rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm transition-all duration-200 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Prev</span>
                    </button>
                    <span className="text-xs font-mono font-medium text-white/80 tracking-wider">
                      {desktopPage + 1} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={desktopPage >= totalPages - 1}
                      onClick={() => setDesktopPage((prev) => Math.min(totalPages - 1, prev + 1))}
                      aria-label="Next page"
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-30 disabled:pointer-events-none text-white rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm transition-all duration-200 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mobile View: Single card carousel */}
                  <div className="block sm:hidden w-full max-w-sm mx-auto">
                    <AnimatePresence mode="wait">
                      {selectedCategory.services[activeMobileIndex] && (
                        <motion.div
                          key={selectedCategory.services[activeMobileIndex].name}
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="relative w-full bg-[#FDFDFD] p-6 min-h-[340px] flex flex-col justify-between shadow-2xl rounded-xs"
                        >
                          <div className="flex-1 flex flex-col">
                            <span className="text-[10px] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 font-sans">
                              {selectedCategory.category}
                            </span>
                            <h3 className="font-sans text-[18px] font-normal tracking-[-0.03em] text-[#1D1E1E] leading-[1.2]">
                              {selectedCategory.services[activeMobileIndex].name}
                            </h3>
                            <ServiceDescription description={selectedCategory.services[activeMobileIndex].description} />
                          </div>
                          <div className="mt-6 pt-5 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => handleBooking(selectedCategory.services[activeMobileIndex])}
                              className="w-full py-3.5 bg-[#1D1E1E] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#D94E4E] transition-all duration-300 cursor-pointer"
                            >
                              Request Appointment
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Mobile Prev/Next */}
                    <div
                      className={`mt-4 flex items-center justify-center gap-4 px-1 ${selectedCategory.services.length > 1 ? '' : 'invisible select-none pointer-events-none'}`}
                      aria-hidden={selectedCategory.services.length <= 1}
                    >
                      <button
                        type="button"
                        disabled={activeMobileIndex === 0}
                        onClick={() => setActiveMobileIndex((prev) => Math.max(0, prev - 1))}
                        aria-label="Previous service"
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-30 disabled:pointer-events-none text-white rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm transition-all duration-200 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Prev</span>
                      </button>
                      <span className="text-xs font-mono font-medium text-white/80 tracking-wider">
                        {activeMobileIndex + 1} / {selectedCategory.services.length}
                      </span>
                      <button
                        type="button"
                        disabled={activeMobileIndex >= selectedCategory.services.length - 1}
                        onClick={() => setActiveMobileIndex((prev) => Math.min(selectedCategory.services.length - 1, prev + 1))}
                        aria-label="Next service"
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-30 disabled:pointer-events-none text-white rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm transition-all duration-200 cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Loading Overlay */}
      {pendingServiceName && (
        <div className="fixed inset-0 z-50 bg-[#1D1E1E]/85 backdrop-blur-md flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-[#D94E4E] animate-spin" />
          <p className="text-white text-sm tracking-wide">Taking you to booking for {pendingServiceName}...</p>
        </div>
      )}
    </section>
  );
}

function CategoryTitle({ title }: { title: string }) {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return <>{title}</>;
  if (words.length === 2) {
    return (
      <>
        <span className="block sm:inline">{words[0]}</span>
        <span className="hidden sm:inline"> </span>
        <span className="block sm:inline">{words[1]}</span>
      </>
    );
  }

  const pairs: string[] = [];
  for (let i = 0; i < words.length; i += 2) {
    pairs.push(words.slice(i, i + 2).join(' '));
  }

  return (
    <>
      <span className="sm:hidden">
        {pairs.map((pair, i) => (
          <span key={i} className="block">{pair}</span>
        ))}
      </span>
      <span className="hidden sm:inline">{title}</span>
    </>
  );
}

function NoiseOverlay({ className = 'opacity-[0.06]' }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 mix-blend-overlay pointer-events-none z-0 ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}
