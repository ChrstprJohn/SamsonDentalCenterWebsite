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
          className="group flex items-center justify-between py-5 sm:py-7 px-4 sm:px-6 cursor-pointer transition-colors duration-300 hover:bg-[#1D1E1E]/[0.03]"
        >
          <span className="font-josefin text-sm sm:text-base md:text-base lg:text-lg font-normal text-[#1D1E1E]/60 group-hover:text-[#D94E4E] transition-colors w-10 sm:w-14 md:w-16 lg:w-16 text-left">
            {String(idx + 1).padStart(2, '0')}
          </span>
          <h4 className="font-josefin text-base sm:text-lg md:text-lg lg:text-2xl font-normal tracking-tight text-[#1D1E1E] flex-1 text-center leading-[1.2]">
            {svc.name}
          </h4>
          <div className="w-10 sm:w-14 md:w-16 lg:w-16 flex justify-end">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-[#1D1E1E]/5 group-hover:bg-[#D94E4E] rounded-full border border-[#1D1E1E]/10 flex items-center justify-center text-[#1D1E1E] group-hover:text-white transition-all duration-300">
              <MoveRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4 lg:h-4 transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
