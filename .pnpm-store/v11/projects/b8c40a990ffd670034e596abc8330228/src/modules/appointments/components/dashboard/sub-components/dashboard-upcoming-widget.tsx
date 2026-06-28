import React from 'react';
import { Button } from '@/components/ui/button';
import type { AppointmentDto } from '../../../dtos/exports';

interface DashboardUpcomingWidgetProps {
  nextAppointment: AppointmentDto | null;
  formatTime: (time: string) => string;
  onManageClick: () => void;
  onBookClick: () => void;
}

export function DashboardUpcomingWidget({
  nextAppointment,
  formatTime,
  onManageClick,
  onBookClick,
}: DashboardUpcomingWidgetProps) {
  return (
    <section className="lg:col-span-7 flex flex-col gap-4 text-left">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Next Upcoming Appointment</h3>
      {nextAppointment ? (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-lg flex flex-col justify-between gap-6 hover:shadow-xl transition-all duration-350">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  nextAppointment.status === 'APPROVED'
                    ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450'
                    : nextAppointment.status === 'RESCHEDULE_REQUESTED'
                    ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-450'
                    : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-450'
                }`}
              >
                {nextAppointment.status === 'RESCHEDULE_REQUESTED' ? 'Reschedule Requested' : nextAppointment.status}
              </span>
              <span className="text-[10px] text-slate-400">ID: #{nextAppointment.id.slice(0, 8)}</span>
            </div>
            <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">
              {nextAppointment.service?.name || 'Dental Service'}
            </h4>
            <div className="flex flex-col gap-1.5 text-xs text-slate-505 mt-1">
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
            <Button variant="secondary" size="sm" onClick={onManageClick}>
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
          <Button size="sm" onClick={onBookClick} className="mt-2">
            Book an Appointment
          </Button>
        </div>
      )}
    </section>
  );
}
