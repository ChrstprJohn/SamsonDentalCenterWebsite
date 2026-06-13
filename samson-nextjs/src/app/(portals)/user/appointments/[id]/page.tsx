import React from 'react';
import { notFound } from 'next/navigation';
import { AppointmentDetailView } from '@/modules/appointments/views/appointment-detail-view';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { MOCK_APPOINTMENTS } from '@/modules/appointments/dtos/shared/mock-appointments';
import { createClient } from '@/shared/database/server';
import { getAppointmentByIdQuery } from '@/modules/appointments/repositories';
import { AppointmentDto } from '@/modules/appointments/dtos';

export const metadata = {
  title: 'Appointment Details | Samson Dental Center',
  description: 'View full details of your appointment request.',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AppointmentDetailPage({ params }: PageProps) {
  let maxReschedules = 1;

  try {
    const configResponse = await getClinicConfigAction();
    if (configResponse && 'data' in configResponse && configResponse.data) {
      maxReschedules = configResponse.data.maxReschedules;
    }
  } catch (err) {
    console.error('Failed to load clinic config:', err);
  }

  const { id } = await params;

  // Find appointment: check DB first if it looks like a UUID, otherwise check mock data
  let appt: AppointmentDto | undefined;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  if (isUuid) {
    try {
      const supabase = await createClient();
      const getAppointmentById = getAppointmentByIdQuery(supabase);
      appt = await getAppointmentById(id);
    } catch (err) {
      console.warn(`Could not fetch appointment with id ${id} from database, attempting fallback:`, err);
    }
  }

  // Fallback to mock data if database fetch did not succeed or was skipped
  if (!appt) {
    appt = MOCK_APPOINTMENTS.find((a) => a.id === id);
  }

  if (!appt) {
    notFound();
  }

  return <AppointmentDetailView appt={appt} maxReschedules={maxReschedules} />;
}
