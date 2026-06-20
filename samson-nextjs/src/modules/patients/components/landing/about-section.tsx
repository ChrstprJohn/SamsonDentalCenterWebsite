'use client';

import React from 'react';

export function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32 bg-[#FDFDFD] relative w-full">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Visual Column */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
              <picture>
                <img
                  src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop"
                  alt="Precision natural cosmetic veneers dental artist checking color shades"
                  className="w-full h-full object-cover object-center filter sepia-[0.1]"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Overlay architectural detail badge */}
            <div className="absolute -bottom-6 -right-4 sm:right-6 bg-emerald-950 text-white p-6 rounded-2xl max-w-xs shadow-xl font-sans">
              <p className="font-serif text-2xl font-light tracking-tight leading-none text-[#ddefde]">
                15+ Years
              </p>
              <p className="text-[10px] tracking-widest font-semibold uppercase mt-2 text-white/80">
                of biological dentistry excellence
              </p>
            </div>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-6">
            <span className="text-[10px] tracking-[0.34em] text-emerald-800 uppercase font-bold block mb-4">
              Redefined Sanctuary
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#1D1E1E] leading-tight">
              Dental craftsmanship without anxiety.
            </h2>

            <div className="mt-8 space-y-6 text-[#4F5454] font-light leading-relaxed text-sm sm:text-[15px]">
              <p>
                At Samson Dental Center, we dismiss the traditional aseptic, noisy clinical blueprint. We designed our studio to function as an upscale boutique wellness retreat, removing standard sensory triggers through state-of-the-art quiet instruments and specialized calming scents.
              </p>
              <p className="font-medium text-[#1D1E1E]">
                &ldquo;Each veneer, crown, and realignment is designed in meticulous alignment with the natural symmetry principles found in classic design and physical architecture.&rdquo;
              </p>
              <p>
                Led by expert cosmetic prosthodontists, we integrate state-of-the-art diagnostic imaging with microscopic accuracy to construct biological restorations that maintain structural longevity and organic beauty simultaneously.
              </p>
            </div>

            {/* Unique Features */}
            <div className="mt-10 grid grid-cols-2 gap-6 pt-8 border-t border-gray-100">
              <div>
                <h4 className="font-serif text-lg font-medium text-[#1D1E1E]">Aroma Diffusion</h4>
                <p className="text-[12px] text-gray-500 mt-1">Scent-infused air systems optimized to actively regulate elevated heart rate metrics.</p>
              </div>
              <div>
                <h4 className="font-serif text-lg font-medium text-[#1D1E1E]">Ultra-Quiet Tech</h4>
                <p className="text-[12px] text-gray-500 mt-1">Noise-reduction instruments producing 70% lower acoustic frequencies.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
