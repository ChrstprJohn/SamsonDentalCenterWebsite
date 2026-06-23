'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TrustAndStats } from './trust-and-stats';

interface HeroSectionProps {
  onBookClick: () => void;
}

export function HeroSectionV1({ onBookClick }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <section
        id="home"
        className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden bg-black w-full"
        aria-label="Hero Introduction"
      >
        {/* Background Image with elegant overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <picture>
            <img
              src="/images/hero-bg.png"
              alt="Luxury modern architectural dental treatment facility, ambient warm light"
              className="w-full h-full object-cover object-center filter brightness-[0.95] saturate-[0.9] contrast-[1.02]"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#141515] z-0" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 text-center sm:text-left text-white mt-10 lg:mt-2 flex flex-col items-center sm:items-start">
          {!mounted ? (
            <h1
              className="font-serif text-[clamp(32px,5.5vw+8px,65px)] font-semibold tracking-tight leading-[1.1] max-w-4xl"
              style={{ fontWeight: '600', fontStyle: 'normal' }}
            >
              <span className="block">Unlock a World of</span>
              <span className="relative inline-block italic mt-1 sm:mt-2 lg:mt-[8px] lg:font-semibold text-white" id="hero-radiant-smiles">
                Radiant Smiles
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
            </h1>
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
              className="font-serif text-[clamp(32px,5.5vw+8px,65px)] font-semibold tracking-tight leading-[1.1] max-w-4xl"
              style={{ fontWeight: '600', fontStyle: 'normal' }}
            >
              <span className="block">Unlock a World of</span>
              <span className="relative inline-block italic mt-1 sm:mt-2 lg:mt-[8px] lg:font-semibold text-white" id="hero-radiant-smiles">
                Radiant Smiles
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
          )}

          <motion.p
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
            className="mt-4 sm:mt-5 lg:mt-[38px] text-[clamp(13px,0.4vw+11px,16px)] leading-[26px] sm:leading-relaxed lg:leading-[32.5px] lg:font-normal lg:not-italic text-white/95 max-w-2xl font-light tracking-wide"
          >
            Exceptional Dental Care Powered by Expertise, Innovation and Advanced Technology. Trusted by companies and individuals for over 60 years.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 text-[clamp(11px,0.2vw+11px,14px)] font-sans font-semibold uppercase tracking-widest"
          >
            <button
              onClick={onBookClick}
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#141515] rounded-full hover:bg-gray-100 transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer text-[clamp(11px,0.2vw+11px,14px)] font-sans font-semibold uppercase tracking-widest"
            >
              Book Appointment
              <ArrowRight className="w-4 h-4 text-[#141515]" />
            </button>
            <a
              href="#services"
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-xs flex items-center justify-center text-[clamp(11px,0.2vw+11px,14px)] font-sans font-semibold uppercase tracking-widest"
            >
              Explore Services
            </a>
          </motion.div>
        </div>
      </section>

      {/* Trust & Stats Marquee / Grid Section */}
      <TrustAndStats />
    </>
  );
}
