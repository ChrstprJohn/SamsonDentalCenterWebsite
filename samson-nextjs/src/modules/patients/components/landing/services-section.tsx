'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

interface ServicesSectionProps {
  services: ServiceResponseDto[];
  onSelectService: (service: ServiceResponseDto) => void;
}

/* Arrow icon matching LAVA's diagonal arrow button */
function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
      <path
        fill="currentColor"
        d="M36.657 24.343a1 1 0 0 0-1-1h-9a1 1 0 0 0 0 2h8v8a1 1 0 1 0 2 0v-9ZM24.344 35.656l.707.707L36.365 25.05l-.708-.707-.707-.708L23.637 34.95l.707.707Z"
      />
    </svg>
  );
}

/* Featured card services (with image) — top 5 matching LAVA layout */
const CARD_SERVICES = [
  {
    nr: '01',
    title: 'Complex Diagnostics',
    image: '/images/svc-diagnostics.png',
    wide: true, // first card spans full width
  },
  {
    nr: '02',
    title: 'Professional Hygiene',
    image: '/images/svc-hygiene.png',
    wide: false,
  },
  {
    nr: '03',
    title: 'Veneers',
    image: '/images/svc-veneers.png',
    wide: false,
  },
  {
    nr: '04',
    title: 'Dental Implants',
    image: '/images/svc-implants.png',
    wide: false,
  },
  {
    nr: '05',
    title: 'ALL-ON-X',
    image: '/images/svc-aligners.png',
    wide: false,
  },
];

/* List services (no image) — remaining services */
const LIST_SERVICES = [
  { nr: '06', title: 'Sedation & Anaesthesia' },
  { nr: '07', title: 'Therapy' },
  { nr: '08', title: 'Endodontics' },
  { nr: '09', title: 'Surgery' },
  { nr: '10', title: 'Aligners' },
];

const HEADING_FONT = '"Josefin Sans", "Jost", sans-serif';

export function ServicesSection({ services: _services, onSelectService: _onSelect }: ServicesSectionProps) {
  return (
    <section id="services">
      {/* ── Section Header — cream bg ─────────────────── */}
      <div style={{ background: '#ddefde' }}>
        <div
          style={{
            width: 'min(1290px, 100% - clamp(1.5rem,1.3636rem + 0.6061vw,1.875rem) * 2)',
            marginInline: 'auto',
            paddingTop: 'clamp(3rem,2.7273rem + 1.2121vw,3.75rem)',
            paddingBottom: 'clamp(3rem,2.7273rem + 1.2121vw,3.75rem)',
          }}
        >
          <h2
            className="text-[#031c14]"
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 'clamp(1.9531rem,1.5867rem + 1.6285vw,2.9607rem)',
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            Services
          </h2>
        </div>
      </div>

      {/* ── Card Grid — cream bg ─────────────────────── */}
      <div style={{ background: '#ddefde' }}>
        <div
          style={{
            width: 'min(1290px, 100% - clamp(1.5rem,1.3636rem + 0.6061vw,1.875rem) * 2)',
            marginInline: 'auto',
          }}
        >
          {/* Row 1: wide card (diagnostics) */}
          <motion.div
            className="group relative overflow-hidden rounded-2xl cursor-pointer mb-4"
            style={{ background: '#031c14', minHeight: '220px' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.005 }}
          >
            <Image
              src={CARD_SERVICES[0].image}
              alt={CARD_SERVICES[0].title}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[#031c14]/50 group-hover:bg-[#031c14]/40 transition-colors duration-300" />
            <div className="relative z-10 flex items-end justify-between p-6 h-full min-h-[220px]">
              <div className="flex flex-col gap-1">
                <span
                  className="text-[#ddefde]/60"
                  style={{ fontFamily: HEADING_FONT, fontSize: 'clamp(1rem,0.9091rem + 0.404vw,1.25rem)', fontWeight: 400 }}
                >
                  {CARD_SERVICES[0].nr}
                </span>
                <h3
                  className="text-[#ddefde]"
                  style={{ fontFamily: HEADING_FONT, fontSize: 'clamp(1.25rem,1.0986rem + 0.6727vw,1.6663rem)', fontWeight: 700 }}
                >
                  {CARD_SERVICES[0].title}
                </h3>
              </div>
              <div className="rounded-full bg-[#ddefde] text-[#031c14] w-12 h-12 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <ArrowIcon />
              </div>
            </div>
          </motion.div>

          {/* Row 2–3: 2x2 grid of remaining card services */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {CARD_SERVICES.slice(1).map((svc, i) => (
              <motion.div
                key={svc.nr}
                className="group relative overflow-hidden rounded-2xl cursor-pointer"
                style={{ background: '#031c14', minHeight: '340px' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.005 }}
              >
                <Image
                  src={svc.image}
                  alt={svc.title}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#031c14]/50 group-hover:bg-[#031c14]/40 transition-colors duration-300" />
                <div className="relative z-10 flex items-end justify-between p-6 h-full min-h-[340px]">
                  <div className="flex flex-col gap-1">
                    <span
                      className="text-[#ddefde]/60"
                      style={{ fontFamily: HEADING_FONT, fontSize: 'clamp(1rem,0.9091rem + 0.404vw,1.25rem)', fontWeight: 400 }}
                    >
                      {svc.nr}
                    </span>
                    <h3
                      className="text-[#ddefde]"
                      style={{ fontFamily: HEADING_FONT, fontSize: 'clamp(1.25rem,1.0986rem + 0.6727vw,1.6663rem)', fontWeight: 700 }}
                    >
                      {svc.title}
                    </h3>
                  </div>
                  <div className="rounded-full bg-[#ddefde] text-[#031c14] w-12 h-12 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <ArrowIcon />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── List Grid — dark green bg ─────────────────── */}
      <div style={{ background: '#031c14' }}>
        <div
          style={{
            width: 'min(1290px, 100% - clamp(1.5rem,1.3636rem + 0.6061vw,1.875rem) * 2)',
            marginInline: 'auto',
            paddingTop: 'clamp(1.5rem,1.1364rem + 1.6162vw,2.5rem)',
            paddingBottom: 'clamp(3rem,2.7273rem + 1.2121vw,3.75rem)',
          }}
        >
          <div className="flex flex-col">
            {LIST_SERVICES.map((svc, i) => (
              <motion.div
                key={svc.nr}
                className="group flex items-center justify-between py-5 border-b border-[#ddefde]/15 cursor-pointer hover:border-[#ddefde]/40 transition-colors duration-300"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="flex items-center gap-6">
                  <span
                    className="text-[#ddefde]/40 group-hover:text-[#ddefde]/70 transition-colors duration-300"
                    style={{ fontFamily: HEADING_FONT, fontSize: 'clamp(1rem,0.9091rem + 0.404vw,1.25rem)', fontWeight: 400 }}
                  >
                    {svc.nr}
                  </span>
                  <h3
                    className="text-[#ddefde] group-hover:text-white transition-colors duration-300"
                    style={{ fontFamily: HEADING_FONT, fontSize: 'clamp(1.25rem,1.0986rem + 0.6727vw,1.6663rem)', fontWeight: 700 }}
                  >
                    {svc.title}
                  </h3>
                </div>
                <div className="rounded-full bg-[#ddefde] text-[#031c14] w-10 h-10 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 60 60">
                    <path fill="currentColor" d="M36.657 24.343a1 1 0 0 0-1-1h-9a1 1 0 0 0 0 2h8v8a1 1 0 1 0 2 0v-9ZM24.344 35.656l.707.707L36.365 25.05l-.708-.707-.707-.708L23.637 34.95l.707.707Z" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
