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
          <span className="font-josefin text-base sm:text-lg md:text-base lg:text-2xl font-normal text-[#1D1E1E]/60 group-hover:text-[#D94E4E] transition-colors w-12 sm:w-20 md:w-16 lg:w-24 text-left">
            {String(idx + 1).padStart(2, '0')}
          </span>
          <h4 className="font-josefin text-lg sm:text-xl md:text-xl lg:text-3xl font-normal tracking-tight text-[#1D1E1E] flex-1 text-center leading-[1.1]">
            {svc.name}
          </h4>
          <div className="w-12 sm:w-20 md:w-16 lg:w-24 flex justify-end">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-10 md:h-10 lg:w-14 lg:h-14 bg-[#1D1E1E]/5 group-hover:bg-[#D94E4E] rounded-full border border-[#1D1E1E]/10 flex items-center justify-center text-[#1D1E1E] group-hover:text-white transition-all duration-300">
              <MoveRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5 lg:w-6 lg:h-6 transition-transform duration-500 ease-out rotate-[-45deg] group-hover:rotate-0" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
