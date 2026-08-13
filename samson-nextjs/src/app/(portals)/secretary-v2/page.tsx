import React from 'react';
import { SecretaryOverviewView } from '@/modules/staff/views/secretary/secretary-overview-view';

export const metadata = {
  title: 'Overview | Samson Dental Center',
  description: 'Secretary command center — live stats, today\'s schedule, and quick navigation to every module.',
};

export default function SecretaryDashboardPage() {
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <SecretaryOverviewView />
    </div>
  );
}
