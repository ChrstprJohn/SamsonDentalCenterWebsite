'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';

const journeySlides = [
  {
    header: 'More personal than personal',
    text: 'Your personal concierge manages every aspect of your treatment timeline, ensuring a flawless process from booking to follow-up care.',
  },
  {
    header: 'Complete privacy',
    text: 'We conduct every procedure within private, quiet treatment suites designed to shield you from standard clinical activity and noise.',
  },
  {
    header: 'Complete Sensory Calming',
    text: 'Organic essential oil aromatherapy and custom noise-cancelling headphones actively neutralize standard dental anxiety triggers.',
  },
  {
    header: 'Microscopic Engineering',
    text: 'Advanced operating microscopes enable sub-micron precision, allowing us to preserve structural tooth integrity and secure longevity.',
  },
  {
    header: 'Bespoke Biological Materials',
    text: 'We select metals-free biocompatible ceramics that perfectly mirror the organic light refraction and elasticity of real teeth.',
  },
  {
    header: 'Facial Harmonization',
    text: 'We customize every restoration in balance with your unique facial geometry, natural lip mobility, and individual aesthetic alignment.',
  },
];

export function JourneySection() {
  const journeyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: journeyRef,
    offset: ['start start', 'end end'],
  });
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!scrollYProgress) return;
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      const step = Math.min(Math.floor(latest * 6), 5);
      setActiveStep(step);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <section
      id="journey"
      ref={journeyRef}
      className="relative h-[480vh] bg-[#1D1E1E] select-none w-full"
    >
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-[100dvh] w-full flex flex-col justify-end overflow-hidden bg-[#1D1E1E] text-[#FDFDFD] z-10">
        {/* Subtle Premium Background Pattern/Illustration */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.1] z-0 overflow-hidden">
          <svg className="absolute w-full h-full text-[#D94E4E]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
              <pattern id="gridPattern" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M 120 0 L 0 0 0 120" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridPattern)" />
            <rect width="100%" height="100%" fill="url(#dotPattern)" opacity="0.3" />
            <circle cx="10%" cy="10%" r="20%" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" opacity="0.5" />
            <circle cx="90%" cy="80%" r="35%" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <circle cx="90%" cy="80%" r="30%" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <circle cx="90%" cy="80%" r="25%" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 6" opacity="0.2" />
          </svg>
        </div>

        {/* Central Semicircle / Wheel and Content Assembly */}
        <div className="relative w-full max-w-7xl mx-auto flex flex-col justify-between items-center overflow-hidden pb-0 px-6 sm:px-12 h-full max-h-[820px] pt-20 sm:pt-24 lg:pt-28">
          {/* Header Block with responsive layout */}
          <div className="w-full relative z-30 pt-8 sm:pt-12 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 md:mb-10">
            <div className="max-w-xl">
              <span className="text-[10px] tracking-[0.34em] text-[#D94E4E] uppercase font-bold block mb-4">
                Sanctuary Journey
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#FDFDFD] leading-tight">
                Your smile starts here
              </h2>
            </div>
            <p className="text-sm font-light text-white/70 max-w-sm leading-relaxed">
              Follow our structured clinical pathway designed to deliver flawless personal care, absolute sensory calming, and microscopic cosmetic precision.
            </p>
          </div>

          {/* Semicircle parent container */}
          <div className="relative w-[92vw] h-[64.4vw] xs:w-[450px] xs:h-[315px] sm:w-[660px] sm:h-[264px] md:w-[850px] md:h-[340px] lg:w-full lg:max-w-7xl lg:h-auto lg:aspect-[5/2] overflow-visible z-10">
            {/* Static Semicircle Arc Reference Line */}
            <div className="absolute bottom-[-27.6vw] xs:bottom-[-135px] sm:bottom-[-396px] md:bottom-[-510px] lg:bottom-auto lg:top-0 left-0 w-[92vw] h-[92vw] xs:w-[450px] xs:h-[450px] sm:w-[660px] sm:h-[660px] md:w-[850px] md:h-[850px] lg:w-full lg:h-auto lg:aspect-square rounded-full border border-white/10 pointer-events-none z-0" />

            {/* The Active Top Vertical Connection Line */}
            <div className="absolute left-1/2 -translate-x-1/2 w-[3px] h-16 bg-gradient-to-t from-[#D94E4E] to-[#D94E4E]/10 z-20 pointer-events-none bottom-[calc(100%+6.43%-60px)] sm:bottom-[calc(100%+11.25%-84px)]" />

            {/* Rotating Wheel Container */}
            <motion.div
              animate={{ rotate: -activeStep * 60 }}
              transition={{ type: 'spring', stiffness: 50, damping: 15 }}
              className="absolute bottom-[-27.6vw] xs:bottom-[-135px] sm:bottom-[-396px] md:bottom-[-510px] lg:bottom-auto lg:top-0 left-0 w-[92vw] h-[92vw] xs:w-[450px] xs:h-[450px] sm:w-[660px] sm:h-[660px] md:w-[850px] md:h-[850px] lg:w-full lg:h-auto lg:aspect-square rounded-full z-10"
            >
              {journeySlides.map((_, idx) => {
                const angleDeg = 270 + idx * 60;
                const angleRad = (angleDeg * Math.PI) / 180;

                const dotLeft = `${50 + 50 * Math.cos(angleRad)}%`;
                const dotTop = `${50 + 50 * Math.sin(angleRad)}%`;

                const numLeft = `${50 + 54.5 * Math.cos(angleRad)}%`;
                const numTop = `${50 + 54.5 * Math.sin(angleRad)}%`;

                return (
                  <React.Fragment key={`point-${idx}`}>
                    {/* Small Dot */}
                    <div
                      className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#D94E4E] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 pointer-events-none z-10"
                      style={{ left: dotLeft, top: dotTop }}
                    />

                    {/* Numeric Capsule Bubble */}
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                      style={{ left: numLeft, top: numTop }}
                    >
                      <motion.button
                        onClick={() => {
                          const scrollPercent = idx / 5;
                          if (journeyRef.current) {
                            const rect = journeyRef.current.getBoundingClientRect();
                            const scrollTop = window.scrollY + rect.top;
                            const scrollHeight = journeyRef.current.offsetHeight;
                            const targetScroll =
                              scrollTop + scrollPercent * (scrollHeight - window.innerHeight);
                            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
                          }
                        }}
                        type="button"
                        animate={{
                          rotate: idx * 60,
                          scale: activeStep === idx ? 1.15 : 1.0,
                          backgroundColor: activeStep === idx ? '#D94E4E' : 'rgba(20, 21, 21, 0.45)',
                          color: activeStep === idx ? '#FDFDFD' : 'rgba(253, 253, 253, 0.7)',
                          borderColor: activeStep === idx ? '#D94E4E' : 'rgba(255, 255, 255, 0.15)',
                          boxShadow: activeStep === idx ? '0 4px 24px rgba(217, 78, 78, 0.45)' : 'none',
                        }}
                        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                        className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center font-sans font-bold text-xs sm:text-sm tracking-tight cursor-pointer focus:outline-none transition-shadow"
                      >
                        {idx + 1}
                      </motion.button>
                    </div>
                  </React.Fragment>
                );
              })}
            </motion.div>

            {/* Content Display */}
            <div className="absolute inset-x-0 bottom-6 top-auto sm:inset-auto sm:top-auto sm:bottom-[40px] md:bottom-[60px] lg:bottom-[80px] sm:left-1/2 sm:-translate-x-1/2 w-full sm:max-w-lg md:max-w-xl lg:max-w-3xl px-6 pb-4 sm:pb-6 md:pb-8 lg:pb-10 text-center z-20 flex flex-col justify-center items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="flex flex-col items-center justify-center"
                >
                  <h3 className="font-serif text-[24px] sm:text-[30px] md:text-[36px] lg:text-[42px] text-[#D94E4E] font-medium tracking-wide leading-tight mb-4 sm:mb-6 max-w-[280px] xs:max-w-[340px] sm:max-w-xl md:max-w-2xl">
                    {journeySlides[activeStep].header}
                  </h3>
                  <p className="text-gray-300 font-sans text-[13px] sm:text-[14px] md:text-[16px] lg:text-[18px] font-light leading-relaxed max-w-[280px] xs:max-w-[340px] sm:max-w-xl md:max-w-3xl">
                    {journeySlides[activeStep].text}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
