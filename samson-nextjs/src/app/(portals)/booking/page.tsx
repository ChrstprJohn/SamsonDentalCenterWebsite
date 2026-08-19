import React from 'react';
import { getServicesUseCase } from '@/modules/services/use-cases/management/get-services.use-case';
import { getServicesQuery } from '@/modules/services/repositories/management/service.queries';
import { createClient } from '@/shared/database/server';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { BookingView } from '@/modules/appointments/views/booking-view';
import { Phone, Mail, Ban } from 'lucide-react';
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

  if (!isBookingOpen) {
    return (
      <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background to-secondary-bg min-h-[80vh]">
        <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl border border-card-border bg-card/75 backdrop-blur-2xl shadow-2xl text-center flex flex-col gap-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#D94E4E]/10 flex items-center justify-center text-[#D94E4E]">
            <Ban className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold text-text-primary">Online appointment requests are currently unavailable</h1>
            <p className="text-sm text-text-secondary">Sorry for the inconvenience. To schedule an appointment, please reach us through any of the following:</p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <a href={`tel:${clinicConfig?.phone}`} className="flex items-center justify-center gap-2 rounded-xl border border-card-border bg-card px-4 py-3 text-text-primary hover:border-[#D94E4E]/50 hover:text-[#D94E4E] transition-colors">
              <Phone className="w-4 h-4 text-[#D94E4E]" />
              {clinicConfig?.phone.replace(/^\+63\s*/, '0')}
            </a>
            {clinicConfig?.landline && (
              <a href={`tel:${clinicConfig.landline}`} className="flex items-center justify-center gap-2 rounded-xl border border-card-border bg-card px-4 py-3 text-text-primary hover:border-[#D94E4E]/50 hover:text-[#D94E4E] transition-colors">
                <Phone className="w-4 h-4 text-[#D94E4E]" />
                {clinicConfig.landline}
              </a>
            )}
            <a href={`mailto:${clinicConfig?.email}`} className="flex items-center justify-center gap-2 rounded-xl border border-card-border bg-card px-4 py-3 text-text-primary hover:border-[#D94E4E]/50 hover:text-[#D94E4E] transition-colors">
              <Mail className="w-4 h-4 text-[#D94E4E]" />
              {clinicConfig?.email}
            </a>
          </div>
          <a href="/" className="inline-block w-full rounded-xl bg-text-primary px-6 py-3 text-sm font-semibold tracking-wider text-background hover:bg-[#D94E4E] transition-colors">
            Return to Home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background to-secondary-bg min-h-[80vh]">
      <React.Suspense fallback={<div className="text-center text-sm text-text-muted">Loading booking portal...</div>}>
        <BookingView 
          services={services} 
          userProfile={userProfile} 
          userDependents={userDependents} 
          reschedulingAppointment={reschedulingAppointment}
          clinicConfig={clinicConfig}
        />
      </React.Suspense>
    </main>
  );
}
