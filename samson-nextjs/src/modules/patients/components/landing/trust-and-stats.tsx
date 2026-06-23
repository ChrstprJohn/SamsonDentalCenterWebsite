import React from 'react';

interface TrustAndStatsProps {
  variant?: 'v1' | 'v2';
}

export function TrustAndStats({ variant = 'v1' }: TrustAndStatsProps) {
  const stats = [
    { value: '60+', label: 'Years of Pure Dental Expertise' },
    { value: '4.9★', label: 'Google Rating (2.5k+ Reviews)' },
    { value: '15k+', label: 'Radiant Smiles Formed' },
    { value: '100%', label: 'Board-Certified Specialists' },
    { value: 'Elite', label: 'In-House Ceramic Smile Lab' },
  ];

  const isV2 = variant === 'v2';

  return (
    <section
      id="trust-and-stats"
      className={`relative w-full overflow-hidden z-20 ${
        isV2 ? 'bg-[#FDFDFD]/90 border-y border-gray-200 shadow-xs' : 'bg-[#1D1E1E] border-y border-[#D94E4E]/15'
      }`}
    >
      {/* Mobile View: Rotating Luxury Marquee Banner with Edge Fade Masks */}
      <div className="block lg:hidden py-6 overflow-hidden relative" id="trust-marquee-ribbon">
        <div className={`absolute inset-y-0 left-0 w-8 bg-gradient-to-r ${isV2 ? 'from-[#FDFDFD]' : 'from-[#1D1E1E]'} to-transparent pointer-events-none z-10`} />
        <div className={`absolute inset-y-0 right-0 w-8 bg-gradient-to-l ${isV2 ? 'from-[#FDFDFD]' : 'from-[#1D1E1E]'} to-transparent pointer-events-none z-10`} />
 
        <div className="animate-marquee flex flex-row items-center whitespace-nowrap shrink-0">
          {/* Main Loop Group */}
          <div className="flex items-center gap-x-10 sm:gap-x-12 px-5">
            {stats.map((stat, idx) => (
              <React.Fragment key={`mobile-1-${idx}`}>
                <div className="flex flex-col items-center justify-center text-center shrink-0">
                  <span className={`${isV2 ? 'text-[#0070F3]' : 'text-[#D94E4E]'} font-serif text-[clamp(20px,2vw+12px,28px)] font-light mb-1 select-none`}>
                    {stat.value}
                  </span>
                  <span className={`font-sans text-[clamp(8.5px,0.5vw+7px,10px)] tracking-[0.16em] ${isV2 ? 'text-[#1D1E1E]/80' : 'text-white/80'} font-medium uppercase leading-relaxed max-w-[130px] sm:max-w-[160px] whitespace-normal`}>
                    {stat.label}
                  </span>
                </div>
                {idx < stats.length - 1 && (
                  <span className={`${isV2 ? 'text-[#0070F3]/30' : 'text-[#D94E4E]/30'} font-serif text-sm select-none self-center`}>✦</span>
                )}
              </React.Fragment>
            ))}
          </div>
 
          <span className={`${isV2 ? 'text-[#0070F3]/30' : 'text-[#D94E4E]/30'} font-serif text-sm select-none self-center px-4`}>✦</span>
 
          {/* Duplicated Loop Group for seamless looping transitions */}
          <div className="flex items-center gap-x-10 sm:gap-x-12 px-5">
            {stats.map((stat, idx) => (
              <React.Fragment key={`mobile-2-${idx}`}>
                <div className="flex flex-col items-center justify-center text-center shrink-0">
                  <span className={`${isV2 ? 'text-[#0070F3]' : 'text-[#D94E4E]'} font-serif text-[clamp(20px,2vw+12px,28px)] font-light mb-1 select-none`}>
                    {stat.value}
                  </span>
                  <span className={`font-sans text-[clamp(8.5px,0.5vw+7px,10px)] tracking-[0.16em] ${isV2 ? 'text-[#1D1E1E]/80' : 'text-white/80'} font-medium uppercase leading-relaxed max-w-[130px] sm:max-w-[160px] whitespace-normal`}>
                    {stat.label}
                  </span>
                </div>
                {idx < stats.length - 1 && (
                  <span className={`${isV2 ? 'text-[#0070F3]/30' : 'text-[#D94E4E]/30'} font-serif text-sm select-none self-center`}>✦</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
 
      {/* Large/Medium Desktop View: Elegant Static Stat Grid */}
      <div className="hidden lg:block max-w-7xl mx-auto px-12 py-12" id="desktop-stats-grid">
        <div className={`grid grid-cols-5 gap-4 divide-x ${isV2 ? 'divide-gray-200' : 'divide-[#D94E4E]/15'}`}>
          {stats.map((stat, idx) => (
            <div key={`desktop-${idx}`} className="flex flex-col items-center justify-center text-center px-4">
              <span className={`${isV2 ? 'text-[#0070F3]' : 'text-[#D94E4E]'} font-serif text-[clamp(28px,2vw+16px,40px)] font-light mb-2.5`}>{stat.value}</span>
              <span className={`font-sans text-[clamp(9.5px,0.2vw+9px,11px)] tracking-[0.16em] ${isV2 ? 'text-[#1D1E1E]/80' : 'text-white/80'} font-medium uppercase leading-relaxed max-w-[180px]`}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
