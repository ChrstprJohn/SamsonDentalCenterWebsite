import React from 'react';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { getPatientAppointmentsAction } from '@/modules/appointments/actions/patient/get-patient-appointments.action';
import { UserDashboardView } from '@/modules/appointments/views/user-dashboard-view';

export const metadata = {
  title: 'Patient Dashboard | Samson Dental Center',
  description: 'Manage upcoming appointments, track pending booking requests, and view clinical history records.',
};

export default async function UserDashboardPage() {
  let maxReschedules = 1; // standard default fallback
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
    console.error('Failed to load dashboard data:', err);
  }

  return (
    <UserDashboardView 
      initialAppointments={appointments}
      maxReschedules={maxReschedules} 
    />
  );
}
