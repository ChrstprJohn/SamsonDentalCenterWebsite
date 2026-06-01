'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onBookClick: () => void;
}

export function HeroSection({ onBookClick }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative min-h-[85vh] flex items-center pt-24 pb-16 md:py-32 px-6 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(0,0,0,0))]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
          <span className="inline-flex self-center lg:self-start px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400">
            🦷 Premier Dental Experience
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] md:leading-[1.15]">
            Excellence in Dental Care,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Tailored for Your Smile
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-550 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Experience premier dental health services with state-of-the-art operatory facilities, digital scanning, and personalized care mapping designed for your maximum comfort.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-4">
            <Button size="lg" onClick={onBookClick}>
              Book Appointment Now
            </Button>
            <a href="#services">
              <Button variant="secondary" size="lg">
                Explore Services
              </Button>
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-[450px] aspect-[4/5] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl p-2 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 backdrop-blur-2xl">
            <div className="relative w-full h-full rounded-[24px] overflow-hidden">
              <Image
                src="/images/hero_dental_office.png"
                alt="Modern Dental Operatory Samson Dental"
                fill
                sizes="(max-w-768px) 100vw, 450px"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
