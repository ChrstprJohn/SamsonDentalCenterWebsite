'use client';

import React from 'react';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface AppointmentHistoryProps {
  history: AppointmentDto[];
}

export function AppointmentHistory({ history }: AppointmentHistoryProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450';
      case 'CANCELLED':
        return 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-455';
      case 'REJECTED':
        return 'bg-red-150 dark:bg-red-500/10 text-red-650 dark:text-red-450';
      case 'DISPLACED':
        return 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-450';
      case 'NO_SHOW':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
      case 'TREATMENT_RENDERED':
        return 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-450';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'TREATMENT_RENDERED':
        return 'Ready for Checkout';
      case 'NO_SHOW':
        return 'No-Show';
      case 'RESCHEDULE_REQUESTED':
        return 'Reschedule Requested';
      default:
        return status;
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Appointment History</h3>
      {history.length > 0 ? (
        <div className="border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden bg-white dark:bg-slate-900/20 shadow-md">
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {history.map((appt) => (
              <div key={appt.id} className="p-6 flex flex-col gap-3 hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition-colors duration-150">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1.5">
                    <span className={`inline-flex self-start px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(appt.status)}`}>
                      {getStatusLabel(appt.status)}
                    </span>
                    <h4 className="text-lg font-bold text-slate-850 dark:text-white mt-1">
                      {appt.service?.name || 'Dental Service'}
                    </h4>
                    <span className="text-xs text-slate-500">
                      📅 {appt.date} at {appt.startTime} • Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    ID: #{appt.id.slice(0, 8)}
                  </span>
                </div>

                {/* Status-specific banners and notes */}
                {appt.status === 'COMPLETED' && appt.statusReason && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-xs border border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    <span className="font-bold block text-slate-700 dark:text-slate-300 mb-1">👩‍⚕️ Treatment Remarks:</span>
                    {appt.statusReason}
                  </div>
                )}

                {appt.status === 'CANCELLED' && appt.statusReason && (
                  <div className="bg-rose-500/5 p-4 rounded-2xl text-xs border border-rose-500/10 text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    <span className="font-bold block text-rose-500 dark:text-rose-450 mb-1">❌ Cancellation Reason:</span>
                    {appt.statusReason}
                  </div>
                )}

                {appt.status === 'REJECTED' && appt.statusReason && (
                  <div className="bg-red-500/5 p-4 rounded-2xl text-xs border border-red-500/10 text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    <span className="font-bold block text-red-500 dark:text-red-450 mb-1">🚫 Rejection Reason:</span>
                    {appt.statusReason}
                  </div>
                )}

                {appt.status === 'DISPLACED' && appt.statusReason && (
                  <div className="bg-amber-500/5 p-4 rounded-2xl text-xs border border-amber-500/10 text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    <span className="font-bold block text-amber-500 dark:text-amber-450 mb-1">⚠️ Displacement Cause:</span>
                    {appt.statusReason}
                  </div>
                )}

                {appt.status === 'NO_SHOW' && (
                  <div className="bg-slate-100/50 dark:bg-slate-950 p-4 rounded-2xl text-xs border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 mt-1 leading-relaxed flex gap-2">
                    <span className="text-amber-500">⚠️</span>
                    <p>
                      <strong>No-Show Warning</strong>: You missed this appointment. Failures to attend without prior cancellation are recorded as negative credibility, which may restrict your reservation permissions.
                    </p>
                  </div>
                )}

                {appt.status === 'TREATMENT_RENDERED' && (
                  <div className="bg-blue-500/5 p-4 rounded-2xl text-xs border border-blue-500/10 text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    <span className="font-bold block text-blue-600 dark:text-blue-400 mb-1">💳 Billing & Checkout:</span>
                    Your treatment has been submitted by the doctor. Please proceed to the clinic front desk for final checkout and invoice settlement.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-white/5 rounded-3xl text-sm text-slate-400">
          No history logs found.
        </div>
      )}
    </section>
  );
}
