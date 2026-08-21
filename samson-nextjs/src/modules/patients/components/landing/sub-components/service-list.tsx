'use client';

import { MoveRight } from 'lucide-react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

interface ServiceListProps {
  services: ServiceResponseDto[];
  onSelect: (svc: ServiceResponseDto) => void;
}

export function ServiceList({ services, onSelect }: ServiceListProps) {
  return (
    <div className="divide-y divide-[#1D1E1E]/10 border-y border-[#1D1E1E]/10">
      {services.map((svc, idx) => (
        <div
          key={svc.id}
          onClick={() => onSelect(svc)}
          title="Click to book this service"
          className="group flex items-center justify-between py-6 sm:py-8 px-4 sm:px-6 cursor-pointer transition-colors duration-300 hover:bg-[#1D1E1E]/[0.03]"
        >
          <span className="font-sans text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-[#1D1E1E]/60 group-hover:text-[#D94E4E] transition-colors w-10 sm:w-14 md:w-16 lg:w-16 text-left shrink-0">
            {String(idx + 1).padStart(2, '0')}
          </span>
          <h4 className="font-sans text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal tracking-tight text-[#1D1E1E] flex-1 text-center leading-[1.2] px-2 sm:px-3 max-w-[280px] sm:max-w-md md:max-w-xl mx-auto">
            <ServiceTitle title={svc.name} />
          </h4>
          <div className="w-10 sm:w-14 md:w-16 lg:w-16 flex justify-end shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-10 md:h-10 lg:w-11 lg:h-11 bg-[#1D1E1E]/5 group-hover:bg-[#D94E4E] rounded-full border border-[#1D1E1E]/10 flex items-center justify-center text-[#1D1E1E] group-hover:text-white transition-all duration-300 shadow-2xs">
              <MoveRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
            </div>
          </div>
        </div>
      ))}
    </div>
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
