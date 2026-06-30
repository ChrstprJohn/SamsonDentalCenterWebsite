'use client';

import { useMemo, useState } from 'react';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

export interface DashboardNotification {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  isUnread: boolean;
  type: 'appointment' | 'reminder' | 'system';
}

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
];

import { formatTimeString } from '@/shared/utils/date.util';

export function useUserDashboardSummary(appointments: AppointmentDto[]) {
  const [notifications] = useState<DashboardNotification[]>(INITIAL_MOCK_NOTIFICATIONS);

  // Get next active appointment (closest future date)
  const nextAppointment = useMemo(() => {
    const now = new Date();
    const upcoming = appointments.filter((appt) => {
      if (appt.status === 'CANCELLED' || appt.status === 'REJECTED') return false;
      const apptDate = new Date(`${appt.date}T${appt.startTime || '00:00'}`);
      return apptDate >= now;
    });

    if (upcoming.length === 0) return null;

    // Sort by scheduled date/time ascending
    return upcoming.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.startTime || '00:00'}`);
      return dateA.getTime() - dateB.getTime();
    })[0];
  }, [appointments]);

  // Format helper for UI
  const formatTime = formatTimeString;

  return {
    nextAppointment,
    recentNotifications: notifications.slice(0, 3),
    formatTime,
  };
}
