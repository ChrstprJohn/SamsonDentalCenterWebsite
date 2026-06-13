import React from 'react';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface AppointmentClinicalCardProps {
  appt: AppointmentDto;
}

export function AppointmentClinicalCard({ appt }: AppointmentClinicalCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
        <span className="text-xl">🦷</span>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Clinical Details</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Treatment Service</span>
          <span className="text-base font-bold text-slate-800 dark:text-slate-100">
            {appt.service?.name || 'N/A'}
          </span>
          {appt.service?.durationMinutes && (
            <span className="text-xs text-slate-400 font-medium">
              ⏱️ {appt.service.durationMinutes} minutes duration
            </span>
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Assigned Specialist</span>
          <span className="text-base font-bold text-slate-800 dark:text-slate-100">
            {appt.doctor ? `${appt.doctor.prefix || 'Dr.'} ${appt.doctor.firstName} ${appt.doctor.lastName}` : 'Unassigned'}
          </span>
          {appt.doctor?.suffix && (
            <span className="text-xs text-slate-400 font-medium">
              Credentials: {appt.doctor.suffix}
            </span>
          )}
        </div>
      </div>

      {appt.userNote && (
        <div className="mt-2 bg-slate-50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-white/5 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-400">
          <strong className="block text-[10px] uppercase text-slate-400 tracking-wider mb-1">Patient Note on Booking:</strong>
          "{appt.userNote}"
        </div>
      )}
    </div>
  );
}
