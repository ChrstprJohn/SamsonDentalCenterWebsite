import React from 'react';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { LandingView } from '@/modules/patients/views/landing-view';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

const DEFAULT_CONFIG: ClinicConfigResponseDto = {
  isBookingOpen: true,
  maintenanceMessage: null,
  maxReschedules: 1,
  clinicName: 'Samson Dental Center',
  logoUrl: null,
  address: '123 Dental Way, Suite A',
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

export default async function HomePage() {
  let services: ServiceResponseDto[] = [];
  let config = DEFAULT_CONFIG;

  // 1. Fetch Active Services
  try {
    const servicesResponse = await getServicesAction(false);
    if (servicesResponse && 'data' in servicesResponse && servicesResponse.data) {
      services = servicesResponse.data;
    }
  } catch (err) {
    console.error('Failed to load services on landing page:', err);
  }

  // 2. Fetch Clinic Config
  try {
    const configResponse = await getClinicConfigAction();
    if (configResponse && 'data' in configResponse && configResponse.data) {
      config = configResponse.data;
    }
  } catch (err) {
    console.error('Failed to load clinic config on landing page:', err);
  }

  return (
    <LandingView
      services={services}
      config={config}
    />
  );
}
