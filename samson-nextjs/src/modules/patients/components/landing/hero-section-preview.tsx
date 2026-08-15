'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TrustAndStats } from './trust-and-stats';

interface HeroSectionProps {
  onBookClick: () => void;
}

const HERO_BG_IMAGES = [
  {
    id: 12,
    name: 'HeroImage12',
    src: '/hero-bg/HeroImage12.png',
    title: 'Background Option 12',
  },
  {
    id: 6,
    name: 'HeroBg6',
    src: '/hero-bg/HeroBg6.png',
    title: 'Background Option 6',
  },
  {
    id: 8,
    name: 'HeroBg8',
    src: '/hero-bg/HeroBg8.png',
    title: 'Background Option 8',
  },
  {
    id: 10,
    name: 'HeroBg10',
    src: '/hero-bg/HeroBg10.png',
    title: 'Background Option 10',
  },
  {
    id: 11,
    name: 'HeroBg11',
    src: '/hero-bg/HeroBg11.png',
    title: 'Background Option 11',
  },
];

export function HeroSectionPreview({ onBookClick }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);


  const currentBg = HERO_BG_IMAGES[currentBgIndex];

  return (
    <>
      <section
        id="home"
        className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden bg-black w-full select-none"
        aria-label="Hero Introduction Preview"
      >
        {/* Background Images with Crossfade */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentBg.src}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={currentBg.src}
                alt={currentBg.title}
                className="w-full h-full object-cover object-left sm:object-center filter brightness-[0.95] saturate-[0.9] contrast-[1.02]"
              />
            </motion.div>
          </AnimatePresence>

          {/* Noise overlay */}
          <div
            className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none z-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#1D1E1E] z-0" />
        </div>

        {/* Background thumbnail picker */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
          {HERO_BG_IMAGES.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrentBgIndex(i)}
              title={img.title}
              className={`w-10 h-10 rounded-md overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                i === currentBgIndex ? 'border-[#D94E4E] scale-110' : 'border-white/20 opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundImage: `url('${img.src}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 text-center sm:text-left text-white mt-16 sm:mt-10 lg:mt-2 flex flex-col items-center sm:items-start">
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
            className="mt-4 sm:mt-5 lg:mt-[38px] text-[clamp(13px,0.4vw+11px,16px)] leading-[26px] sm:leading-relaxed lg:leading-[32.5px] lg:font-normal lg:not-italic text-white/95 max-w-2xl font-light tracking-wide drop-shadow-sm"
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
              Request Appointment
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
