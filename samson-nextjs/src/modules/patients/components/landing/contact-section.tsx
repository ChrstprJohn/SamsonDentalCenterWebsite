'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
    <section id="contact" className="py-16 sm:py-32 bg-[#FDFDFD] relative w-full border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-start">
          {/* Left: Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <ContactInfoPanel config={config} />
          </motion.div>

          {/* Right: Google Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="w-full h-[300px] sm:h-[420px] overflow-hidden border border-gray-100 shadow-sm group"
          >
            <iframe
              title="Clinic Location"
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
