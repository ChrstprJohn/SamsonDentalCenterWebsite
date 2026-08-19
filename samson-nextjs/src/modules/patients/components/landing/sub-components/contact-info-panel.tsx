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
        <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-2 sm:mb-3 font-sans">
          Our Contact
        </span>
        <h2 className="font-sans text-[20px] sm:text-[clamp(22px,2vw+10px,32px)] font-normal tracking-[-0.03em] text-[#1D1E1E] leading-[1.3] sm:leading-[1.2] md:leading-[1.15]">
          Need immediate help?
        </h2>
        <p className="max-w-sm pt-2 sm:pt-2 font-sans text-[13px] sm:text-[clamp(12px,0.3vw+11px,14px)] font-normal leading-relaxed text-gray-500">
          Contact us at {formatLocalPhone(config.phone)}{config.landline && <> or {formatLocalPhone(config.landline)}</>}, or visit our clinic directly. Our team is ready to assist you.
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
        <p className="text-[11px] sm:text-xs tracking-widest uppercase font-semibold text-gray-500 font-sans">{label}</p>
        <p className="text-[13px] sm:text-sm font-medium text-gray-900 mt-1 font-sans">{value}</p>
      </div>
    </div>
  );
}
