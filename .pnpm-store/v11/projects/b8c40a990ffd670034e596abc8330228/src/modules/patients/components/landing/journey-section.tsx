'use client';

import React from 'react';
import { useJourneySection } from '../../hooks/landing/use-journey-section';
import { NoiseOverlay } from './sub-components/service-list-row';
import { JourneyWheel } from './sub-components/journey-wheel';

const journeySlides = [
  { header: 'More personal than personal', text: 'Your personal concierge manages every aspect of your treatment timeline, ensuring a flawless process from booking to follow-up care.' },
  { header: 'Complete privacy', text: 'We conduct every procedure within private, quiet treatment suites designed to shield you from standard clinical activity and noise.' },
  { header: 'Complete Sensory Calming', text: 'Organic essential oil aromatherapy and custom noise-cancelling headphones actively neutralize standard dental anxiety triggers.' },
  { header: 'Microscopic Engineering', text: 'Advanced operating microscopes enable sub-micron precision, allowing us to preserve structural tooth integrity and secure longevity.' },
  { header: 'Bespoke Biological Materials', text: 'We select metals-free biocompatible ceramics that perfectly mirror the organic light refraction and elasticity of real teeth.' },
  { header: 'Facial Harmonization', text: 'We customize every restoration in balance with your unique facial geometry, natural lip mobility, and individual aesthetic alignment.' },
];

export function JourneySection() {
  const { journeyRef, activeStep, scrollToStep } = useJourneySection();

  return (
    <section id="journey" ref={journeyRef} className="relative h-[480vh] bg-[#1D1E1E] select-none w-full">
      <div className="sticky top-0 h-[100dvh] w-full flex flex-col justify-end overflow-hidden bg-[#1D1E1E] text-[#FDFDFD] z-10">
        <NoiseOverlay />
        <JourneyBackgroundPattern />
        <div className="relative w-full max-w-7xl mx-auto flex flex-col justify-between items-center overflow-hidden pb-0 px-6 sm:px-12 h-full max-h-[820px] pt-20 sm:pt-24 lg:pt-28">
          <JourneyHeader />
          <JourneyWheel slides={journeySlides} activeStep={activeStep} onStepSelect={scrollToStep} />
        </div>
      </div>
    </section>
  );
}

function JourneyHeader() {
  return (
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
  );
}

function JourneyBackgroundPattern() {
  return (
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
  );
}
