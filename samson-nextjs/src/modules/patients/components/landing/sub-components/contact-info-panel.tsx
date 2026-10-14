'use client';

import { Clock, MapPin, Phone } from 'lucide-react';
import type React from 'react';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import { formatTimeString } from '@/shared/utils/date.util';

function formatLocalPhone(phone: string): string {
  // Replace +63 country code with leading 0 (e.g. +63 917 564 4048 → 0917 564 4048)
  return phone.replace(/^\+63\s?/, '0');
}

export function ContactInfoPanel({ config }: { config: ClinicConfigResponseDto }) {
  const dayLabels: Record<string, string> = {
    monday: 'M',
    tuesday: 'T',
    wednesday: 'W',
    thursday: 'TH',
    friday: 'F',
    saturday: 'SA',
    sunday: 'SU',
  };
  const openDays = Object.entries(config.operatingHours).filter(([, hours]) => hours.isOpen);
  const firstOpenDay = openDays[0]?.[1];
  const consultationHours = firstOpenDay?.openTime && firstOpenDay.closeTime
    ? `${openDays.map(([day]) => dayLabels[day]).join('-')} • ${formatTimeString(firstOpenDay.openTime)} - ${formatTimeString(firstOpenDay.closeTime)}`
    : 'Currently closed';

  return (
    <div className="flex flex-col justify-between">
      <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
        <span className="text-[clamp(0.75rem,0.7rem+0.2vw,0.8125rem)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
          Our Contact
        </span>
        <h2 className="font-sans text-[clamp(1.625rem,1.375rem+1vw,2.25rem)] text-balance font-normal tracking-[-0.03em] text-[#1D1E1E] leading-[1.3] sm:leading-[1.2] md:leading-[1.15]">
          Need immediate help?
        </h2>
        <p className="max-w-sm pt-2 sm:pt-2 font-sans text-[clamp(1rem,0.95rem+0.2vw,1.0625rem)] font-normal leading-relaxed text-gray-500">
          Contact us at <strong className="font-bold text-[#1D1E1E]">{formatLocalPhone(config.phone)}</strong>{config.landline && <> or <strong className="font-bold text-[#1D1E1E]">{formatLocalPhone(config.landline)}</strong></>}, or visit our clinic directly. Our team is ready to assist you.
        </p>
        <div className="mt-7 sm:mt-10 space-y-5 sm:space-y-6">
          <ContactLine icon={<Phone className="w-4 h-4" />} label="Phone" value={formatLocalPhone(config.phone)} />
          {config.landline && <ContactLine icon={<Phone className="w-4 h-4" />} label="Landline" value={formatLocalPhone(config.landline)} />}
          <ContactLine icon={<MapPin className="w-4 h-4" />} label="Address" value={config.address} />
          <ContactLine icon={<Clock className="w-4 h-4" />} label="Hours" value={consultationHours} />
        </div>
      </div>
    </div>
  );
}

function ContactLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-none bg-gray-50 flex items-center justify-center text-[#1D1E1E] border border-gray-100 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[clamp(0.75rem,0.7rem+0.2vw,0.8125rem)] tracking-widest uppercase font-semibold text-gray-500 font-sans">{label}</p>
        <p className="text-[clamp(1rem,0.95rem+0.2vw,1.0625rem)] font-medium text-gray-900 mt-1 font-sans">{value}</p>
      </div>
    </div>
  );
}
