'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TrustAndStats } from './trust-and-stats';

interface HeroSectionProps {
  onBookClick: () => void;
}

export function HeroSection({ onBookClick }: HeroSectionProps) {
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
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2070&auto=format&fit=crop"
              alt="Luxury modern architectural dental treatment facility, ambient warm light"
              className="w-full h-full object-cover object-center filter brightness-[0.65] saturate-[0.9] contrast-[1.02]"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/5 to-[#141515] z-0" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-12 text-center text-white mt-10 lg:mt-2">
          {!mounted ? (
            <h1
              className="font-serif text-[37px] md:text-[60px] lg:text-[75px] font-semibold tracking-tight text-center leading-tight lg:leading-[74.8px] max-w-4xl mx-auto"
              style={{ marginRight: '16px', fontWeight: '600', fontStyle: 'normal' }}
            >
              Unlock a World of
              <br />
              <span className="relative inline-block italic mt-1 sm:mt-2 lg:mt-[8px] lg:font-semibold lg:text-[75px] text-white" id="hero-radiant-smiles">
                Radiant Smiles
                <svg
                  className="absolute left-0 -bottom-2 sm:-bottom-4 w-full h-2 sm:h-3 text-[#D94E4E] overflow-visible"
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
              className="font-serif text-[37px] md:text-[60px] lg:text-[75px] font-semibold tracking-tight text-center leading-tight lg:leading-[74.8px] max-w-4xl mx-auto"
              style={{ marginRight: '16px', fontWeight: '600', fontStyle: 'normal' }}
            >
              Unlock a World of
              <br />
              <span className="relative inline-block italic mt-1 sm:mt-2 lg:mt-[8px] lg:font-semibold lg:text-[75px] text-white" id="hero-radiant-smiles">
                Radiant Smiles
                <svg
                  className="absolute left-0 -bottom-2 sm:-bottom-4 w-full h-2 sm:h-3 text-[#D94E4E] overflow-visible"
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
            className="mt-4 sm:mt-5 lg:mt-[38px] text-[13px] sm:text-sm md:text-base lg:text-[18px] leading-[23px] sm:leading-relaxed lg:leading-[32.5px] lg:font-normal lg:not-italic text-center text-white/95 max-w-2xl mx-auto font-light tracking-wide"
          >
            Exceptional Dental Care Powered by Expertise, Innovation and Advanced Technology. Trusted by companies and individuals for over 60 years.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs lg:text-[14px] font-semibold uppercase tracking-widest"
          >
            <button
              onClick={onBookClick}
              className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-950 rounded-full hover:bg-emerald-50 transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              Book Appointment
              <ArrowRight className="w-4 h-4 text-emerald-950" />
            </button>
            <a
              href="#services"
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-xs flex items-center justify-center"
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
