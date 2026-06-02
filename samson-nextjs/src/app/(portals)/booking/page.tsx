import React from 'react';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { BookingView } from '@/modules/appointments/views/booking-view';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

export const metadata = {
  title: 'Book Appointment | Patient Portal',
  description: 'Select services, book dates, and schedule clinical dental treatment appointments online at Samson Dental Center.',
};

export default async function BookingPage() {
  let services: ServiceResponseDto[] = [];
  let clinicConfig = null;

  try {
    const [servicesRes, configRes] = await Promise.all([
      getServicesAction(false),
      getClinicConfigAction()
    ]);
    
    if (servicesRes && 'data' in servicesRes && servicesRes.data) {
      services = servicesRes.data;
    }
    if (configRes && 'data' in configRes && configRes.data) {
      clinicConfig = configRes.data;
    }
  } catch (err) {
    console.error('Failed to load data on booking portal page:', err);
  }

  const isBookingOpen = clinicConfig?.isBookingOpen ?? true;
  const maintenanceMessage = clinicConfig?.maintenanceMessage || 'Online booking is temporarily disabled. Please contact the clinic directly to schedule an appointment.';

  if (!isBookingOpen) {
    return (
      <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background to-secondary-bg min-h-[80vh]">
        <div className="w-full max-w-xl p-10 rounded-3xl border border-card-border bg-card/75 backdrop-blur-2xl shadow-2xl text-center flex flex-col gap-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-3xl">
            🛑
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold text-text-primary">Booking Currently Closed</h1>
            <p className="text-text-secondary">
              {maintenanceMessage}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background to-secondary-bg min-h-[80vh]">
      <BookingView services={services} />
    </main>
  );
}
