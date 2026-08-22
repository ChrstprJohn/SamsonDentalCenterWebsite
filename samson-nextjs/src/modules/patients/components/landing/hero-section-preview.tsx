'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TrustAndStats } from './trust-and-stats';

interface HeroSectionProps {
  onBookClick: () => void;
  serviceCount?: number;
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

export function HeroSectionPreview({ onBookClick, serviceCount = 0 }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const rotationTimer = window.setInterval(() => {
      setCurrentBgIndex((index) => (index + 1) % HERO_BG_IMAGES.length);
    }, 6000);

    return () => window.clearInterval(rotationTimer);
  }, []);


  const currentBg = HERO_BG_IMAGES[currentBgIndex];

  const handleExploreServices = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById('services');
    if (!target) return;

    const offset = 80;
    if (typeof window !== 'undefined' && (window as any).lenis) {
      (window as any).lenis.scrollTo(target, { offset: -offset, duration: 1.2 });
      return;
    }

    const bodyRect = document.body.getBoundingClientRect().top;
    const targetPosition = target.getBoundingClientRect().top - bodyRect;
    window.scrollTo({ top: targetPosition - offset, behavior: 'smooth' });
  };

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

        {/* Background indicator picker */}
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center gap-2 sm:!left-auto sm:right-6 sm:!translate-x-0">
          {HERO_BG_IMAGES.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrentBgIndex(i)}
              title={img.title}
              aria-label={`Show hero image ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentBgIndex ? 'w-7 bg-[#D94E4E]' : 'w-3 bg-white/50 hover:bg-white/90'
              }`}
            />
          ))}
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 text-center sm:text-left text-white mt-16 sm:mt-10 lg:mt-2 flex flex-col items-center sm:items-start">
          {!mounted ? (
            <h1
              className="font-serif text-[clamp(32px,5.5vw+8px,65px)] min-[768px]:max-[1100px]:text-[clamp(46px,5.5vw,60px)] max-[430px]:text-[clamp(40px,10.5vw,52px)] max-[320px]:text-[clamp(11px,4.5vw,14px)] font-semibold tracking-tight leading-[1.1] max-w-4xl"
              style={{ fontWeight: '600', fontStyle: 'normal' }}
            >
              <span className="block">Unlock a World of</span>
              <span className="relative inline-block italic mt-1 sm:mt-2 lg:mt-[8px] lg:font-semibold text-white" id="hero-exceptional-smiles">
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
              className="font-serif text-[clamp(32px,5.5vw+8px,65px)] min-[768px]:max-[1100px]:text-[clamp(46px,5.5vw,60px)] max-[430px]:text-[clamp(40px,10.5vw,52px)] max-[320px]:text-[clamp(11px,4.5vw,14px)] font-semibold tracking-tight leading-[1.1] max-w-4xl"
              style={{ fontWeight: '600', fontStyle: 'normal' }}
            >
              <span className="block">Unlock a World of</span>
              <span className="relative inline-block italic mt-1 sm:mt-2 lg:mt-[8px] lg:font-semibold text-white" id="hero-exceptional-smiles">
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
            className="mt-4 sm:mt-5 lg:mt-[38px] text-[clamp(13px,0.4vw+11px,16px)] min-[768px]:max-[1100px]:text-[15px] min-[768px]:max-[1100px]:max-w-lg min-[768px]:max-[1100px]:line-clamp-2 max-[430px]:text-[15px] max-[320px]:text-[10px] leading-[26px] max-[320px]:leading-[18px] sm:leading-relaxed lg:leading-[32.5px] lg:font-normal lg:not-italic text-white/95 max-w-2xl font-light tracking-wide drop-shadow-sm"
          >
            Samson Dental Center has its roots since 1964. Now on its fourth generation of management, it has lived up to its commitment of being the pioneer on dental advancements both in expertise, facilities and equipment over the years.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 text-[clamp(11px,0.2vw+11px,14px)] max-[430px]:text-[12px] font-sans font-semibold uppercase tracking-widest"
          >
            <button
              onClick={onBookClick}
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#141515] rounded-full hover:bg-gray-100 transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer text-[clamp(11px,0.2vw+11px,14px)] max-[430px]:text-[12px] font-sans font-semibold uppercase tracking-widest"
            >
              Request Appointment
              <ArrowRight className="w-4 h-4 text-[#141515]" />
            </button>
            <a
              href="#services"
              onClick={handleExploreServices}
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-xs flex items-center justify-center text-[clamp(11px,0.2vw+11px,14px)] max-[430px]:text-[12px] font-sans font-semibold uppercase tracking-widest"
            >
              Explore Services
            </a>
          </motion.div>
        </div>
      </section>

      {/* Trust & Stats Marquee / Grid Section */}
      <TrustAndStats serviceCount={serviceCount} />
    </>
  );
}

