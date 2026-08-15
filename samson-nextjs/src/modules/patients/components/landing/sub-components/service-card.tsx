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
      <span className="absolute top-3 left-3 sm:top-5 sm:left-5 md:top-4 md:left-4 lg:top-6 lg:left-6 text-white font-josefin font-normal text-base md:text-base lg:text-xl z-15">
        {nr}
      </span>
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 md:top-4 md:right-4 lg:top-6 lg:right-6 w-9 h-9 sm:w-10 sm:h-10 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white text-[#141515] group-hover:bg-[#D94E4E] group-hover:text-white rounded-full flex items-center justify-center font-normal shadow-md z-15 transition-all duration-300">
        <MoveRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
      </div>
      <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 md:bottom-4 md:left-4 lg:bottom-6 lg:left-6 z-15 max-w-[85%]">
        <h3 className="font-josefin text-left text-lg sm:text-xl md:text-lg lg:text-2xl font-normal text-white tracking-tight leading-tight">
          {words.length === 2 ? <>{words[0]}<br />{words[1]}</> : title}
        </h3>
      </div>
    </div>
  );
}
