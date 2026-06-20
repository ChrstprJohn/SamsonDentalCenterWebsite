'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onBookClick: () => void;
}

export function HeroSection({ onBookClick }: HeroSectionProps) {
  const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 60, damping: 16, delay: 0.1 },
    },
  };

  const bodyVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 50, damping: 16, delay: 0.25 },
    },
  };

  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 60, damping: 16, delay: 0.35 },
    },
  };

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-[#031c14] text-[#ddefde]"
      style={{ minHeight: '100svh' }}
      aria-label="Hero Introduction"
    >
      {/* Background: full-bleed dental office image on the right half */}
      <div className="absolute inset-0 z-0 pointer-events-none flex">
        <div className="w-1/2 h-full bg-[#031c14]" />
        <div className="hidden lg:block w-1/2 h-full relative">
          <Image
            src="/images/hero_dental_office.png"
            alt="Dental Clinic Interior"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#031c14]/70" />
        </div>
      </div>

      {/* Content: 12-col × 4-row grid matching LAVA Dental layout */}
      <div
        className="relative z-10 w-full mx-auto"
        style={{
          width: 'min(1290px, 100% - clamp(1.5rem, 1.3636rem + 0.6061vw, 1.875rem) * 2)',
          marginInline: 'auto',
          paddingTop: 'clamp(6rem, 4.5455rem + 6.4646vw, 10rem)',
          paddingBottom: 'clamp(2rem, 1.3636rem + 2.8283vw, 3.75rem)',
          display: 'grid',
          gap: `clamp(1.5rem, 1.1364rem + 1.6162vw, 2.5rem) clamp(1rem, 0.6818rem + 1.4141vw, 1.875rem)`,
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridTemplateRows: 'repeat(4, auto)',
          minHeight: '100svh',
          boxSizing: 'border-box',
        }}
      >
        {/* HEADER: h1 — cols 1–4, rows 1–2 (top-left) */}
        <motion.div
          variants={headerVariants}
          custom={0.1}
          initial="hidden"
          animate="visible"
          style={{
            gridColumn: '1 / span 4',
            gridRowStart: 1,
            gridRowEnd: 'span 2',
            minWidth: 0,
          }}
        >
          <h1
            className="text-[#ddefde] font-bold leading-[1.1] tracking-tight"
            style={{
              fontFamily: '"Josefin Sans", "Jost", sans-serif',
              fontSize: 'clamp(1.9531rem, 1.5867rem + 1.6285vw, 2.9607rem)',
              maxWidth: '398px',
            }}
          >
            Unlock a world of<br />radiant smiles.
          </h1>
        </motion.div>

        {/* BODY: center image card — cols 5–8, rows 1–4 (centered) */}
        <motion.div
          variants={bodyVariants}
          initial="hidden"
          animate="visible"
          className="hidden lg:block"
          style={{
            gridColumn: '5 / span 4',
            gridRow: '1 / span 4',
            placeSelf: 'center center',
            minWidth: 0,
          }}
        >
          <div
            className="relative rounded-[20px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.55)] border border-white/10"
            style={{ width: '470px', height: '264px' }}
          >
            <Image
              src="/images/Right-Hero-Image.png"
              alt="Smiling happy family"
              fill
              priority
              className="object-cover object-center"
            />
          </div>
        </motion.div>

        {/* FOOTER: description + button — cols 1–4, rows 3–4 (bottom-left) */}
        <motion.div
          variants={footerVariants}
          custom={0.3}
          initial="hidden"
          animate="visible"
          style={{
            gridColumn: '1 / span 4',
            gridRowStart: 3,
            gridRowEnd: 'span 2',
            alignSelf: 'flex-end',
            minWidth: 0,
          }}
          className="flex flex-col gap-6"
        >
          <p
            className="text-[#ddefde]/85 leading-relaxed font-medium"
            style={{
              fontFamily: '"PP Neue Montreal", Arial, Helvetica, sans-serif',
              fontSize: 'clamp(1rem, 0.9091rem + 0.404vw, 1.25rem)',
            }}
          >
            Exceptional Dental Care Powered by Expertise, Innovation and Advanced Technology.
            Trusted by companies and individuals for over 60 years.
          </p>

          <div>
            <Button
              size="lg"
              onClick={onBookClick}
              className="bg-[#ddefde] hover:bg-[#c8e3c9] text-[#031c14] font-bold rounded-full px-9 py-4 text-[15px] shadow-md transition-all active:scale-[0.98] duration-200 cursor-pointer border-0"
              aria-label="Make an Appointment"
            >
              Make an Appointment
            </Button>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
