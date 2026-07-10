import React from 'react';
import { notFound } from 'next/navigation';
import { AppointmentDetailView } from '@/modules/appointments/views/appointment-detail-view';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { getAppointmentByIdAction } from '@/modules/appointments/actions/patient/get-appointment-by-id.action';
import type { AppointmentDto } from '@/modules/appointments/dtos/exports';

export const metadata = {
  title: 'Patient Dashboard V2 | Samson Dental Center',
  description: 'Manage upcoming appointments, track pending booking requests, and view clinical history records.',
};

interface PageProps {
  searchParams: Promise<{ apptId?: string }>;
}

export default async function UserV2DashboardPage({ searchParams }: PageProps) {
  const { apptId } = await searchParams;

  if (!apptId) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 min-h-[50vh] items-center justify-center text-sm text-muted-foreground animate-in fade-in duration-300">
        Please select an appointment from the sidebar to view details.
      </div>
    );
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(apptId);

  if (!isUuid) {
    notFound();
  }

  // Fetch clinic config and appointment data concurrently
  const [configResponse, apptRes] = await Promise.all([
    getClinicConfigAction().catch((err) => {
      console.error('Failed to load clinic config:', err);
      return null;
    }),
    getAppointmentByIdAction(apptId).catch((err) => {
      console.warn(`Could not fetch appointment with id ${apptId} from database:`, err);
      return { success: false, error: err?.message, data: null };
    }),
  ]);

  let maxReschedules = 1;
  if (configResponse && 'data' in configResponse && configResponse.data) {
    maxReschedules = configResponse.data.maxReschedules;
  }

  if (!apptRes || !apptRes.success || !apptRes.data) {
    console.warn(`getAppointmentByIdAction failed to fetch: ${apptRes?.error}`);
    notFound();
  }

  const appt: AppointmentDto = apptRes.data;

  return <AppointmentDetailView appt={appt} maxReschedules={maxReschedules} />;
}
