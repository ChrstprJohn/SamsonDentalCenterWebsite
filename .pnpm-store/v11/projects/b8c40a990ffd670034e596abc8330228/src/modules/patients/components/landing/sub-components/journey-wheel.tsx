'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface JourneySlide {
  header: string;
  text: string;
}

interface JourneyWheelProps {
  slides: JourneySlide[];
  activeStep: number;
  onStepSelect: (step: number) => void;
}

export function JourneyWheel({ slides, activeStep, onStepSelect }: JourneyWheelProps) {
  return (
    <div className="relative w-[92vw] h-[64.4vw] xs:w-[450px] xs:h-[315px] sm:w-[660px] sm:h-[264px] md:w-[850px] md:h-[340px] lg:w-full lg:max-w-7xl lg:h-auto lg:aspect-[5/2] overflow-visible z-10">
      <div className="absolute bottom-[-27.6vw] xs:bottom-[-135px] sm:bottom-[-396px] md:bottom-[-510px] lg:bottom-auto lg:top-0 left-0 w-[92vw] h-[92vw] xs:w-[450px] xs:h-[450px] sm:w-[660px] sm:h-[660px] md:w-[850px] md:h-[850px] lg:w-full lg:h-auto lg:aspect-square rounded-full border border-white/10 pointer-events-none z-0" />
      <div className="absolute left-1/2 -translate-x-1/2 w-[3px] h-16 bg-gradient-to-t from-[#D94E4E] to-[#D94E4E]/10 z-20 pointer-events-none bottom-[calc(100%+6.43%-60px)] sm:bottom-[calc(100%+11.25%-84px)]" />

      <motion.div
        animate={{ rotate: -activeStep * 60 }}
        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
        className="absolute bottom-[-27.6vw] xs:bottom-[-135px] sm:bottom-[-396px] md:bottom-[-510px] lg:bottom-auto lg:top-0 left-0 w-[92vw] h-[92vw] xs:w-[450px] xs:h-[450px] sm:w-[660px] sm:h-[660px] md:w-[850px] md:h-[850px] lg:w-full lg:h-auto lg:aspect-square rounded-full z-10"
      >
        {slides.map((_, idx) => (
          <JourneyWheelPoint key={`point-${idx}`} index={idx} activeStep={activeStep} onStepSelect={onStepSelect} />
        ))}
      </motion.div>

      <JourneyWheelContent slide={slides[activeStep]} activeStep={activeStep} />
    </div>
  );
}

function JourneyWheelPoint({
  index,
  activeStep,
  onStepSelect,
}: {
  index: number;
  activeStep: number;
  onStepSelect: (step: number) => void;
}) {
  const angleDeg = 270 + index * 60;
  const angleRad = (angleDeg * Math.PI) / 180;
  const dotLeft = `${50 + 50 * Math.cos(angleRad)}%`;
  const dotTop = `${50 + 50 * Math.sin(angleRad)}%`;
  const numLeft = `${50 + 54.5 * Math.cos(angleRad)}%`;
  const numTop = `${50 + 54.5 * Math.sin(angleRad)}%`;

  return (
    <React.Fragment>
      <div className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#D94E4E] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 pointer-events-none z-10" style={{ left: dotLeft, top: dotTop }} />
      <div className="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: numLeft, top: numTop }}>
        <motion.button
          onClick={() => onStepSelect(index)}
          type="button"
          animate={{
            rotate: index * 60,
            scale: activeStep === index ? 1.15 : 1,
            backgroundColor: activeStep === index ? '#D94E4E' : 'rgba(20, 21, 21, 0.45)',
            color: activeStep === index ? '#FDFDFD' : 'rgba(253, 253, 253, 0.7)',
            borderColor: activeStep === index ? '#D94E4E' : 'rgba(255, 255, 255, 0.15)',
            boxShadow: activeStep === index ? '0 4px 24px rgba(217, 78, 78, 0.45)' : 'none',
          }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center font-sans font-bold text-xs sm:text-sm tracking-tight cursor-pointer focus:outline-none transition-shadow"
        >
          {index + 1}
        </motion.button>
      </div>
    </React.Fragment>
  );
}

function JourneyWheelContent({ slide, activeStep }: { slide: JourneySlide; activeStep: number }) {
  return (
    <div className="absolute inset-x-0 bottom-6 top-auto sm:inset-auto sm:bottom-[40px] md:bottom-[60px] lg:bottom-[80px] sm:left-1/2 sm:-translate-x-1/2 w-full sm:max-w-lg md:max-w-xl lg:max-w-3xl px-6 pb-4 sm:pb-6 md:pb-8 lg:pb-10 text-center z-20 flex flex-col justify-center items-center">
      <AnimatePresence mode="wait">
        <motion.div key={activeStep} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="flex flex-col items-center justify-center">
          <h3 className="font-serif text-[24px] sm:text-[30px] md:text-[36px] lg:text-[42px] text-[#D94E4E] font-medium tracking-wide leading-tight mb-4 sm:mb-6 max-w-[280px] xs:max-w-[340px] sm:max-w-xl md:max-w-2xl">
            {slide.header}
          </h3>
          <p className="text-gray-300 font-sans text-[13px] sm:text-[14px] md:text-[16px] lg:text-[18px] font-light leading-relaxed max-w-[280px] xs:max-w-[340px] sm:max-w-xl md:max-w-3xl">
            {slide.text}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
