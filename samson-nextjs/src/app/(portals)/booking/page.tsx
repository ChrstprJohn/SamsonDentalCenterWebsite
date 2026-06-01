import React from 'react';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { BookingView } from '@/modules/appointments/views/booking-view';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

export const metadata = {
  title: 'Book Appointment | Patient Portal',
  description: 'Select services, book dates, and schedule clinical dental treatment appointments online at Samson Dental Center.',
};

export default async function BookingPage() {
  let services: ServiceResponseDto[] = [];

  try {
    const response = await getServicesAction(false);
    if (response && 'data' in response && response.data) {
      services = response.data;
    }
  } catch (err) {
    console.error('Failed to load services on booking portal page:', err);
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-905 dark:to-slate-950 min-h-[80vh]">
      <BookingView services={services} />
    </main>
  );
}
