'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const BG_IMAGES = [
  '/hero-bg/HeroImage12.png',
  '/hero-bg/HeroBg11.png',
  '/hero-bg/HeroBg10.png',
  '/hero-bg/HeroBg8.png',
  '/hero-bg/HeroBg6.png',
];

// Change this index (0–4) to pick the background you want to keep
const ACTIVE_BG_INDEX = 0;

interface AppointmentBannerSectionProps {
  onBookClick?: () => void;
}

export function AppointmentBannerSection({ onBookClick }: AppointmentBannerSectionProps = {}) {
  const [selected, setSelected] = useState(ACTIVE_BG_INDEX);

  useEffect(() => {
    const rotationTimer = window.setInterval(() => {
      setSelected((index) => (index + 1) % BG_IMAGES.length);
    }, 6000);

    return () => window.clearInterval(rotationTimer);
  }, []);

  return (
    <section
      id="appointment-banner"
      className="relative w-full min-h-[480px] flex items-center overflow-hidden bg-[#141515]"
      aria-label="Schedule an appointment"
    >
      {/* Background */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={BG_IMAGES[selected]}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={BG_IMAGES[selected]}
            alt=""
            className="w-full h-full object-cover object-center filter brightness-[0.95] saturate-[0.9] contrast-[1.02]"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark overlay — stronger on left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(20,21,21,0.90) 0%, rgba(20,21,21,0.72) 50%, rgba(20,21,21,0.20) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Noise overlay — same matte treatment as hero */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 w-full py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-full md:max-w-[450px] lg:max-w-[580px] flex flex-col gap-6"
        >

          {/* Eyebrow — same pattern as other sections */}
          <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold font-sans">
            Book a Visit
          </span>

          {/* Title — same scale/weight as other section headings */}
          <h2 className="font-sans text-[clamp(20px,2vw+10px,32px)] font-normal tracking-[-0.04em] text-white leading-[1.05]">
            Schedule an appointment with us today!
          </h2>

          {/* Body */}
          <p className="text-[clamp(12px,0.3vw+11px,14px)] font-normal text-white/65 leading-[1.65] font-sans max-w-sm">
            Whether you're visiting for a routine check-up or a more advanced
            procedure, we ensure your oral health is in the best hands, helping
            you achieve a confident, healthy smile.
          </p>

          {/* CTA */}
          {onBookClick ? (
            <button
              onClick={onBookClick}
              className="group inline-flex items-center gap-3 bg-white text-[#141515] hover:bg-[#D94E4E] hover:text-white px-7 py-3.5 rounded-full text-[12px] font-semibold uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-md cursor-pointer mt-2 w-fit"
            >
              Request Appointment
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          ) : (
            <Link href="/book">
              <button className="group inline-flex items-center gap-3 bg-white text-[#141515] hover:bg-[#D94E4E] hover:text-white px-7 py-3.5 rounded-full text-[12px] font-semibold uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-md cursor-pointer mt-2">
                Request Appointment
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          )}

        </motion.div>
      </div>

      {/* Background indicator picker */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center gap-2 sm:!left-auto sm:right-6 sm:!translate-x-0">
        {BG_IMAGES.map((src, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            title={`BG ${i + 1}`}
            aria-label={`Show appointment banner image ${i + 1}`}
            className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
              i === selected ? 'w-7 bg-[#D94E4E]' : 'w-3 bg-white/50 hover:bg-white/90'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
