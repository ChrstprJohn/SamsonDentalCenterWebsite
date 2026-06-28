'use client';

import { MoveRight } from 'lucide-react';

interface ServiceCardProps {
  nr: string;
  title: string;
  image: string;
  index: number;
  onClick: () => void;
}

export function ServiceCard({ nr, title, image, index, onClick }: ServiceCardProps) {
  const words = title.split(' ');
  const colSpan = index === 0 ? 'col-span-2 md:col-span-4' : 'col-span-1 md:col-span-1';
  const height = index === 0
    ? 'h-[195px] xs:h-[235px] sm:h-[275px] md:h-[220px] lg:h-[315px]'
    : 'h-[240px] xs:h-[275px] sm:h-[315px] md:h-[250px] lg:h-[365px]';

  return (
    <div onClick={onClick} className={`group relative ${height} rounded-none overflow-hidden block ${colSpan} bg-[#1D1E1E] cursor-pointer`}>
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.025] transition-transform duration-700 ease-out filter brightness-[0.9] saturate-[0.95] contrast-[1.01]"
      />
      <div className="absolute inset-0 bg-[#1D1E1E]/5 z-5 transition-opacity duration-350 group-hover:opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent z-10" />
      <span className="absolute top-3 left-3 sm:top-6 sm:left-6 text-white font-josefin font-normal text-[clamp(16px,1.2vw+8px,22px)] z-15">
        {nr}
      </span>
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 w-[clamp(36px,3.5vw+12px,54px)] h-[clamp(36px,3.5vw+12px,54px)] bg-white text-[#141515] group-hover:bg-[#D94E4E] group-hover:text-white rounded-full flex items-center justify-center font-normal shadow-md z-15 transition-all duration-300">
        <MoveRight className="w-[clamp(16px,1.2vw+6px,24px)] h-[clamp(16px,1.2vw+6px,24px)] transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
      </div>
      <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 z-15 max-w-[85%]">
        <h3 className="font-josefin text-left text-[clamp(16px,2vw+10px,30px)] font-normal text-white tracking-tight leading-tight">
          {words.length === 2 ? <>{words[0]}<br />{words[1]}</> : title}
        </h3>
      </div>
    </div>
  );
}
