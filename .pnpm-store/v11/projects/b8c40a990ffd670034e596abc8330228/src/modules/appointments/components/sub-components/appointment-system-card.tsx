import React from 'react';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface AppointmentSystemCardProps {
  appt: AppointmentDto;
  maxReschedules: number;
}

export function AppointmentSystemCard({ appt, maxReschedules }: AppointmentSystemCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
        <span className="text-xl">⚙️</span>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">System Records</h3>
      </div>

      <div className="flex flex-col gap-3 text-xs">
        <div className="flex justify-between items-center gap-4">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Reschedules Used</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {appt.rescheduleCount} / {maxReschedules}
          </span>
        </div>
        
        {appt.status !== 'APPROVED' && appt.status !== 'PENDING' && (
          <div className="flex justify-between items-center gap-4 border-t border-slate-100 dark:border-white/5 pt-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Archived Status</span>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold rounded text-slate-505 uppercase tracking-wide">
              {appt.status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
