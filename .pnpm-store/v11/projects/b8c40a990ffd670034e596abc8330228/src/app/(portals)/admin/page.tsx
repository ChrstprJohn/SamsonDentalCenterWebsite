import React from 'react';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { AdminDashboardView } from '@/modules/staff/views/admin-dashboard-view';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

export const metadata = {
  title: 'Clinic Administration | System config Portal',
  description: 'Manage rosters, configure operating hours weekday schedules, rescheduling caps, same-day rules, and audits.',
};

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

export default async function AdminDashboardPage() {
  let config = DEFAULT_CONFIG;

  try {
    const configResponse = await getClinicConfigAction();
    if (configResponse && 'data' in configResponse && configResponse.data) {
      config = configResponse.data;
    }
  } catch (err) {
    console.error('Failed to load clinic configurations on admin dashboard:', err);
  }

  return (
    <AdminDashboardView initialConfig={config} />
  );
}
