'use client';

import React from 'react';
import { Quote } from 'lucide-react';

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

          {/* Row 1: Slides Left */}
          <div className="flex w-max animate-marquee">
            {marqueeRow1.map((item, idx) => (
              <div 
                key={`row1-${idx}`}
                className="w-[260px] sm:w-[320px] shrink-0 mx-2.5 flex flex-col justify-between border border-gray-200/60 bg-[#F9F9F6] p-5 sm:p-6 rounded-none hover:border-[#D94E4E]/30 transition-all duration-300 font-sans whitespace-normal cursor-pointer shadow-sm"
              >
                <div>
                  <div className="text-[#D94E4E] mb-2.5 opacity-80">
                    <Quote className="w-3.5 h-3.5 rotate-180" />
                  </div>
                  <p className="text-gray-600 font-light text-xs sm:text-[13px] leading-relaxed italic">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-between text-[11px]">
                  <div className="flex items-center">
                    <img 
                      src={item.avatar} 
                      alt={item.name} 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 mr-2.5 border border-gray-100"
                    />
                    <div>
                      <h4 className="text-[#1D1E1E] font-semibold text-xs sm:text-[13px] leading-none">
                        {item.name}
                      </h4>
                      <p className="text-gray-400 font-medium text-[8px] sm:text-[9px] tracking-wider uppercase mt-1 leading-none">
                        {item.pathway}
                      </p>
                    </div>
                  </div>
                  <span className="text-[#D94E4E] font-semibold tracking-wider text-[9px] sm:text-[10px]">
                    {item.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Slides Right (Reverse) */}
          <div className="flex w-max animate-marquee-reverse">
            {marqueeRow2.map((item, idx) => (
              <div 
                key={`row2-${idx}`}
                className="w-[260px] sm:w-[320px] shrink-0 mx-2.5 flex flex-col justify-between border border-gray-200/60 bg-[#F9F9F6] p-5 sm:p-6 rounded-none hover:border-[#D94E4E]/30 transition-all duration-300 font-sans whitespace-normal cursor-pointer shadow-sm"
              >
                <div>
                  <div className="text-[#D94E4E] mb-2.5 opacity-80">
                    <Quote className="w-3.5 h-3.5 rotate-180" />
                  </div>
                  <p className="text-gray-600 font-light text-xs sm:text-[13px] leading-relaxed italic">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-between text-[11px]">
                  <div className="flex items-center">
                    <img 
                      src={item.avatar} 
                      alt={item.name} 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 mr-2.5 border border-gray-100"
                    />
                    <div>
                      <h4 className="text-[#1D1E1E] font-semibold text-xs sm:text-[13px] leading-none">
                        {item.name}
                      </h4>
                      <p className="text-gray-400 font-medium text-[8px] sm:text-[9px] tracking-wider uppercase mt-1 leading-none">
                        {item.pathway}
                      </p>
                    </div>
                  </div>
                  <span className="text-[#D94E4E] font-semibold tracking-wider text-[9px] sm:text-[10px]">
                    {item.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
