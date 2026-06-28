import React from 'react';
import { NotificationsView } from '@/modules/patients/components/notifications/notifications-view';

export const metadata = {
  title: 'Notifications Center | Samson Dental Center',
  description: 'View and manage your in-app notifications and alerts.',
};

export default function NotificationsPage() {
  return <NotificationsView />;
}
