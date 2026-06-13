import React from 'react';
import { notFound } from 'next/navigation';
import { AppointmentDetailView } from '@/modules/appointments/views/appointment-detail-view';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
// In a real app we'd fetch from an API by ID. 
// For now, we mock the retrieval by finding it in MOCK_APPOINTMENTS
import { MOCK_APPOINTMENTS } from '@/modules/appointments/dtos/shared/mock-appointments';

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

  // Simulate finding appointment by ID
  const appt = MOCK_APPOINTMENTS.find((a) => a.id === id);

  if (!appt) {
    notFound();
  }

  return <AppointmentDetailView appt={appt} maxReschedules={maxReschedules} />;
}
