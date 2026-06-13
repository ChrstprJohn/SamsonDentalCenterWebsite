'use client';

import React from 'react';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface AppointmentHistoryProps {
  history: AppointmentDto[];
}

export function AppointmentHistory({ history }: AppointmentHistoryProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Appointment History</h3>
      {history.length > 0 ? (
        <div className="border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden bg-white dark:bg-slate-900/20">
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {history.map((appt) => (
              <div key={appt.id} className="p-6 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className={`inline-flex self-start px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      appt.status === 'COMPLETED'
                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {appt.status}
                    </span>
                    <h4 className="text-base font-bold text-slate-800 dark:text-white mt-2">
                      {appt.service?.name || 'Unknown Service'}
                    </h4>
                    <span className="text-xs text-slate-400">
                      📅 {appt.date} with Dr. {appt.doctor?.lastName}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {/* Assuming price is part of service or derived elsewhere. Mocks used hardcoded price. */}
                    TBD
                  </span>
                </div>

                {appt.userNote && appt.status === 'COMPLETED' && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-xs border border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    <span className="font-bold block text-slate-700 dark:text-slate-300 mb-1">👩‍⚕️ Treatment remarks:</span>
                    {appt.userNote}
                  </div>
                )}

                {appt.statusReason && appt.status === 'CANCELLED' && (
                  <div className="bg-rose-500/5 p-4 rounded-xl text-xs border border-rose-500/10 text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    <span className="font-bold block text-rose-500 dark:text-rose-400 mb-1">❌ Cancellation Reason:</span>
                    {appt.statusReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-slate-200 dark:border-white/5 rounded-3xl text-sm text-slate-400">
          No history logs found.
        </div>
      )}
    </section>
  );
}
