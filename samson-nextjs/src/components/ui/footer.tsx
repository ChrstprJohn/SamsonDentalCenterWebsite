'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, ShieldCheck, Lock, Award, Calendar, Sparkles } from 'lucide-react';
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
  const address = config?.address ?? "lot 9 Upper Session Rd, Engineers' Hill, ext, Baguio, 2600 Benguet, Philippines";
  const phone = config?.phone ?? '+1 (555) 234-8890';
  const email = config?.email ?? 'contact@samsondental.com';

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hr = parseInt(hours, 10);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const displayHr = hr % 12 || 12;
    return `${displayHr}:${minutes} ${ampm}`;
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <footer className="bg-[#1D1E1E] text-[#BAC1C1]/80 border-t border-white/5 pt-20 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12 sm:gap-16">
        
        {/* Column 1 & 2: Massive Brand & Trust Badges */}
        <div className="md:col-span-2 flex flex-col gap-6 pr-0 md:pr-8">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-[15.6px] border border-current flex items-center justify-center font-serif text-[18px] italic font-normal text-white select-none">
              S
            </span>
            <div className="flex flex-col text-left items-start">
              <span className="font-serif text-[21px] lg:text-[23px] tracking-[0.2em] font-bold leading-none uppercase text-white">
                Samson
              </span>
              <span className="text-[9px] lg:text-[10px] tracking-[0.3em] uppercase opacity-75 font-sans font-bold leading-none mt-1.5 text-white">
                Dental Center
              </span>
            </div>
          </div>
          
          <p className="text-[14px] text-[#BAC1C1]/75 leading-relaxed font-light max-w-sm mt-2">
            Sculpting radiant smiles with architectural precision. Experience top-tier biological restorations, premium cosmetic veneers, and expert preventive care in a calming wellness sanctuary.
          </p>
          <div className="mt-4 w-full max-w-sm h-36 rounded-lg overflow-hidden border border-white/10 opacity-85 hover:opacity-100 transition-opacity">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent("Samson Dental Center, " + address)}&output=embed`}
              className="w-full h-full border-0 grayscale invert"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Column 3: Treatments (Deep Link Silos for SEO) */}
        <div className="flex flex-col gap-5">
          <h4 className="text-white text-xs font-semibold tracking-widest uppercase border-b border-white/5 pb-2.5">
            Treatments
          </h4>
          <nav className="flex flex-col gap-3 text-sm font-light">
            <Link href="/services/veneers" className="hover:text-white transition-colors">
              Cosmetic Veneers
            </Link>
            <Link href="/services/implants" className="hover:text-white transition-colors">
              Dental Implants
            </Link>
            <Link href="/services/aligners" className="hover:text-white transition-colors">
              Orthodontic Aligners
            </Link>
            <Link href="/services/hygiene" className="hover:text-white transition-colors">
              Professional Hygiene
            </Link>
            <Link href="/services/diagnostics" className="hover:text-white transition-colors">
              Complex Diagnostics
            </Link>
          </nav>
        </div>

        {/* Column 4: Local SEO NAP Block wrapped in HTML5 <address> */}
        <div className="flex flex-col gap-5">
          <h4 className="text-white text-xs font-semibold tracking-widest uppercase border-b border-white/5 pb-2.5">
            Contact Info
          </h4>
          <address className="not-italic flex flex-col gap-3.5 text-sm font-light">
            <a 
              href={mapsUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-start gap-2.5 leading-relaxed hover:text-white transition-colors group"
            >
              <MapPin className="w-4 h-4 text-[#D94E4E] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <span>{address}</span>
            </a>
            <a 
              href={`tel:${phone}`} 
              className="flex items-center gap-2.5 hover:text-white transition-colors group"
            >
              <Phone className="w-4 h-4 text-[#D94E4E] shrink-0 group-hover:scale-110 transition-transform" />
              <span>{phone}</span>
            </a>
            <a 
              href={`mailto:${email}`} 
              className="flex items-center gap-2.5 hover:text-white transition-colors group"
            >
              <Mail className="w-4 h-4 text-[#D94E4E] shrink-0 group-hover:scale-110 transition-transform" />
              <span>{email}</span>
            </a>
          </address>
          
          {/* Social Icons (FB, WhatsApp) */}
          <div className="flex items-center gap-3 mt-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#D94E4E] flex items-center justify-center text-white transition-colors"
              title="Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
              </svg>
            </a>
            <a
              href="https://wa.me/15552348890"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#D94E4E] flex items-center justify-center text-white transition-colors"
              title="WhatsApp"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.791-4.382 9.794-9.789.002-2.618-1.013-5.08-2.859-6.93C16.323 2.05 13.86 1.033 11.24 1.035c-5.405 0-9.794 4.384-9.798 9.79-.001 1.704.444 3.371 1.29 4.82l-.99 3.622 3.708-.973zm11.367-5.64c-.327-.163-1.94-.959-2.242-1.069-.303-.11-.524-.163-.745.163-.221.328-.856 1.077-1.049 1.29-.193.213-.386.24-.713.076-.327-.163-1.38-.508-2.63-1.62-1.026-.917-1.72-2.05-1.92-2.378-.201-.328-.021-.505.142-.668.147-.146.327-.382.49-.574.163-.192.217-.328.327-.546.11-.219.055-.41-.027-.574-.082-.163-.745-1.794-1.02-2.457-.267-.643-.538-.556-.738-.567-.191-.01-.41-.01-.628-.01-.218 0-.573.082-.873.41-.3.327-1.144 1.118-1.144 2.73 0 1.61 1.173 3.167 1.336 3.385.163.22.23 3.518 3.518 4.935.782.337 1.393.539 1.868.69.786.25 1.5.215 2.066.13.63-.095 1.94-.794 2.215-1.562.275-.768.275-1.426.193-1.562-.082-.137-.3-.219-.627-.382z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Column 5: Operating Hours */}
        <div className="flex flex-col gap-5">
          <h4 className="text-white text-xs font-semibold tracking-widest uppercase border-b border-white/5 pb-2.5">
            Clinic Hours
          </h4>
          <div className="flex flex-col gap-2.5 text-sm font-light">
            {Object.entries(operatingHours).map(([day, val]) => (
              <div key={day} className="flex justify-between items-center py-0.5">
                <span className="capitalize text-[#BAC1C1]/70">{DAY_NAMES[day] || day}</span>
                {val.isOpen ? (
                  <span className="text-white font-medium">
                    {formatTime(val.openTime)} - {formatTime(val.closeTime)}
                  </span>
                ) : (
                  <span className="text-white/40">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 border-t border-white/5 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-light text-white/40">
        
        {/* Copyright & Legal Compliance Links */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          <p>© {new Date().getFullYear()} {clinicName}. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors border-l border-white/10 pl-4">
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
