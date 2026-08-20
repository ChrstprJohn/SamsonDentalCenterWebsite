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
      className="group relative flex items-center justify-between py-5 sm:py-7 transition-colors duration-300 hover:bg-[#1C1D1D]/70 px-4 sm:px-6 rounded-2xl cursor-pointer overflow-hidden"
    >
      <NoiseOverlay className="opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300" />
      <span className="relative z-10 text-sm sm:text-base md:text-base lg:text-lg font-josefin font-normal text-white/75 group-hover:text-white transition-colors w-10 sm:w-14 md:w-16 lg:w-16 text-left">
        {nr}
      </span>
      <h4 className="relative z-10 font-josefin text-base sm:text-lg md:text-lg lg:text-2xl font-normal tracking-tight text-white/90 group-hover:text-white transition-colors flex-1 text-center leading-[1.2]">
        <ServiceTitle title={title} />
      </h4>
      <div className="relative z-10 w-10 sm:w-14 md:w-16 lg:w-16 flex justify-end">
        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-white/5 group-hover:bg-[#D94E4E] rounded-full border border-white/10 flex items-center justify-center text-white/80 group-hover:text-white transition-all duration-300">
          <MoveRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4 lg:h-4 transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
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
  const words = title.split(' ');
  if (words.length === 2) return <>{words[0]}<br />{words[1]}</>;
  if (words.length === 3 && (words[1] === '&' || words[1].toLowerCase() === 'and')) {
    return <>{words[0]} {words[1]}<br />{words[2]}</>;
  }
  return title;
}
