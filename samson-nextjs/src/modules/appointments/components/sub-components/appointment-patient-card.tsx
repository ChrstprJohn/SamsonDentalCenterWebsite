import React from 'react';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface AppointmentPatientCardProps {
  appt: AppointmentDto;
}

export function AppointmentPatientCard({ appt }: AppointmentPatientCardProps) {
  const isFamily = !!appt.dependent;
  const patientName = isFamily
    ? `${appt.dependent?.firstName} ${appt.dependent?.lastName}`
    : appt.patient
    ? `${appt.patient.firstName} ${appt.patient.lastName}`
    : 'Unknown Patient';

  const bookedBy = appt.patient ? `${appt.patient.firstName} ${appt.patient.lastName}` : 'Unknown';

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
        <span className="text-xl">👤</span>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Patient Profile</h3>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Patient Name</span>
          <span className="text-base font-bold text-slate-800 dark:text-slate-100">{patientName}</span>
        </div>

        {isFamily && (
          <>
            <div className="flex flex-col gap-0.5 border-t border-slate-100 dark:border-white/5 pt-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Relationship</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">{appt.dependent?.relationship}</span>
            </div>
            <div className="flex flex-col gap-0.5 border-t border-slate-100 dark:border-white/5 pt-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Booked By</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">{bookedBy}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
