'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const BG_IMAGES = [
  '/hero-bg/HeroImage12.png',
  '/hero-bg/HeroBg11.png',
  '/hero-bg/HeroBg10.png',
  '/hero-bg/HeroBg8.png',
  '/hero-bg/HeroBg6.png',
];

// Change this index (0–4) to pick the background you want to keep
const ACTIVE_BG_INDEX = 0;

export function AppointmentBannerSection() {
  const [selected, setSelected] = useState(ACTIVE_BG_INDEX);

  return (
    <section
      id="appointment-banner"
      className="relative w-full min-h-[480px] flex items-center overflow-hidden"
      aria-label="Schedule an appointment"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${BG_IMAGES[selected]}')` }}
        aria-hidden="true"
      />

      {/* Dark overlay — stronger on left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(20,21,21,0.90) 0%, rgba(20,21,21,0.72) 50%, rgba(20,21,21,0.20) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 w-full py-20">
        <div className="max-w-lg flex flex-col gap-6">

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
          <Link href="/book">
            <button className="group inline-flex items-center gap-3 bg-white text-[#141515] hover:bg-[#D94E4E] hover:text-white px-7 py-3.5 rounded-full text-[12px] font-semibold uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-md cursor-pointer mt-2">
              Request Appointment
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>

        </div>
      </div>

      {/* Background picker — dev helper, remove when you've chosen */}
      <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
        {BG_IMAGES.map((src, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            title={`BG ${i + 1}`}
            className={`w-10 h-10 rounded-md overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
              i === selected ? 'border-[#D94E4E] scale-110' : 'border-white/20 opacity-60 hover:opacity-100'
            }`}
            style={{
              backgroundImage: `url('${src}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
      </div>
    </section>
  );
}
