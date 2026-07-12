import React from 'react';
import { SecretaryDashboardView } from '@/modules/staff/views/secretary-dashboard-view';

export const metadata = {
  title: 'Secretary Dashboard | Samson Dental Center',
  description: 'Manage booking queues, batched family groups, arrivals check-in, dynamic checkout invoice receipts, and audits.',
};

export default function SecretaryDashboardPage() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8">
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-8">
        <SecretaryDashboardView basePath="/secretary-v2" />
      </div>
    </div>
  );
}
