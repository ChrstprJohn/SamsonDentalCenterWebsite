'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Link2 } from 'lucide-react';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

import { formatTimeString } from '@/shared/utils/date.util';

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
  const logoUrl = config?.logoUrl ?? null;
  const address = config?.address ?? "lot 9 Upper Session Rd, Engineers' Hill, ext, Baguio, 2600 Benguet, Philippines";
  const configuredMapUrl = config?.mapUrl ?? null;
  const phone = config?.phone ?? '+1 (555) 234-8890';
  const landline = config?.landline ?? null;
  const email = config?.email ?? 'contact@samsondental.com';
  const socialLinks = [
    ...(config?.whatsappUrl ? [{ platform: 'WhatsApp', url: config.whatsappUrl }] : []),
    ...(config?.socialLinks ?? []),
  ];

  const formatTime = formatTimeString;

  const mapsUrl = configuredMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <footer className="bg-[#1D1E1E] text-[#BAC1C1]/80 border-t border-white/5 pt-20 pb-12 font-sans relative overflow-hidden">
      {/* ponytail: CSS SVG noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12 sm:gap-16">
        
        {/* Column 1 & 2: Massive Brand & Trust Badges */}
        <div className="md:col-span-2 flex flex-col gap-6 pr-0 md:pr-8">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={clinicName} className="max-w-[180px] max-h-12 object-contain object-left" />
            ) : (
              <>
                <span className="w-9 h-9 rounded-[15.6px] border border-current flex items-center justify-center font-serif text-[18px] italic font-normal text-white select-none">
                  {clinicName.charAt(0).toUpperCase()}
                </span>
                <span className="font-serif text-[21px] lg:text-[23px] tracking-[0.12em] font-bold leading-none uppercase text-white">
                  {clinicName}
                </span>
              </>
            )}
          </div>
          
          <p className="text-[14px] text-[#BAC1C1]/75 leading-relaxed font-light max-w-sm mt-2">
            Sculpting radiant smiles with architectural precision. Experience top-tier biological restorations, premium cosmetic veneers, and expert preventive care in a calming wellness sanctuary.
          </p>
          <div className="mt-4 w-full max-w-sm h-52 rounded-lg overflow-hidden border border-white/10 opacity-85 hover:opacity-100 transition-opacity">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${clinicName}, ${address}`)}&output=embed`}
              className="w-full h-full border-0 grayscale"
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
            {landline && (
              <a
                href={`tel:${landline}`}
                className="flex items-center gap-2.5 hover:text-white transition-colors group"
              >
                <Phone className="w-4 h-4 text-[#D94E4E] shrink-0 group-hover:scale-110 transition-transform" />
                <span>{landline}</span>
              </a>
            )}
            <a 
              href={`mailto:${email}`} 
              className="flex items-center gap-2.5 hover:text-white transition-colors group"
            >
              <Mail className="w-4 h-4 text-[#D94E4E] shrink-0 group-hover:scale-110 transition-transform" />
              <span>{email}</span>
            </a>
          </address>
          
          <div className="mt-5 border-t border-white/5 pt-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-white">Follow us</p>
              {socialLinks.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={`${link.platform}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#D94E4E]"
                    aria-label={`Visit ${clinicName} on ${link.platform}`}
                  >
                    <SocialIcon platform={link.platform} />
                    {link.platform}
                  </a>
                ))}
              </div>
              ) : (
                <p className="mt-2 text-xs text-white/45">Our social profiles will be available soon.</p>
              )}
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

function SocialIcon({ platform }: { platform: string }) {
  const normalizedPlatform = platform.trim().toLowerCase();
  if (normalizedPlatform.includes('instagram')) return <InstagramIcon />;
  if (normalizedPlatform.includes('facebook')) return <FacebookIcon />;
  return <Link2 className="h-3.5 w-3.5" />;
}

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none" /></svg>;
}

function FacebookIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true"><path d="M13.5 21v-8h2.75l.41-3.12H13.5V7.89c0-.9.25-1.51 1.56-1.51h1.67V3.59A22.4 22.4 0 0 0 14.3 3c-2.4 0-4.05 1.46-4.05 4.14v2.74H7.5V13h2.75v8h3.25Z" /></svg>;
}
