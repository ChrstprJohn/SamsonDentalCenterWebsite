'use client';

import React from 'react';
import Link from 'next/link';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

interface FooterProps {
  config: ClinicConfigResponseDto | null;
}

const DEFAULT_HOURS = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  saturday: { isOpen: false, openTime: null, closeTime: null },
  sunday: { isOpen: false, openTime: null, closeTime: null },
};

const DAY_NAMES: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export function Footer({ config }: FooterProps) {
  const operatingHours = config?.operatingHours ?? DEFAULT_HOURS;
  const clinicName = config?.clinicName ?? 'Samson Dental Center';
  const address = config?.address ?? '123 Dental Way, Suite A';
  const phone = config?.phone ?? '(555) 0101';
  const email = config?.email ?? 'contact@samsondental.com';
  const socialLinks = config?.socialLinks ?? [];

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hr = parseInt(hours, 10);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const displayHr = hr % 12 || 12;
    return `${displayHr}:${minutes} ${ampm}`;
  };

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand & Mission */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-blue-500/20">
              🦷
            </div>
            <span className="text-white text-lg font-bold tracking-tight">
              {clinicName}
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mt-2">
            State-of-the-art dental care tailored around your comfort and health. Providing premier cosmetic, preventive, and surgical services.
          </p>
        </div>

        {/* Dynamic Hours */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white text-sm font-semibold tracking-wider uppercase">Operating Hours</h3>
          <div className="flex flex-col gap-2 text-sm">
            {Object.entries(operatingHours).map(([day, val]) => (
              <div key={day} className="flex justify-between items-center py-0.5">
                <span className="capitalize text-slate-400 font-medium">{DAY_NAMES[day] || day}</span>
                {val.isOpen ? (
                  <span className="text-slate-300 font-semibold">
                    {formatTime(val.openTime)} - {formatTime(val.closeTime)}
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white text-sm font-semibold tracking-wider uppercase">Get In Touch</h3>
          <div className="flex flex-col gap-3 text-sm">
            <p className="flex items-start gap-2.5 leading-relaxed">
              <span className="text-base text-blue-400">📍</span>
              {address}
            </p>
            <p className="flex items-center gap-2.5">
              <span className="text-base text-blue-400">📞</span>
              <a href={`tel:${phone}`} className="hover:text-white transition-colors">
                {phone}
              </a>
            </p>
            <p className="flex items-center gap-2.5">
              <span className="text-base text-blue-400">✉️</span>
              <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                {email}
              </a>
            </p>
          </div>
        </div>

        {/* Quick Links & Legal */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white text-sm font-semibold tracking-wider uppercase">Legal & Social</h3>
          <div className="flex flex-col gap-3 text-sm">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3 mt-3">
              {socialLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white text-sm transition-all duration-200"
                  title={link.platform}
                >
                  🌐
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-slate-800/60 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <p className="text-slate-500">
          © {new Date().getFullYear()} {clinicName}. All rights reserved.
        </p>
        <p className="text-slate-650 flex items-center gap-1.5">
          <span>Designed with ❤️ for premium healthcare.</span>
        </p>
      </div>
    </footer>
  );
}
