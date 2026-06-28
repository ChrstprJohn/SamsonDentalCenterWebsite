'use client';

import React from 'react';
import { TestimonialMarqueeRow } from './sub-components/testimonial-marquee-row';

const row1Data = [
  {
    name: 'Eleanor Vance',
    pathway: 'Aesthetic Veneers Pathway',
    text: 'Zero anxiety environment. My microscopic veneers look incredibly organic and natural.',
    rating: '5.0 Rating',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
  },
  {
    name: 'Dr. Arthur Pendleton',
    pathway: 'Full-Arch Bio-Restoration',
    text: 'Outstanding precision. The biological reconstruction fits perfectly with natural facial symmetry.',
    rating: '5.0 Rating',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
  },
  {
    name: 'Clara Valenzuela',
    pathway: 'Micro-Endodontic Therapy',
    text: 'Refined retreat care. Extremely quiet instruments and bespoke clinical comfort.',
    rating: '5.0 Rating',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop',
  },
];

const row2Data = [
  {
    name: 'Marcus Sterling',
    pathway: 'Premium Dental Implants',
    text: 'Painless computer-guided implants. The crown looks and feels like a natural tooth.',
    rating: '5.0 Rating',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
  },
  {
    name: 'Sophia Thorne',
    pathway: 'Clear Aligner Pathway',
    text: 'Thorough diagnostic scanning and simulations. Transparent care with perfect results.',
    rating: '5.0 Rating',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
  },
  {
    name: 'Julian Bennett',
    pathway: 'Periodontal Recovery',
    text: 'Exceptional tissue regeneration. Biological healing protocols exceeded my expectations.',
    rating: '5.0 Rating',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150&auto=format&fit=crop',
  },
];

// Duplicate items to ensure a seamless infinite scroll loop
const marqueeRow1 = [...row1Data, ...row1Data, ...row1Data];
const marqueeRow2 = [...row2Data, ...row2Data, ...row2Data];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32 bg-[#FDFDFD] relative w-full border-t border-gray-100 overflow-hidden">
      
      {/* Inline styles for the reverse marquee animation */}
      <style>{`
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 25s linear infinite;
        }
        .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col gap-16 sm:gap-20">
        
        {/* Header Layout matching other sections */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
            <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-4 font-sans">
              Client Chronicles
            </span>
            <h2 className="font-sans text-[clamp(20px,2vw+10px,32px)] font-normal tracking-[-0.04em] text-[#1D1E1E] leading-[1.05]">
              Real feedback from patients who experienced our redefined sanctuary.
            </h2>
          </div>
          <p className="text-[clamp(12px,0.3vw+11px,14px)] font-normal text-gray-500 max-w-sm leading-[1.65] font-sans pt-2">
            Read about the transformations and clinical comfort curated by our specialist practitioners for each unique anatomical smile design.
          </p>
        </div>

        {/* Contained Infinite Marquee Double Stack */}
        <div className="relative w-full overflow-hidden flex flex-col gap-4 py-2 bg-transparent select-none">
          
          {/* Left and Right Fade Masks for Smooth Edge Transitions within container */}
          <div className="absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#FDFDFD] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#FDFDFD] to-transparent z-10 pointer-events-none" />

          <TestimonialMarqueeRow items={marqueeRow1} rowId="row1" />
          <TestimonialMarqueeRow items={marqueeRow2} rowId="row2" reverse />

        </div>
      </div>
    </section>
  );
}
