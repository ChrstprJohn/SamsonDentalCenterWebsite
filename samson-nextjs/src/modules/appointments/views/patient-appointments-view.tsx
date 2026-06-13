'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUserDashboard } from '../hooks/dashboard/use-user-dashboard';
import { UpcomingAppointments } from '../components/dashboard/upcoming-appointments';
import { PendingApprovals } from '../components/dashboard/pending-approvals';
import { AppointmentHistory } from '../components/dashboard/appointment-history';
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
        <div className="flex flex-col md:flex-row md:justify-between border-b border-slate-200 dark:border-white/10 gap-4 md:gap-6">
          <div className="flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-3.5 px-1 relative text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'text-slate-900 dark:text-white font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Upcoming
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'upcoming'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {scheduled.length}
            </span>
            {activeTab === 'upcoming' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`py-3.5 px-1 relative text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'text-slate-900 dark:text-white font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Pending Requests
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {pending.length}
            </span>
            {activeTab === 'pending' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3.5 px-1 relative text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'text-slate-900 dark:text-white font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            History
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'history'
                ? 'bg-slate-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {history.length}
            </span>
            {activeTab === 'history' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-500 dark:bg-slate-400 rounded-full" />
            )}
          </button>
          </div>

          <div className="flex items-center gap-2 pb-2 md:pb-0 shrink-0">
            <label htmlFor="patient-filter" className="text-xs font-semibold text-slate-500">Filter:</label>
            <select
              id="patient-filter"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg px-3 py-1.5 border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              {filterOptions.map((option) => (
                <option key={option.id} value={option.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

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
