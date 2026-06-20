'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';

const journeySlides = [
  {
    header: 'More personal than personal',
    text: 'After a complex diagnosis, each patient is assigned a Treatment Plan Coordinator, or Personal Concierge. He or she takes care to ensure that the entire process is flawless and personalised — from scheduling appointments to the tiniest details that make your experience enjoyable and give you peace of mind.',
  },
  {
    header: 'Complete privacy',
    text: 'Treatment takes place in quiet, enclosed premises. Here you can feel safe, free and comfortable, away from the gaze of others or any disturbance.',
  },
  {
    header: 'Complete Sensory Calming',
    text: 'Through micro-diffusion of specialized organic essential oils and high-performance noise-canceling headsets, we neutralize standard clinical triggers. Enjoy heated herbal neck wraps, calming light therapy, and custom tea blends.',
  },
  {
    header: 'Microscopic Engineering',
    text: 'Utilizing dental operating microscopes, our prosthodontists achieve sub-micron accuracy. Every restoration is crafted for a flush margin, preserving valuable tooth structure and guaranteeing longevity.',
  },
  {
    header: 'Bespoke Biological Materials',
    text: 'We exclusively select premium biocompatible, metals-free ceramics and premium composite restorations that naturally mimic the visual refraction and structural elasticity of biological tooth tissue.',
  },
  {
    header: 'Facial Harmonization',
    text: 'Each individual veneer layout is meticulously balanced with your facial structural vectors, lip mobility, and natural alignment axes. We reject generic templates to build cohesive oral masterpieces.',
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
      className="relative h-[480vh] bg-[#141515] select-none w-full"
    >
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-[100dvh] w-full flex flex-col justify-end overflow-hidden bg-[#141515] text-[#FDFDFD] z-10">
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
        <div className="relative w-full max-w-7xl mx-auto flex flex-col justify-between items-center overflow-hidden pb-0 px-6 sm:px-12 h-full pt-16 sm:pt-20 lg:pt-24">
          {/* Header Block */}
          <div className="w-full relative z-30 pt-4 sm:pt-6">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FDFDFD] leading-tight text-center lg:text-left mt-2 sm:mt-0">
              Your smile starts here
            </h2>
          </div>

          {/* Semicircle parent container */}
          <div className="relative w-[340px] h-[136px] sm:w-[660px] sm:h-[264px] md:w-[850px] md:h-[340px] lg:w-full lg:max-w-7xl lg:h-auto lg:aspect-[5/2] overflow-visible z-10">
            {/* Static Semicircle Arc Reference Line */}
            <div className="absolute bottom-[-204px] sm:bottom-[-396px] md:bottom-[-510px] lg:bottom-auto lg:top-0 left-0 w-[340px] h-[340px] sm:w-[660px] sm:h-[660px] md:w-[850px] md:h-[850px] lg:w-full lg:h-auto lg:aspect-square rounded-full border border-white/10 pointer-events-none z-0" />

            {/* The Active Top Vertical Connection Line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-12 sm:h-20 bg-gradient-to-b from-[#D94E4E] to-[#D94E4E]/10 z-20 pointer-events-none" />

            {/* Rotating Wheel Container */}
            <motion.div
              animate={{ rotate: -activeStep * 60 }}
              transition={{ type: 'spring', stiffness: 50, damping: 15 }}
              className="absolute bottom-[-204px] sm:bottom-[-396px] md:bottom-[-510px] lg:bottom-auto lg:top-0 left-0 w-[340px] h-[340px] sm:w-[660px] sm:h-[660px] md:w-[850px] md:h-[850px] lg:w-full lg:h-auto lg:aspect-square rounded-full z-10"
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
            <div className="absolute bottom-[calc(110px+8vh)] sm:bottom-[calc(185px+8vh)] md:bottom-[calc(240px+8vh)] lg:bottom-[80px] left-1/2 -translate-x-1/2 w-full max-w-[90%] sm:max-w-xl md:max-w-2xl px-6 text-center z-20 h-[330px] sm:h-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="flex flex-col items-center h-full sm:h-auto md:h-[500px] lg:h-auto justify-center"
                >
                  <h3 className="font-serif text-2xl sm:text-3.5xl md:text-[34px] lg:text-[42px] text-[#D94E4E] font-medium tracking-wide leading-tight mb-4 sm:mb-6 max-w-lg sm:max-w-xl md:max-w-2xl">
                    {journeySlides[activeStep].header}
                  </h3>
                  <p className="text-gray-300 font-sans text-xs sm:text-sm md:text-[21px] lg:text-[18px] font-light leading-relaxed max-w-lg sm:max-w-xl md:max-w-3xl">
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
