'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface PendingApprovalsProps {
  pending: AppointmentDto[];
  onCancelClick: (appt: AppointmentDto) => void;
}

export function PendingApprovals({ pending, onCancelClick }: PendingApprovalsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Awaiting Secretary Approvals</h3>
      {pending.length > 0 ? (
        <div className="flex flex-col gap-4">
          {pending.map((appt) => (
            <div
              key={appt.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-1">
                <span className="inline-flex self-start px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-150/10 text-amber-600 dark:text-amber-450 uppercase tracking-wide">
                  Awaiting Approval
                </span>
                <h4 className="text-base font-bold text-slate-800 dark:text-white mt-1">
                  {appt.service?.name || 'Unknown Service'}
                </h4>
                <p className="text-xs text-slate-550 dark:text-slate-400">
                  📅 {appt.date} at {appt.startTime} with Dr. {appt.doctor?.lastName}
                </p>
              </div>
              <Button variant="secondary" size="sm" className="sm:self-center" onClick={() => onCancelClick(appt)}>
                Cancel Request
              </Button>
            </div>
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
