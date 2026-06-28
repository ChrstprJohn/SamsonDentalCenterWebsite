'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUserDashboard } from '../hooks/dashboard/use-user-dashboard';
import { UpcomingAppointments } from '../components/dashboard/upcoming-appointments';
import { PendingApprovals } from '../components/dashboard/pending-approvals';
import { AppointmentHistory } from '../components/dashboard/appointment-history';
import { PatientAppointmentsTabs } from './sub-components/patient-appointments-tabs';
import type { AppointmentDto } from '../dtos/shared/appointment.dto';

interface PatientAppointmentsViewProps {
  initialAppointments: AppointmentDto[];
  maxReschedules: number;
}

type TabType = 'upcoming' | 'pending' | 'history';

export function PatientAppointmentsView({ initialAppointments, maxReschedules }: PatientAppointmentsViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  const {
    scheduled,
    pending,
    history,
    filterValue,
    setFilterValue,
    filterOptions,
  } = useUserDashboard(initialAppointments, maxReschedules);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary">My Appointments</h2>
          <p className="text-xs text-text-muted">Track your pending requests, view upcoming schedules, and look through your dental visit history.</p>
        </div>
        <Button onClick={() => router.push('/booking')} className="shadow-md hover:shadow-lg transition-all shrink-0">
          + New Booking
        </Button>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col gap-6">
        <PatientAppointmentsTabs
          activeTab={activeTab}
          scheduledCount={scheduled.length}
          pendingCount={pending.length}
          historyCount={history.length}
          filterValue={filterValue}
          filterOptions={filterOptions}
          onTabChange={setActiveTab}
          onFilterChange={setFilterValue}
        />

        {/* Tab Panels */}
        <div className="min-h-[400px]">
          {activeTab === 'upcoming' && (
            <UpcomingAppointments 
              scheduled={scheduled} 
              maxReschedules={maxReschedules}
            />
          )}

          {activeTab === 'pending' && (
            <PendingApprovals 
              pending={pending}
            />
          )}

          {activeTab === 'history' && (
            <AppointmentHistory history={history} />
          )}
        </div>
      </div>
    </div>
  );
}
