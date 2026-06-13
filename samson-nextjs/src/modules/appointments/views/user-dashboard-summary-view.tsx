'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUserDashboardSummary } from '../hooks/dashboard/use-user-dashboard-summary';
import type { AppointmentDto } from '../dtos/shared/appointment.dto';

interface UserDashboardSummaryViewProps {
  appointments: AppointmentDto[];
  patientName: string;
}

export function UserDashboardSummaryView({ appointments, patientName }: UserDashboardSummaryViewProps) {
  const router = useRouter();
  const { nextAppointment, recentNotifications, formatTime } = useUserDashboardSummary(appointments);

  return (
    <div className="flex flex-col gap-10">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-700/80 dark:to-violet-800/80 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_70%)] pointer-events-none" />
        <div className="flex flex-col gap-2 relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome back, {patientName}!</h2>
          <p className="text-sm text-blue-100/90 max-w-xl leading-relaxed">
            Welcome to your patient portal. Easily view details, make booking requests, manage your schedules, and track your clinical notifications.
          </p>
        </div>
      </div>

      {/* Main Grid: Next Appointment + Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Next Appointment Widget */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Next Upcoming Appointment</h3>
          {nextAppointment ? (
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-lg flex flex-col justify-between gap-6 hover:shadow-xl transition-all duration-350">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    nextAppointment.status === 'APPROVED'
                      ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450'
                      : nextAppointment.status === 'RESCHEDULE_REQUESTED'
                      ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-450'
                      : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-450'
                  }`}>
                    {nextAppointment.status === 'RESCHEDULE_REQUESTED' ? 'Reschedule Requested' : nextAppointment.status}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ID: #{nextAppointment.id.slice(0, 8)}
                  </span>
                </div>
                <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">
                  {nextAppointment.service?.name || 'Dental Service'}
                </h4>
                <div className="flex flex-col gap-1.5 text-xs text-slate-500 mt-1">
                  <p className="flex items-center gap-2">
                    <span>👨‍⚕️</span>
                    <span className="font-medium">
                      Dr. {nextAppointment.doctor?.firstName} {nextAppointment.doctor?.lastName}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mt-2">
                    <span>📅</span>
                    <span>
                      {nextAppointment.date} at {formatTime(nextAppointment.startTime)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-white/5 pt-4">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => router.push('/user/appointments')}
                >
                  Manage Reservation
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 dark:border-white/5 rounded-3xl text-center gap-4 bg-slate-50/50 dark:bg-slate-900/10">
              <span className="text-3xl">📅</span>
              <div className="flex flex-col gap-1 max-w-xs">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No upcoming appointments</p>
                <p className="text-xs text-slate-400">You do not have any scheduled reservations at the moment.</p>
              </div>
              <Button size="sm" onClick={() => router.push('/booking')} className="mt-2">
                Book an Appointment
              </Button>
            </div>
          )}
        </section>

        {/* Recent Notifications Widget */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recent Notifications</h3>
            <button 
              onClick={() => router.push('/user/notifications')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="flex flex-col gap-3.5">
            {recentNotifications.map((notif) => (
              <div 
                key={notif.id}
                className="p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-sm flex items-start gap-3 hover:shadow-md transition-all duration-200"
              >
                <div className="text-lg p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                  {notif.type === 'appointment' ? '📅' : '📢'}
                </div>
                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {notif.title}
                    </h4>
                    {notif.isUnread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-450 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {notif.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Quick Action Shortcuts */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/booking')}
            className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-md hover:shadow-lg hover:border-blue-500/50 dark:hover:border-blue-500/30 text-left transition-all duration-300 group flex flex-col gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform duration-200">
              ➕
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-base">Book Appointment</h4>
              <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 leading-relaxed">Schedule a new visit or consultation slot with our specialists.</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/user/appointments')}
            className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-md hover:shadow-lg hover:border-indigo-500/50 dark:hover:border-indigo-500/30 text-left transition-all duration-300 group flex flex-col gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-450 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform duration-200">
              📅
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-base">My Appointments</h4>
              <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 leading-relaxed">Manage approved bookings, track status changes, and view history.</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/user/settings')}
            className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-md hover:shadow-lg hover:border-violet-500/50 dark:hover:border-violet-500/30 text-left transition-all duration-300 group flex flex-col gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-650 dark:text-violet-400 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform duration-200">
              ⚙️
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-base">Account Settings</h4>
              <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 leading-relaxed">Update your details, customize avatar, and adjust alerts.</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
