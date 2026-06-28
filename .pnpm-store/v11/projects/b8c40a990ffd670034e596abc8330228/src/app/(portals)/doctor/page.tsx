import React from 'react';
import { DoctorDashboardView } from '@/modules/staff/views/doctor-dashboard-view';

export const metadata = {
  title: 'Doctor Operatory Dashboard | Samson Dental Center',
  description: 'Monitor daily patient queues, retrieve read-only clinical timeline charts, and record completed treatments.',
};

export default function DoctorDashboardPage() {
  return (
    <DoctorDashboardView />
  );
}
