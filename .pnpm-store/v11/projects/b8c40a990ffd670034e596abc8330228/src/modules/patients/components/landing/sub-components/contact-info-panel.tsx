'use client';

import { Clock, MapPin, Phone } from 'lucide-react';
import type React from 'react';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

export function ContactInfoPanel({ config }: { config: ClinicConfigResponseDto }) {
  return (
    <div className="lg:col-span-5 flex flex-col justify-between">
      <div>
        <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-4 font-sans">
          Reservations
        </span>
        <h2 className="font-sans text-[clamp(22px,2vw+12px,38px)] font-normal tracking-[-0.04em] text-[#1D1E1E] leading-[1.1]">
          Inquire Consultation
        </h2>
        <p className="mt-6 text-[clamp(12px,0.3vw+11px,14px)] font-normal text-gray-500 max-w-sm leading-[1.65] font-sans">
          Reserve a time slot with our master clinicians for a detailed anatomical diagnostics overview. Our reservation concierges will follow up shortly to curate your bespoke visit.
        </p>
        <div className="mt-10 space-y-6">
          <ContactLine icon={<Phone className="w-4 h-4" />} label="Direct Desk" value={config.phone} />
          <ContactLine icon={<MapPin className="w-4 h-4" />} label="Oasis Address" value={config.address} />
          <ContactLine icon={<Clock className="w-4 h-4" />} label="Consultation Hours" value="Mon - Fri: 8:00 AM - 5:00 PM" />
        </div>
      </div>
      <div className="mt-12 lg:mt-0 pt-8 border-t border-gray-100 flex items-center gap-6">
        <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-gray-400 font-sans">Accredited Member:</span>
        <span className="text-xs font-serif italic text-[#1D1E1E] tracking-wider">American Academy of Cosmetic Dentistry</span>
      </div>
    </div>
  );
}

function ContactLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-none bg-gray-50 flex items-center justify-center text-[#1D1E1E] border border-gray-100 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] tracking-widest uppercase font-semibold text-gray-400 font-sans">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-1 font-sans">{value}</p>
      </div>
    </div>
  );
}
