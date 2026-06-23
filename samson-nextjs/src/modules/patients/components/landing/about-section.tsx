'use client';

import React from 'react';

const doctorsData = [
  {
    name: 'Dr. Christopher Samson',
    role: 'Lead Prosthodontist & Smile Designer',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=600&auto=format&fit=crop',
    bio: 'Specializes in microscopic veneers, full-mouth biological reconstructions, and cranial symmetry harmonization.',
    schedule: 'Mon, Wed, Fri',
  },
  {
    name: 'Dr. Andrea Santos',
    role: 'Micro-Endodontic Specialist',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop',
    bio: 'Expert in dental operating microscopes, root tubule disinfection, and highly precise root canal therapy.',
    schedule: 'Tue, Thu, Sat',
  },
  {
    name: 'Dr. Marcus Reyes',
    role: 'Periodontal Surgeon & Implantologist',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop',
    bio: 'Dedicated to advanced bone tissue regeneration, computer-guided implant placement, and biological recovery.',
    schedule: 'Mon, Tue, Thu, Fri',
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-[#FDFDFD] relative w-full">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-24">
        
        {/* Row 1: Image Left, Text Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Visual Column */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-[4/5] overflow-hidden border border-white/5 bg-[#1D1E1E]">
              <picture>
                <img
                  src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop"
                  alt="Precision natural cosmetic veneers dental artist checking color shades"
                  className="w-full h-full object-cover object-center filter sepia-[0.1]"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Overlay architectural detail badge (Sharp border matching services) */}
            <div className="absolute -bottom-6 -right-4 sm:right-6 bg-[#1D1E1E] text-white p-6 max-w-xs border border border-white/10 font-sans">
              <p className="font-serif text-2xl font-light tracking-tight leading-none text-[#D94E4E]">
                15+ Years
              </p>
              <p className="text-[10px] tracking-widest font-semibold uppercase mt-2 text-white/80">
                of biological dentistry excellence
              </p>
            </div>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-6">
            <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-4 font-sans">
              Redefined Sanctuary
            </span>
            <h2 className="font-sans text-[clamp(22px,2vw+12px,36px)] font-normal tracking-[-0.04em] text-[#1D1E1E] leading-[1.1]">
              Dental craftsmanship without anxiety.
            </h2>

            <div className="mt-8 space-y-6 text-[#4F5454] font-light leading-relaxed text-sm sm:text-[15px] font-sans">
              <p>
                We dismiss the traditional noisy clinical blueprint. Our studio functions as an upscale boutique wellness retreat, removing standard sensory triggers through ultra-quiet instruments and specialized calming aroma diffusion.
              </p>
              <p className="font-medium text-[#1D1E1E] italic border-l-2 border-[#D94E4E] pl-4">
                &ldquo;Each veneer, crown, and realignment is designed in meticulous alignment with natural symmetry principles found in classic design.&rdquo;
              </p>
              <p>
                Led by expert cosmetic specialists, we integrate state-of-the-art diagnostic imaging with microscopic accuracy to construct restorations that maintain structural longevity and organic beauty.
              </p>
            </div>

            {/* Unique Features */}
            <div className="mt-10 grid grid-cols-2 gap-6 pt-8 border-t border-gray-100 font-sans">
              <div>
                <h4 className="text-[#1D1E1E] text-sm font-semibold tracking-wider uppercase">Aroma Diffusion</h4>
                <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed font-light">Scent-infused air systems optimized to actively regulate elevated heart rate metrics.</p>
              </div>
              <div>
                <h4 className="text-[#1D1E1E] text-sm font-semibold tracking-wider uppercase">Ultra-Quiet Tech</h4>
                <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed font-light">Noise-reduction instruments producing 70% lower acoustic frequencies.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Doctor Cards Container */}
        <div className="pt-20 border-t border-gray-100 font-sans">
          
          {/* Header Layout matching Services & Gallery */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
              <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-4 font-sans">
                Our Specialists
              </span>
              <h3 className="font-sans text-[clamp(20px,2vw+10px,32px)] font-normal tracking-[-0.04em] text-[#1D1E1E] leading-[1.05]">
                Meet our master clinical dental practitioners.
              </h3>
            </div>
            <p className="text-[clamp(12px,0.3vw+11px,14px)] font-normal text-gray-500 max-w-sm leading-[1.65] font-sans pt-2">
              Our board-certified prosthetic and surgical specialists integrate advanced diagnostics with sub-micron restorative engineering to guarantee biological excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctorsData.map((doc, idx) => (
              <div 
                key={idx} 
                className="group flex flex-col border border-gray-100 bg-white hover:border-[#D94E4E]/30 transition-all duration-300 overflow-hidden"
              >
                {/* Image Container with Sharp Borders */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <picture>
                    <img 
                      src={doc.image} 
                      alt={doc.name} 
                      className="w-full h-full object-cover object-center filter brightness-[0.95] saturate-[0.85] contrast-[1.01] group-hover:scale-[1.02] group-hover:brightness-100 group-hover:saturate-100 transition-all duration-500"
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1D1E1E]/30 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Details Container */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-gray-900 font-semibold text-lg leading-tight transition-colors group-hover:text-[#D94E4E]">
                      {doc.name}
                    </h4>
                    <p className="text-[#D94E4E] font-medium text-xs tracking-wider uppercase">
                      {doc.role}
                    </p>
                    <p className="text-gray-500 font-light text-sm mt-2 leading-relaxed">
                      {doc.bio}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-sans">
                    <span className="text-gray-400 font-medium uppercase tracking-wider">Practice Days</span>
                    <span className="text-[#1D1E1E] font-semibold bg-gray-50 px-2.5 py-1 rounded-[1px] border border-gray-100">
                      {doc.schedule}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
