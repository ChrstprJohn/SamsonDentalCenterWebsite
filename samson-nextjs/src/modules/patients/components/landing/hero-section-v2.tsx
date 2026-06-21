'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TrustAndStats } from './trust-and-stats';

interface HeroSectionProps {
  onBookClick: () => void;
}

export function HeroSectionV2({ onBookClick }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <section
        id="home"
        className="relative h-screen min-h-[640px] flex items-start justify-center overflow-hidden bg-black w-full"
        aria-label="Hero Introduction"
      >
        {/* Background Image with elegant overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <picture>
            <img
              src="/images/teeth-bg.png"
              alt="Beautiful clean smiles, professional modern dental treatment background"
              className="w-full h-full object-cover object-bottom"
            />
          </picture>
        </div>

        {/* Content Container (Positioned towards the top in the sky area) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 text-center text-white pt-28 sm:pt-36 lg:pt-44 flex flex-col items-center">
          {!mounted ? (
            <h1
              className="font-sans text-[42px] sm:text-[54px] md:text-[68px] lg:text-[80px] font-bold tracking-tight leading-tight lg:leading-[90px] max-w-4xl text-white"
            >
              Smile Brighter,<br />Live Better
            </h1>
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
              className="font-sans text-[42px] sm:text-[54px] md:text-[68px] lg:text-[80px] font-bold tracking-tight leading-tight lg:leading-[90px] max-w-4xl text-white"
            >
              Smile Brighter,<br />Live Better
            </motion.h1>
          )}

          <motion.p
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
            className="mt-6 sm:mt-8 lg:mt-[24px] text-[15px] sm:text-base md:text-lg lg:text-[19px] leading-[26px] sm:leading-relaxed lg:leading-[32px] lg:font-normal text-white/90 max-w-2xl font-light tracking-wide mx-auto"
          >
            Experience expert dental care designed specifically to protect and perfect your unique smile.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-[13px] sm:text-[14px] font-sans font-semibold uppercase tracking-widest w-full max-w-xl mx-auto"
          >
            <button
              onClick={onBookClick}
              className="w-full sm:w-auto px-8 py-4 bg-[#0070F3] text-white rounded-lg hover:bg-[#0059c6] transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer text-[13px] sm:text-[14px] font-sans font-semibold uppercase tracking-widest whitespace-nowrap"
            >
              Book an Appointment
            </button>
          </motion.div>
        </div>
      </section>
      <TrustAndStats variant="v2" />
    </>
  );
}
