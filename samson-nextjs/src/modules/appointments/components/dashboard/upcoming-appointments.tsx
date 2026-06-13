'use client';

import React from 'react';
import { AppointmentTeaserCard } from './appointment-teaser-card';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface UpcomingAppointmentsProps {
  scheduled: AppointmentDto[];
  maxReschedules: number;
}

export function UpcomingAppointments({
  scheduled,
  maxReschedules,
}: UpcomingAppointmentsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Upcoming Reservations</h3>
      {scheduled.length > 0 ? (
        <div className="flex flex-col gap-4">
          {scheduled.map((appt) => (
            <AppointmentTeaserCard key={appt.id} appt={appt} />
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
