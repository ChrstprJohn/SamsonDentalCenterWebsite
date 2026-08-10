import React from 'react';
import { ClinicSettingsPageLoader } from '@/modules/staff/views/clinic-settings-page-loader';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Clinic Settings | Secretary Portal',
  description: 'Manage public clinic information and booking rules.',
};

export default function SecretaryClinicSettingsPage() {
  return <ClinicSettingsPageLoader />;
}
