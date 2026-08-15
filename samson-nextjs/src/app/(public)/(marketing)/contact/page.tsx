import React from 'react';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import { ContactSection } from '@/modules/patients/components/landing/contact-section';
import { MapPin } from 'lucide-react';

const DEFAULT_CONFIG: ClinicConfigResponseDto = {
  isBookingOpen: true,
  maintenanceMessage: null,
  maxReschedules: 1,
  clinicName: 'Samson Dental Center',
  websiteLogoUrl: null,
  emailLogoUrl: null,
  address: "lot 9 Upper Session Rd, Engineers' Hill, ext, Baguio, 2600 Benguet, Philippines",
  mapUrl: null,
  phone: '(555) 0101',
  landline: null,
  email: 'contact@samsondental.com',
  websiteUrl: null,
  whatsappUrl: null,
  operatingHours: {
    monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    saturday: { isOpen: false, openTime: null, closeTime: null },
    sunday: { isOpen: false, openTime: null, closeTime: null },
  },
  allowSameDayBooking: true,
  calendarRenderDays: 30,
  socialLinks: [],
};

export const metadata = {
  title: 'Contact Us | Samson Dental Center',
  description: 'Get in touch with Samson Dental Center. Find our location, phone number, email, and operating hours.',
};

export default async function ContactPage() {
  let config = DEFAULT_CONFIG;

  try {
    const configResponse = await getClinicConfigAction();
    if (configResponse && 'data' in configResponse && configResponse.data) {
      config = configResponse.data;
    }
  } catch (err) {
    console.error('Failed to load clinic config on contact page:', err);
  }

  const address = config.address ?? DEFAULT_CONFIG.address;
  const clinicName = config.clinicName ?? 'Samson Dental Center';
  const configuredMapUrl = config.mapUrl ?? null;
  const mapsUrl = configuredMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(`${clinicName}, ${address}`)}&output=embed`;

  return (
    <>
      {/* Contact Info Section */}
      <ContactSection config={config} />

      {/* Map Section */}
      <section className="bg-[#FDFDFD] pb-24 sm:pb-32 w-full">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-5 h-5 text-[#D94E4E]" />
            <p className="text-sm font-medium text-gray-700">{address}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-xs font-semibold text-[#D94E4E] hover:underline shrink-0"
            >
              Open in Google Maps ↗
            </a>
          </div>
          <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <iframe
              src={embedSrc}
              className="w-full h-full border-0"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map to ${clinicName}`}
            />
          </div>
        </div>
      </section>
    </>
  );
}
