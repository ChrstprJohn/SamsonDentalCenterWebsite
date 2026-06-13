'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUserDashboardSummary } from '../hooks/dashboard/use-user-dashboard-summary';
import type { AppointmentDto } from '../dtos/shared/appointment.dto';
import { DashboardWelcomeBanner } from '../components/dashboard/sub-components/dashboard-welcome-banner';
import { DashboardUpcomingWidget } from '../components/dashboard/sub-components/dashboard-upcoming-widget';
import { DashboardRecentNotifications } from '../components/dashboard/sub-components/dashboard-recent-notifications';
import { DashboardQuickActions } from '../components/dashboard/sub-components/dashboard-quick-actions';

interface UserDashboardSummaryViewProps {
  appointments: AppointmentDto[];
  patientName: string;
}

export function UserDashboardSummaryView({ appointments, patientName }: UserDashboardSummaryViewProps) {
  const router = useRouter();
  const { nextAppointment, recentNotifications, formatTime } = useUserDashboardSummary(appointments);

  return (
    <div className="flex flex-col gap-10 text-left">
      <DashboardWelcomeBanner patientName={patientName} />

      {/* Main Grid: Next Appointment + Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <DashboardUpcomingWidget
          nextAppointment={nextAppointment}
          formatTime={formatTime}
          onManageClick={() => router.push('/user/appointments')}
          onBookClick={() => router.push('/booking')}
        />

        <DashboardRecentNotifications
          recentNotifications={recentNotifications}
          onViewAllClick={() => router.push('/user/notifications')}
        />
      </div>

      <DashboardQuickActions
        onBookClick={() => router.push('/booking')}
        onAppointmentsClick={() => router.push('/user/appointments')}
        onSettingsClick={() => router.push('/user/settings')}
      />
    </div>
  );
}
