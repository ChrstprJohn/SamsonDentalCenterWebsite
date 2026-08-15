'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { TrustAndStats } from './trust-and-stats';

interface HeroSectionProps {
  onBookClick: () => void;
}

const HERO_BG_IMAGES = [
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

  const nextBg = () => {
    setCurrentBgIndex((prev) => (prev + 1) % HERO_BG_IMAGES.length);
  };

  const prevBg = () => {
    setCurrentBgIndex((prev) => (prev - 1 + HERO_BG_IMAGES.length) % HERO_BG_IMAGES.length);
  };

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
                className="w-full h-full object-cover object-center filter brightness-[0.95] saturate-[0.9] contrast-[1.02]"
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

        {/* Floating Switcher Bar / Controller */}
        <div className="absolute top-24 sm:top-28 z-30 bg-black/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-3 text-white text-xs shadow-2xl">
          <div className="flex items-center gap-1.5 font-medium text-amber-300">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Preview Mode:</span>
          </div>
          
          <div className="flex items-center gap-1">
            {HERO_BG_IMAGES.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setCurrentBgIndex(idx)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  currentBgIndex === idx
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Bg {img.id}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1">
            <button
              onClick={prevBg}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Previous Background"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextBg}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Next Background"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Left / Right Quick Arrow Navigation */}
        <button
          onClick={prevBg}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/70 hover:text-white border border-white/10 backdrop-blur-sm transition-all hidden md:flex items-center justify-center cursor-pointer"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextBg}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/70 hover:text-white border border-white/10 backdrop-blur-sm transition-all hidden md:flex items-center justify-center cursor-pointer"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

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
