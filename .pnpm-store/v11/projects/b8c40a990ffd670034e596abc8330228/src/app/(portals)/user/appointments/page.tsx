import React from 'react';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { getPatientAppointmentsAction } from '@/modules/appointments/actions/patient/get-patient-appointments.action';
import { PatientAppointmentsView } from '@/modules/appointments/views/patient-appointments-view';

export const metadata = {
  title: 'My Appointments | Samson Dental Center',
  description: 'View upcoming appointments, pending requests, and clinical visit history.',
};

export default async function PatientAppointmentsPage() {
  let maxReschedules = 1; // default fallback
  let appointments: any[] = [];

  try {
    const [configResponse, apptsResponse] = await Promise.all([
      getClinicConfigAction(),
      getPatientAppointmentsAction()
    ]);

    if (configResponse && 'data' in configResponse && configResponse.data) {
      maxReschedules = configResponse.data.maxReschedules;
    }
    
    if (apptsResponse && 'data' in apptsResponse && apptsResponse.data) {
      appointments = apptsResponse.data;
    }
  } catch (err) {
    console.error('Failed to load appointments data:', err);
  }

  return (
    <PatientAppointmentsView 
      initialAppointments={appointments}
      maxReschedules={maxReschedules} 
    />
  );
}
