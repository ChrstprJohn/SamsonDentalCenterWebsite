'use client';

import React from 'react';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import { ContactInfoPanel } from './sub-components/contact-info-panel';

interface ContactSectionProps {
  config: ClinicConfigResponseDto;
}

export function ContactSection({ config }: ContactSectionProps) {
  // Build a Google Maps embed URL from the clinic address
  const encodedAddress = encodeURIComponent(config.address);
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;

  return (
    <section id="contact" className="py-24 sm:py-32 bg-[#FDFDFD] relative w-full border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left: Contact Info */}
          <ContactInfoPanel config={config} />

          {/* Right: Google Map */}
          <div className="w-full h-[420px] overflow-hidden border border-gray-100 shadow-sm group">
            <iframe
              title="Clinic Location"
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{
                border: 0,
                filter: 'grayscale(100%) contrast(1.05) brightness(0.97)',
                transition: 'filter 0.4s ease',
              }}
              className="group-hover:![filter:grayscale(20%)_contrast(1)_brightness(1)]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
