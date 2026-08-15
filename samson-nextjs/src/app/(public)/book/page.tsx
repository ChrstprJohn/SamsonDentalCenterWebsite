import React from 'react';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { BookingWizardView } from '@/modules/patients/views/booking-wizard-view';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

const DEFAULT_CONFIG: ClinicConfigResponseDto = {
  isBookingOpen: true,
  maintenanceMessage: null,
  maxReschedules: 1,
  clinicName: 'Samson Dental Center',
  websiteLogoUrl: null,
  websiteLogoDarkUrl: null,
  emailLogoUrl: null,
  emailLogoDarkUrl: null,
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

interface BookPageProps {
  searchParams: Promise<{ serviceId?: string }>;
}

export default async function BookPage({ searchParams }: BookPageProps) {
  const resolvedSearchParams = await searchParams;
  let services: ServiceResponseDto[] = [];
  let config = DEFAULT_CONFIG;

  try {
    const servicesResponse = await getServicesAction(false);
    if (servicesResponse && 'data' in servicesResponse && servicesResponse.data) {
      services = servicesResponse.data;
    }
  } catch (err) {
    console.error('Failed to load services on booking page:', err);
  }

  try {
    const configResponse = await getClinicConfigAction();
    if (configResponse && 'data' in configResponse && configResponse.data) {
      config = configResponse.data;
    }
  } catch (err) {
    console.error('Failed to load clinic config on booking page:', err);
  }

  return (
    <BookingWizardView
      services={services}
      config={config}
      initialServiceId={resolvedSearchParams.serviceId}
    />
  );
}
