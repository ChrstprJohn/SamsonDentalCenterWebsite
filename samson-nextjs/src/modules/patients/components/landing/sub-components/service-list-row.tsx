'use client';

import { MoveRight } from 'lucide-react';

interface ServiceListRowProps {
  nr: string;
  title: string;
  onClick: () => void;
}

export function ServiceListRow({ nr, title, onClick }: ServiceListRowProps) {
  return (
    <div
      onClick={onClick}
      title="Click to book this service"
      className="group relative flex items-center justify-between py-6 sm:py-8 transition-colors duration-300 hover:bg-[#1C1D1D]/70 px-4 sm:px-6 rounded-2xl cursor-pointer overflow-hidden"
    >
      <NoiseOverlay className="opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300" />
      <span className="relative z-10 text-lg sm:text-xl md:text-2xl lg:text-3xl font-sans font-normal text-white/75 group-hover:text-white transition-colors w-10 sm:w-14 md:w-16 lg:w-16 text-left shrink-0">
        {nr}
      </span>
      <h4 className="relative z-10 font-sans text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal tracking-tight text-white/90 group-hover:text-white transition-colors flex-1 text-center leading-[1.2] px-2 sm:px-3 max-w-[280px] sm:max-w-md md:max-w-xl mx-auto">
        <ServiceTitle title={title} />
      </h4>
      <div className="relative z-10 w-10 sm:w-14 md:w-16 lg:w-16 flex justify-end shrink-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-10 md:h-10 lg:w-11 lg:h-11 bg-white/5 group-hover:bg-[#D94E4E] rounded-full border border-white/10 flex items-center justify-center text-white/80 group-hover:text-white transition-all duration-300 shadow-2xs">
          <MoveRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
        </div>
      </div>
    </div>
  );
}

export function NoiseOverlay({ className = 'opacity-[0.06]' }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 mix-blend-overlay pointer-events-none z-0 ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

function ServiceTitle({ title }: { title: string }) {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return <>{title}</>;
  if (words.length === 2) {
    return (
      <>
        <span className="block sm:inline">{words[0]}</span>
        <span className="hidden sm:inline"> </span>
        <span className="block sm:inline">{words[1]}</span>
      </>
    );
  }

  // Format into chunks of 2 words per line on mobile for clean wrap
  const pairs: string[] = [];
  for (let i = 0; i < words.length; i += 2) {
    pairs.push(words.slice(i, i + 2).join(' '));
  }

  return (
    <>
      <span className="sm:hidden">
        {pairs.map((pair, i) => (
          <span key={i} className="block">
            {pair}
          </span>
        ))}
      </span>
      <span className="hidden sm:inline">{title}</span>
    </>
  );
}
