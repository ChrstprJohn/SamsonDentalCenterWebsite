'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AppointmentSummaryCard } from './appointment-summary-card';
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
              className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-2 w-full">
                <span className="inline-flex self-start mb-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-500/10 text-amber-650 dark:text-amber-450 uppercase tracking-wide">
                  Awaiting Approval
                </span>
                <AppointmentSummaryCard appt={appt} />
              </div>
              <div className="flex justify-end border-t border-slate-100 dark:border-white/5 pt-4 mt-2">
                <Button variant="secondary" size="sm" onClick={() => onCancelClick(appt)}>
                  Cancel Request
                </Button>
              </div>
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
