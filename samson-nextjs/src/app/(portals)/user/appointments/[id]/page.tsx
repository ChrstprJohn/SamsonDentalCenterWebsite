import React from 'react';
import { notFound } from 'next/navigation';
import { AppointmentDetailView } from '@/modules/appointments/views/appointment-detail-view';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { AppointmentDto } from '@/modules/appointments/dtos';
import { getAppointmentByIdAction } from '@/modules/appointments/actions/patient/get-appointment-by-id.action';

export const metadata = {
  title: 'Appointment Details | Samson Dental Center',
  description: 'View full details of your appointment request.',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AppointmentDetailPage({ params }: PageProps) {
  const { id } = await params;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  if (!isUuid) {
    notFound();
  }

  // Fetch clinic config and appointment data concurrently
  const [configResponse, apptRes] = await Promise.all([
    getClinicConfigAction().catch((err) => {
      console.error('Failed to load clinic config:', err);
      return null;
    }),
    getAppointmentByIdAction(id).catch((err) => {
      console.warn(`Could not fetch appointment with id ${id} from database:`, err);
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
