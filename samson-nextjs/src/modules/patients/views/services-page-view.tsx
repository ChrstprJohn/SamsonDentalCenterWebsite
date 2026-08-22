'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { ServiceDescription, parseServiceDescription } from '../components/landing/mock-category-services-section';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FlatServiceItem {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  category: string;
}

interface CategoryGroup {
  id: string;
  nr: string;
  label: string;
  description: string;
  services: FlatServiceItem[];
}

// Category display order + metadata
const CATEGORY_META: { category: string; nr: string; description: string }[] = [
  { category: 'Consultation',               nr: '01', description: 'Initial examinations, specialist consultations, and customized dental treatment plans.' },
  { category: 'Diagnostics',               nr: '02', description: 'High-precision digital imaging, panoramic X-rays, and 3D dental diagnostics.' },
  { category: 'Preventive Dentistry',      nr: '03', description: 'Prophylaxis cleanings, sealants, and fluoride therapies to protect oral health.' },
  { category: 'Restorative Dentistry',     nr: '04', description: 'Tooth-colored composite fillings, durable inlays, and onlays for damaged teeth.' },
  { category: 'Prosthodontics',            nr: '05', description: 'Crowns, fixed bridges, and full/partial dentures to restore chewing and aesthetics.' },
  { category: 'Endodontics',               nr: '06', description: 'Painless root canal treatments, apicoectomies, and emergency pulp therapy.' },
  { category: 'Cosmetic Dentistry',        nr: '07', description: 'Laser teeth whitening, porcelain veneers, and cosmetic gum contouring.' },
  { category: 'Orthodontics',              nr: '08', description: 'Traditional metal brackets, clear aligners, and post-treatment retainers.' },
  { category: 'Oral Surgery and Implants', nr: '09', description: 'Permanent titanium dental implants, bone grafting, and gentle extractions.' },
  { category: 'Specialized Care',          nr: '10', description: 'Periodontal therapies, TMJ/TMD splints, anti-snoring appliances, and Botox.' },
];

function slugify(cat: string) {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function buildCategoryGroups(dbServices: ServiceResponseDto[]): CategoryGroup[] {
  const byCat: Record<string, FlatServiceItem[]> = {};

  for (const svc of dbServices) {
    const cat = svc.category ?? 'Other';
    const catId = slugify(cat);
    const item: FlatServiceItem = {
      id: svc.id,
      name: svc.name,
      description: svc.description ?? '',
      categoryId: catId,
      category: cat,
    };
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(item);
  }

  const sortServices = (services: FlatServiceItem[]) =>
    [...services].sort((a, b) => {
      const aHasBullets = parseServiceDescription(a.description).bullets.length > 0 ? 1 : 0;
      const bHasBullets = parseServiceDescription(b.description).bullets.length > 0 ? 1 : 0;
      if (aHasBullets !== bHasBullets) return bHasBullets - aHasBullets;
      return a.name.localeCompare(b.name);
    });

  const result: CategoryGroup[] = [];

  for (const meta of CATEGORY_META) {
    const services = byCat[meta.category];
    if (!services || services.length === 0) continue;
    result.push({
      id: slugify(meta.category),
      nr: meta.nr,
      label: meta.category,
      description: meta.description,
      services: sortServices(services),
    });
  }

  // Extras not in CATEGORY_META
  let extraNr = result.length + 1;
  for (const [label, services] of Object.entries(byCat)) {
    if (CATEGORY_META.some((m) => m.category === label)) continue;
    if (!services.length) continue;
    result.push({
      id: slugify(label),
      nr: String(extraNr).padStart(2, '0'),
      label,
      description: '',
      services: sortServices(services),
    });
    extraNr++;
  }

  return result;
}

// ---------------------------------------------------------------------------
// ServiceCard
// ---------------------------------------------------------------------------
function ServiceCard({
  item,
  onBook,
}: {
  item: FlatServiceItem;
  onBook?: (serviceId?: string, serviceName?: string) => void;
}) {
  return (
    <div
      id={`service-card-${item.id}`}
      onClick={() => onBook?.(item.id, item.name)}
      className="group relative p-4 sm:p-5 border border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm text-left cursor-pointer transition-all duration-200 flex flex-col justify-between h-full rounded-none"
    >
      <div className="flex-1 flex flex-col">
        <h3 className="font-sans text-base sm:text-lg font-normal tracking-[-0.04em] text-[#141515] leading-[1.15] sm:leading-[1.1]">
          {item.name}
        </h3>
        <div className="border-t border-gray-100/80 my-2 sm:my-2.5" />
        <div className="flex-1">
          <ServiceDescription
            description={item.description}
            className="mt-0 text-[12px] sm:text-[13px] leading-[1.55] sm:leading-[1.65]"
          />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[10px] tracking-[0.18em] text-[#D94E4E] uppercase font-semibold font-sans">
          Request Appointment
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-[#D94E4E] transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CategorySection
// ---------------------------------------------------------------------------
function CategorySection({
  group,
  onBook,
  index,
}: {
  group: CategoryGroup;
  onBook?: (serviceId?: string, serviceName?: string) => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: Math.min(index * 0.04, 0.2) }}
    >
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-10 mb-6 sm:mb-8 pb-5 border-b border-gray-200/80">
        {/* Left: number + name */}
        <div className="flex items-baseline gap-3 sm:gap-4 min-w-0">
          <h2 className="font-sans text-xl sm:text-2xl font-normal tracking-[-0.03em] text-[#1D1E1E] leading-[1.2] min-w-0">
            {group.label}
          </h2>
        </div>

        {/* Right: sub-description */}
        {group.description && (
          <p className="font-sans text-[12px] sm:text-[13px] text-gray-500 leading-relaxed sm:max-w-[300px] lg:max-w-sm sm:text-right sm:pt-1 shrink-0">
            {group.description}
          </p>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-stretch">
        {group.services.map((svc) => (
          <ServiceCard key={svc.id} item={svc} onBook={onBook} />
        ))}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// CTA Strip
// ---------------------------------------------------------------------------
function CtaStrip({ onBook }: { onBook?: () => void }) {
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
            Request your appointment today.
          </h2>
          <p className="mt-2 text-[13px] text-white/60 max-w-sm leading-relaxed">
            Our team is ready to welcome you. Select a service above or let us guide you to the right treatment.
          </p>
        </div>
        <button
          type="button"
          onClick={onBook}
          className="shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-white text-[#141515] rounded-full hover:bg-gray-100 transition-all duration-300 shadow-md text-[12px] font-sans font-semibold uppercase tracking-widest cursor-pointer"
        >
          <span>Request Appointment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
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
  const router = useRouter();
  const [isNavigatingBooking, setIsNavigatingBooking] = useState(false);
  const [pendingServiceName, setPendingServiceName] = useState<string | null>(null);

  const categoryGroups = useMemo(() => buildCategoryGroups(dbServices), [dbServices]);

  // Ensure Lenis smooth scroll recalculates page dimensions on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const resize = () => {
        if ((window as any).lenis) {
          (window as any).lenis.resize();
        }
      };
      resize();
      const t1 = setTimeout(resize, 60);
      const t2 = setTimeout(resize, 200);
      const t3 = setTimeout(resize, 500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, []);

  const handleBook = (serviceId?: string, serviceName?: string) => {
    setIsNavigatingBooking(true);
    setPendingServiceName(serviceName ?? null);
    setTimeout(() => {
      if (serviceId) {
        router.push(`/book?serviceId=${encodeURIComponent(serviceId)}`);
      } else {
        router.push('/book');
      }
    }, 600);
  };

  return (
    <div className="flex flex-col w-full bg-[#FDFDFD] text-[#1D1E1E]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1D1E1E] text-white min-h-[340px] sm:min-h-[400px] flex items-center pt-28 pb-14 sm:pt-32 sm:pb-18 font-sans border-b border-white/10">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src="/hero-bg/HeroBg8.png"
            alt="Dental Services"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 w-full">
          <div className="max-w-2xl">
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
              Our Services
            </span>
            <h1 className="font-sans text-[28px] sm:text-[clamp(32px,2.5vw+14px,44px)] font-normal leading-[1.15] tracking-[-0.03em] text-white mb-2 sm:mb-3">
              Services &amp; Treatments
            </h1>
            <p className="font-sans text-[13px] sm:text-[15px] text-white/85 max-w-xl leading-relaxed">
              Browse our complete list of dental treatments and procedures.
            </p>
          </div>
        </div>
      </section>

      {/* Services by Category */}
      <section id="services-list" className="relative w-full bg-[#FDFDFD] pt-12 pb-20 sm:pt-16 sm:pb-28 font-sans">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          {categoryGroups.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-sans text-sm">
              No services available at the moment. Please check back soon.
            </div>
          ) : (
            <div className="flex flex-col gap-12 sm:gap-16">
              {categoryGroups.map((group, i) => (
                <CategorySection
                  key={group.id}
                  group={group}
                  onBook={handleBook}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaStrip onBook={() => handleBook()} />

      {/* Booking Loading Overlay */}
      <AnimatePresence>
        {isNavigatingBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#1D1E1E]/85 backdrop-blur-md flex flex-col items-center justify-center gap-4"
          >
            <Loader2 className="w-10 h-10 text-[#D94E4E] animate-spin" />
            <p className="text-white text-sm tracking-wide font-sans">
              {pendingServiceName
                ? `Taking you to booking for ${pendingServiceName}...`
                : 'Taking you to booking...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

