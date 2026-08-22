'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MoveRight } from 'lucide-react';
import Link from 'next/link';
import { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FlatServiceItem {
  id: string;
  name: string;
  description: string;
  subOptions?: string[];
  categoryId: string;   // slugified category label
  category: string;     // raw label from DB, e.g. "Cosmetic Dentistry"
}

// ---------------------------------------------------------------------------
// subOptions are not in the DB — kept hardcoded keyed by lowercase service name
// ---------------------------------------------------------------------------
const SUB_OPTIONS: Record<string, string[]> = {
  'crowns and bridges':          ['Metal', 'Porcelain', 'Zirconia'],
  'dentures (full and partial)': ['Precision attachments', 'Flexible denture', 'Ivocap', 'Metal frameworks'],
  'tooth whitening':             ['Chair-side', 'Take home'],
  'veneers':                     ['Porcelain', 'Composite'],
  'clear aligners':              ['Invisalign', 'Realigner'],
  'tooth extraction':            ['Simple', 'Complex', 'Impacted'],
};

// Desired display order for categories
const CATEGORY_ORDER = [
  'Consultation',
  'Diagnostics',
  'Preventive Dentistry',
  'Restorative Dentistry',
  'Prosthodontics',
  'Endodontics',
  'Cosmetic Dentistry',
  'Orthodontics',
  'Oral Surgery and Implants',
  'Specialized Care',
];

function slugify(cat: string) {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function buildFlatServices(dbServices: ServiceResponseDto[]): FlatServiceItem[] {
  const byCat: Record<string, FlatServiceItem[]> = {};

  for (const svc of dbServices) {
    const cat = svc.category ?? 'Other';
    const catId = slugify(cat);
    const item: FlatServiceItem = {
      id: svc.id,
      name: svc.name,
      description: svc.description ?? '',
      subOptions: SUB_OPTIONS[svc.name.toLowerCase()],
      categoryId: catId,
      category: cat,
    };
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(item);
  }

  // Emit in preferred order, then any extras alphabetically
  const result: FlatServiceItem[] = [];
  for (const label of CATEGORY_ORDER) {
    if (byCat[label]) result.push(...byCat[label]);
  }
  for (const label of Object.keys(byCat).sort()) {
    if (!CATEGORY_ORDER.includes(label)) result.push(...byCat[label]);
  }
  return result;
}

// Build unique ordered category list from flat services
function buildCategories(flat: FlatServiceItem[]) {
  const seen = new Set<string>();
  const cats: { id: string; label: string }[] = [];
  for (const svc of flat) {
    if (!seen.has(svc.categoryId)) {
      seen.add(svc.categoryId);
      cats.push({ id: svc.categoryId, label: svc.category });
    }
  }
  return cats;
}

// ---------------------------------------------------------------------------
// Hero images
// ---------------------------------------------------------------------------
const HERO_BG_IMAGES = [
  '/hero-bg/HeroImage12.png',
  '/hero-bg/HeroBg6.png',
  '/hero-bg/HeroBg8.png',
  '/hero-bg/HeroBg10.png',
  '/hero-bg/HeroBg11.png',
];

// ---------------------------------------------------------------------------
// ServicesHero
// ---------------------------------------------------------------------------
function ServicesHero() {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = window.setInterval(() => {
      setCurrentBgIndex((i) => (i + 1) % HERO_BG_IMAGES.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  const scrollToList = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById('services-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="services-hero"
      className="relative h-[72vh] min-h-[520px] flex items-center justify-center overflow-hidden bg-black w-full select-none"
      aria-label="Services Hero"
    >
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={HERO_BG_IMAGES[currentBgIndex]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={HERO_BG_IMAGES[currentBgIndex]}
              alt=""
              className="w-full h-full object-cover object-center filter brightness-[0.85] saturate-[0.9] contrast-[1.02]"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#1D1E1E] z-0" />
      </div>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center gap-2 sm:left-auto sm:right-6 sm:translate-x-0">
        {HERO_BG_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentBgIndex(i)}
            aria-label={`Show hero image ${i + 1}`}
            className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${i === currentBgIndex ? 'w-7 bg-[#D94E4E]' : 'w-3 bg-white/50 hover:bg-white/90'}`}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 text-center sm:text-left text-white mt-16 sm:mt-10 flex flex-col items-center sm:items-start">
        {mounted && (
          <>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-4 font-sans"
            >
              Samson Dental Center
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
              className="font-serif text-[clamp(32px,5.5vw+8px,65px)] font-semibold tracking-tight leading-[1.1] max-w-4xl"
              style={{ fontWeight: '600', fontStyle: 'normal' }}
            >
              <span className="block">Comprehensive Dental</span>
              <span className="relative inline-block italic mt-1 sm:mt-2 text-white">
                Services &amp; Care
                <svg
                  className="absolute left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 -bottom-2 sm:-bottom-4 w-full h-2 sm:h-3 text-[#D94E4E] overflow-visible"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M0,4 Q12.5,1 25,4 T50,4 T75,4 T100,4" />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
              className="mt-6 sm:mt-8 text-[clamp(13px,0.4vw+11px,16px)] leading-relaxed text-white/90 max-w-xl font-light tracking-wide drop-shadow-sm"
            >
              From routine check-ups to advanced dental procedures — explore the full range of services we offer and book your appointment today.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4"
            >
              <a
                href="#services-list"
                onClick={scrollToList}
                className="w-full sm:w-auto px-8 py-4 bg-white text-[#141515] rounded-full hover:bg-gray-100 transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer text-[clamp(11px,0.2vw+11px,14px)] font-sans font-semibold uppercase tracking-widest"
              >
                Browse Services
                <ArrowRight className="w-4 h-4 text-[#141515]" />
              </a>
              <Link
                href="/book"
                className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-sm flex items-center justify-center text-[clamp(11px,0.2vw+11px,14px)] font-sans font-semibold uppercase tracking-widest"
              >
                Book Appointment
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ServiceCard
// ---------------------------------------------------------------------------
function ServiceCard({ item, index }: { item: FlatServiceItem; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: (index % 6) * 0.03, ease: 'easeOut' }}
      className="group border border-gray-100 bg-white p-5 sm:p-7 transition-all duration-300 hover:border-[#D94E4E]/30 hover:shadow-md flex flex-col justify-between h-full rounded-sm"
    >
      <div>
        {/* Category Tag */}
        <div className="mb-2">
          <span className="inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#D94E4E] font-sans">
            {item.category}
          </span>
        </div>

        {/* Service Title */}
        <h4 className="text-[#1D1E1E] text-[15px] sm:text-[17px] font-semibold tracking-tight min-h-0 sm:min-h-[44px] flex items-center group-hover:text-[#D94E4E] transition-colors leading-snug">
          {item.name}
        </h4>

        {/* Description */}
        <p className="mt-1.5 sm:mt-2 text-[12px] sm:text-[14px] text-gray-500 leading-relaxed font-light">
          {item.description}
        </p>

        {/* Sub-options */}
        {item.subOptions && item.subOptions.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 font-sans block">
              Includes / Options:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {item.subOptions.map((opt) => (
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
        <Link
          href="/book"
          className="w-9 h-9 sm:w-10 sm:h-10 bg-[#1D1E1E]/5 group-hover:bg-[#D94E4E] rounded-full border border-[#1D1E1E]/10 flex items-center justify-center text-[#1D1E1E] group-hover:text-white transition-all duration-300 shadow-2xs"
          aria-label={`Book ${item.name}`}
        >
          <MoveRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
        </Link>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// CTA Strip
// ---------------------------------------------------------------------------
function CtaStrip() {
  return (
    <div className="relative overflow-hidden bg-[#1D1E1E] py-16 sm:py-20">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-8">
        <div>
          <p className="text-[10px] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 font-sans">
            Ready to get started?
          </p>
          <h2 className="font-sans text-[clamp(20px,2vw+10px,32px)] font-normal leading-[1.2] tracking-[-0.03em] text-white">
            Book your appointment today.
          </h2>
          <p className="mt-2 text-[13px] text-white/60 max-w-sm leading-relaxed">
            Our team is ready to welcome you. Select a service above or let us guide you to the right treatment.
          </p>
        </div>
        <Link
          href="/book"
          className="shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-white text-[#141515] rounded-full hover:bg-gray-100 transition-all duration-300 shadow-md text-[12px] font-sans font-semibold uppercase tracking-widest cursor-pointer"
        >
          Book Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ServicesPageView — main export
// ---------------------------------------------------------------------------
interface ServicesPageViewProps {
  dbServices: ServiceResponseDto[];
}

export function ServicesPageView({ dbServices }: ServicesPageViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allServices = useMemo(() => buildFlatServices(dbServices), [dbServices]);
  const categories  = useMemo(() => buildCategories(allServices), [allServices]);

  const displayedServices = useMemo(() => {
    if (selectedCategory === 'all') return allServices;
    return allServices.filter((svc) => svc.categoryId === selectedCategory);
  }, [allServices, selectedCategory]);

  const activeLabel = categories.find((c) => c.id === selectedCategory)?.label;

  return (
    <div className="flex flex-col w-full bg-[#FDFDFD] text-[#1D1E1E]">
      <ServicesHero />

      <section id="services-list" className="relative w-full bg-[#FDFDFD] pt-16 pb-24 sm:pt-24 sm:pb-32 font-sans">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4 sm:gap-6"
          >
            <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
              <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
                Our Services
              </span>
              <h2 className="font-sans text-[20px] sm:text-[clamp(22px,2vw+10px,32px)] font-normal leading-[1.3] sm:leading-[1.2] md:leading-[1.15] tracking-[-0.03em] text-[#1D1E1E]">
                Comprehensive Dental Care &amp; Treatments
              </h2>
            </div>
            <p className="max-w-sm pt-2 md:max-w-[280px] lg:max-w-sm font-sans text-[13px] sm:text-[clamp(12px,0.3vw+11px,14px)] font-normal leading-relaxed text-gray-500">
              Filter by specialty or view all procedures. Each service includes clinical descriptions, options, and direct booking.
            </p>
          </motion.div>

          {/* Category Filter Pills */}
          <div className="mb-10 sm:mb-12 overflow-x-auto no-scrollbar pb-2">
            <div className="inline-flex items-center gap-2 p-1.5 bg-[#F4F4F5] rounded-xl border border-gray-200/80 min-w-full sm:min-w-0">
              {/* All */}
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
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200/70 text-gray-500'}`}>
                  {allServices.length}
                </span>
              </button>

              {/* Per-category pills — driven entirely by DB data */}
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const count = allServices.filter((s) => s.categoryId === cat.id).length;
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
                    <span>{cat.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200/70 text-gray-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Counter */}
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
            <p className="text-xs text-gray-400 font-sans">
              Showing <span className="font-semibold text-[#1D1E1E]">{displayedServices.length}</span>{' '}
              {displayedServices.length === 1 ? 'service' : 'services'}
              {selectedCategory !== 'all' && activeLabel && (
                <> in <span className="text-[#D94E4E] font-medium">{activeLabel}</span></>
              )}
            </p>
          </div>

          {/* Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
            <AnimatePresence mode="popLayout">
              {displayedServices.map((svc, idx) => (
                <ServiceCard key={svc.id} item={svc} index={idx} />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty state */}
          {allServices.length === 0 && (
            <div className="text-center py-20 text-gray-400 font-sans text-sm">
              No services available at the moment. Please check back soon.
            </div>
          )}
        </div>
      </section>

      <CtaStrip />
    </div>
  );
}
