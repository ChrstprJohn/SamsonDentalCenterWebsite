'use client';

import React from 'react';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import { ContactInfoPanel } from './sub-components/contact-info-panel';

interface ContactSectionProps {
  config: ClinicConfigResponseDto;
}

export function ContactSection({ config }: ContactSectionProps) {
  return (
    <section id="contact" className="py-24 sm:py-32 bg-[#FDFDFD] relative w-full border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <ContactInfoPanel config={config} />
      </div>
    </section>
  );
}
