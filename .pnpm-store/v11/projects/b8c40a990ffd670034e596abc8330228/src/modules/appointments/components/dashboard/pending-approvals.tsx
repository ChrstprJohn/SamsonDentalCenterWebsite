'use client';

import React from 'react';
import { AppointmentTeaserCard } from './appointment-teaser-card';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface PendingApprovalsProps {
  pending: AppointmentDto[];
}

export function PendingApprovals({ pending }: PendingApprovalsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Awaiting Secretary Approvals</h3>
      {pending.length > 0 ? (
        <div className="flex flex-col gap-4">
          {pending.map((appt) => (
            <AppointmentTeaserCard key={appt.id} appt={appt} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-slate-200 dark:border-white/5 rounded-3xl text-sm text-slate-400">
          No pending requests awaiting approval.
        </div>
      )}
    </section>
  );
}
