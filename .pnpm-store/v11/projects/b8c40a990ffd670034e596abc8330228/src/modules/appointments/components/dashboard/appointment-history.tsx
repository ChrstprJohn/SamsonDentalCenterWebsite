'use client';

import React from 'react';
import { AppointmentTeaserCard } from './appointment-teaser-card';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface AppointmentHistoryProps {
  history: AppointmentDto[];
}

export function AppointmentHistory({ history }: AppointmentHistoryProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Appointment History</h3>
      {history.length > 0 ? (
        <div className="flex flex-col gap-4">
          {history.map((appt) => (
            <AppointmentTeaserCard key={appt.id} appt={appt} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-white/5 rounded-3xl text-sm text-slate-400">
          No history logs found.
        </div>
      )}
    </section>
  );
}
