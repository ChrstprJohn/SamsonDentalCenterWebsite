import React from 'react';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { createClient } from '@/shared/database/server';
import { LandingView } from '@/modules/patients/views/landing-view';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

const DEFAULT_CONFIG: ClinicConfigResponseDto = {
  isBookingOpen: true,
  maintenanceMessage: null,
  maxReschedules: 1,
  clinicName: 'Samson Dental Center',
  address: '123 Dental Way, Suite A',
  phone: '(555) 0101',
  email: 'contact@samsondental.com',
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
  let isAuthenticated = false;

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

  // 3. Inspect Session State
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  } catch (err) {
    console.error('Failed to resolve active session state on landing page:', err);
  }

  return (
    <LandingView
      services={services}
      config={config}
      isAuthenticated={isAuthenticated}
    />
  );
}
