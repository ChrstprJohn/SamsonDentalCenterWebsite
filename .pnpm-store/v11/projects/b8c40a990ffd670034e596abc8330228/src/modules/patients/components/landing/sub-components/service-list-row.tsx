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
      className="group relative flex items-center justify-between py-6 sm:py-8 transition-colors duration-300 hover:bg-[#1C1D1D]/70 px-4 sm:px-6 rounded-2xl cursor-pointer overflow-hidden"
    >
      <NoiseOverlay className="opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300" />
      <span className="relative z-10 text-[clamp(18px,1vw+10px,24px)] font-josefin font-normal text-white/75 group-hover:text-white transition-colors w-12 sm:w-24 text-left">
        {nr}
      </span>
      <h4 className="relative z-10 font-josefin text-[clamp(16px,2vw+10px,30px)] font-normal tracking-tight text-white/90 group-hover:text-white transition-colors flex-1 text-center leading-[1.1]">
        <ServiceTitle title={title} />
      </h4>
      <div className="relative z-10 w-12 sm:w-24 flex justify-end">
        <div className="w-[clamp(36px,3.5vw+12px,54px)] h-[clamp(36px,3.5vw+12px,54px)] bg-white/5 group-hover:bg-[#D94E4E] rounded-full border border-white/10 flex items-center justify-center text-white/80 group-hover:text-white transition-all duration-305">
          <MoveRight className="w-[clamp(16px,1.2vw+6px,24px)] h-[clamp(16px,1.2vw+6px,24px)] transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
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
