'use client';

import { useState, useMemo } from 'react';
import type { DashboardNotification } from '../../../appointments/hooks/dashboard/use-user-dashboard-summary';

const INITIAL_MOCK_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: 'n-1',
    title: 'Appointment Confirmed',
    description: 'Your Orthodontic Consultation request for June 24 at 10:00 AM has been approved.',
    createdAt: '2026-06-13T10:00:00Z',
    isUnread: true,
    type: 'appointment',
  },
  {
    id: 'n-2',
    title: 'Fill Profile Details',
    description: 'Please upload a profile photo and complete your contact information under Settings.',
    createdAt: '2026-06-12T14:30:00Z',
    isUnread: true,
    type: 'system',
  },
  {
    id: 'n-3',
    title: 'Roster Schedule Update',
    description: 'Dr. Samson is unavailable on June 30 due to a dental conference. Affected appointments will be rescheduled.',
    createdAt: '2026-06-11T09:15:00Z',
    isUnread: false,
    type: 'system',
  },
  {
    id: 'n-4',
    title: 'Treatment Plan Created',
    description: 'Dr. Samson submitted your whitening treatment session record. View the draft invoice in your history.',
    createdAt: '2026-06-10T16:45:00Z',
    isUnread: false,
    type: 'appointment',
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<DashboardNotification[]>(INITIAL_MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'unread') return n.isUnread;
      if (activeTab === 'read') return !n.isUnread;
      return true;
    });
  }, [notifications, activeTab]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.isUnread).length;
  }, [notifications]);

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: !n.isUnread } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const formatDistanceToNow = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  };

  return {
    activeTab,
    setActiveTab,
    notifications: filteredNotifications,
    unreadCount,
    toggleReadStatus,
    deleteNotification,
    markAllAsRead,
    formatDistanceToNow,
  };
}
