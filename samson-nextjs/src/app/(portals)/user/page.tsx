import React from 'react';
import { createClient } from '@/shared/database/server';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { getPatientAppointmentsAction } from '@/modules/appointments/actions/patient/get-patient-appointments.action';
import { UserDashboardSummaryView } from '@/modules/appointments/views/user-dashboard-summary-view';

export const metadata = {
  title: 'Patient Dashboard | Samson Dental Center',
  description: 'Manage upcoming appointments, track pending booking requests, and view clinical history records.',
};

export default async function UserDashboardPage() {
  let appointments: any[] = [];
  let patientName = 'Patient';

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      patientName = user.user_metadata?.first_name || user.user_metadata?.firstName || 'Patient';
    }

    const apptsResponse = await getPatientAppointmentsAction();
    if (apptsResponse && 'data' in apptsResponse && apptsResponse.data) {
      appointments = apptsResponse.data;
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  }

  return (
    <UserDashboardSummaryView 
      appointments={appointments}
      patientName={patientName}
    />
  );
}
