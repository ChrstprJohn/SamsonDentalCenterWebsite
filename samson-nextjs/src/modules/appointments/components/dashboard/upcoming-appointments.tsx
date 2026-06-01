'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface UpcomingAppointmentsProps {
  scheduled: AppointmentDto[];
  maxReschedules: number;
  onCancelClick: (appt: AppointmentDto) => void;
  onRescheduleClick: (appt: AppointmentDto) => void;
}

export function UpcomingAppointments({
  scheduled,
  maxReschedules,
  onCancelClick,
  onRescheduleClick,
}: UpcomingAppointmentsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Upcoming Reservations</h3>
      {scheduled.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scheduled.map((appt) => (
            <div
              key={appt.id}
              className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-lg flex flex-col justify-between gap-6 hover:shadow-xl transition-all duration-350"
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-650 dark:text-emerald-450 uppercase tracking-wide">
                    Scheduled
                  </span>
                  <span className="text-[10px] text-slate-400">Reschedules: {appt.rescheduleCount}/{maxReschedules}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mt-1">
                  {appt.service?.name || 'Unknown Service'}
                </h4>
                <p className="text-xs text-slate-500">
                  👨‍⚕️ Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                </p>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-2">
                  ⏳ {appt.date} at {appt.startTime}
                </p>
              </div>
              <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-white/5 pt-4">
                <Button variant="secondary" size="sm" onClick={() => onCancelClick(appt)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => onRescheduleClick(appt)}>
                  Reschedule
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-slate-200 dark:border-white/5 rounded-3xl text-sm text-slate-400">
          No scheduled reservations found.
        </div>
      )}
    </section>
  );
}
