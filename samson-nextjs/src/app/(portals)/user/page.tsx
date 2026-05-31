import React from 'react';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { UserDashboardView } from '@/modules/appointments/views/user-dashboard-view';

export const metadata = {
  title: 'Patient Dashboard | Samson Dental Center',
  description: 'Manage upcoming appointments, track pending booking requests, and view clinical history records.',
};

export default async function UserDashboardPage() {
  let maxReschedules = 1; // standard default fallback

  try {
    const configResponse = await getClinicConfigAction();
    if (configResponse && 'data' in configResponse && configResponse.data) {
      maxReschedules = configResponse.data.maxReschedules;
    }
  } catch (err) {
    console.error('Failed to load clinic reschedule limits on dashboard:', err);
  }

  return (
    <UserDashboardView maxReschedules={maxReschedules} />
  );
}
