import React from 'react';
import { getServicesUseCase } from '@/modules/services/use-cases/management/get-services.use-case';
import { getServicesQuery } from '@/modules/services/repositories/management/service.queries';
import { createClient } from '@/shared/database/server';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { BookingView } from '@/modules/appointments/views/booking-view';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { getPatientProfileAction } from '@/modules/patients/actions/profile/get-patient-profile.action';
import { getUserDependentsAction } from '@/modules/patients/actions/dependents/get-user-dependents.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { getAppointmentByIdQuery } from '@/modules/appointments/repositories/exports';

export const metadata = {
  title: 'Book Appointment | Patient Portal',
  description: 'Select services, book dates, and schedule clinical dental treatment appointments online at Samson Dental Center.',
};

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  let services: ServiceResponseDto[] = [];
  let clinicConfig = null;
  let userProfile: any = null;
  let userDependents: any[] = [];
  let reschedulingAppointment: any = null;

  const params = await searchParams;
  const rescheduleId = typeof params.reschedule === 'string' ? params.reschedule : undefined;

  try {
    const supabase = await createClient();
    const query = getServicesQuery(supabase);
    const useCase = getServicesUseCase(query);

    const [servicesRes, configRes] = await Promise.all([
      useCase(false),
      getClinicConfigAction()
    ]);
    
    if (servicesRes) {
      services = servicesRes;
    }
    
    if (configRes && 'data' in configRes && configRes.data) {
      clinicConfig = configRes.data;
    }

    const user = await getAuthenticatedUser();
    if (user) {
      const [profileRes, dependentsRes] = await Promise.all([
        getPatientProfileAction(),
        getUserDependentsAction(user.id)
      ]);

      if (profileRes.success && profileRes.data) {
        userProfile = profileRes.data;
      }
      if (dependentsRes.success && dependentsRes.data) {
        userDependents = dependentsRes.data;
      }

      if (rescheduleId) {
        const getAppointmentById = getAppointmentByIdQuery(supabase);
        try {
          reschedulingAppointment = await getAppointmentById(rescheduleId);
        } catch (err) {
          console.error(`Failed to fetch rescheduling appointment ${rescheduleId}:`, err);
        }
      }
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
      <BookingView 
        services={services} 
        userProfile={userProfile} 
        userDependents={userDependents} 
        reschedulingAppointment={reschedulingAppointment}
        clinicConfig={clinicConfig}
      />
    </main>
  );
}
