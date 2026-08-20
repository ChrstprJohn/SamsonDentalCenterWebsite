'use client';

import React from 'react';
import { Award, MapPin, Wallet, Clock, Zap, Microscope, HeartHandshake, Stethoscope } from 'lucide-react';

const reasons = [
  {
    icon: Award,
    title: 'Multi-Generational Expertise',
    text: 'Built on over six decades of clinical practice, combining generations of family trust with modern dental care.',
  },
  {
    icon: MapPin,
    title: 'Central & Accessible Location',
    text: 'Conveniently located on Upper Session Road, making it easy to pop in for routine visits or scheduled care.',
  },
  {
    icon: Wallet,
    title: 'Transparent & Fair Pricing',
    text: "Clear treatment estimates up front with no surprise costs, helping you plan your family's care with confidence.",
  },
  {
    icon: Clock,
    title: 'Minimal Wait Times',
    text: "We respect your schedule with punctual appointments and attentive care designed to get you back to your day smoothly.",
  },
  {
    icon: Zap,
    title: 'Emergency Dental Care',
    text: 'Fast, reliable treatment for unexpected toothaches, chipped teeth, or sudden pain when you need immediate relief.',
  },
  {
    icon: Microscope,
    title: 'Modern Technology',
    text: 'Up-to-date digital tools and equipment for faster diagnostics, gentler treatments, and quicker recovery times.',
  },
  {
    icon: HeartHandshake,
    title: 'Gentle & Anxiety-Free',
    text: 'A warm, supportive environment with gentle techniques designed to keep nervous patients and young kids at ease.',
  },
  {
    icon: Stethoscope,
    title: 'Complete Family Care',
    text: "From simple checkups to complex treatments, we handle every stage of your family's oral health under one roof.",
  },
];

export function WhyChooseUsSection() {
  return (
    <section id="why-choose-us" className="py-16 sm:py-32 bg-[#FDFDFD] relative w-full border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col gap-10 sm:gap-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
          <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
            <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
              Why Choose Us
            </span>
            <h2 className="font-sans text-[20px] sm:text-[clamp(22px,2vw+10px,32px)] font-normal leading-[1.3] sm:leading-[1.2] md:leading-[1.15] tracking-[-0.03em] text-[#1D1E1E]">
              Dental Care Built Around You
            </h2>
          </div>
          <p className="max-w-sm pt-2 sm:pt-2 md:max-w-[280px] lg:max-w-sm font-sans text-[13px] sm:text-[clamp(12px,0.3vw+11px,14px)] font-normal leading-relaxed text-gray-500">
            Combining six decades of clinical experience with modern technology to give you transparent, high-quality treatment in a comfortable setting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {reasons.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group border border-gray-100 bg-white p-4 sm:p-8 transition-colors duration-300 hover:border-[#D94E4E]/30"
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[#1D1E1E]/5 group-hover:bg-[#D94E4E] rounded-full flex items-center justify-center text-[#1D1E1E] group-hover:text-white transition-all duration-300">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="mt-3 sm:mt-5 text-[#1D1E1E] text-[15px] sm:text-base font-semibold font-sans">{title}</h3>
              <p className="mt-1.5 sm:mt-2 text-[12px] sm:text-[13px] text-gray-500 leading-relaxed font-light font-sans">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}