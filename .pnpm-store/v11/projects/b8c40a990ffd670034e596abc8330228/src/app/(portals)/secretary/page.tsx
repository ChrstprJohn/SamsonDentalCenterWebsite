import React from 'react';
import { SecretaryDashboardView } from '@/modules/staff/views/secretary-dashboard-view';

export const metadata = {
  title: 'Secretary Dashboard | Samson Dental Center',
  description: 'Manage booking queues, batched family groups, arrivals check-in, dynamic checkout invoice receipts, and audits.',
};

export default function SecretaryDashboardPage() {
  return (
    <SecretaryDashboardView />
  );
}
