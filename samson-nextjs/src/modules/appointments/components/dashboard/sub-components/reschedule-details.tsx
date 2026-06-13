import React from 'react';
import type { AppointmentDto } from '../../../dtos/exports';
import { formatShortDate, formatClinicTime } from '@/shared/utils/date.util';

interface RescheduleDetailsProps {
  appt: AppointmentDto;
  dateStr: string;
  timeWindow: string;
}

export function RescheduleDetails({ appt, dateStr, timeWindow }: RescheduleDetailsProps) {
  if (!appt.proposedDate || !appt.proposedStartTime || !appt.proposedEndTime) {
    return (
      <>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Appointment Date</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">{dateStr}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Requested Time Window</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">{timeWindow}</span>
        </div>
      </>
    );
  }

  const isApproved = appt.statusReason?.includes('approved');
  const isRejected = appt.statusReason?.includes('rejected');

  return (
    <div className={`md:col-span-2 mt-2 p-4 rounded-lg border ${
      appt.status === 'RESCHEDULE_REQUESTED' ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900' :
      isApproved ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900' :
      'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
    }`}>
      <h6 className={`text-xs font-bold mb-3 ${
        appt.status === 'RESCHEDULE_REQUESTED' ? 'text-amber-600 dark:text-amber-400' :
        isApproved ? 'text-emerald-600 dark:text-emerald-400' :
        'text-rose-600 dark:text-rose-400'
      }`}>
        {appt.status === 'RESCHEDULE_REQUESTED' ? 'Reschedule Request Pending Review' :
         isApproved ? 'Reschedule Request Approved' :
         'Reschedule Request Rejected'}
      </h6>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* LEFT SLOT (Original Date) */}
        <div className={`flex flex-col gap-2 p-3 rounded-md border ${
          appt.status === 'RESCHEDULE_REQUESTED' ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 opacity-75' :
          isApproved ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5 opacity-50' :
          'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-500/20 shadow-sm ring-1 ring-emerald-500/20'
        }`}>
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isRejected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
            }`}>
              {isApproved ? 'Previous Slot (Replaced)' : 'Secured Current Slot'}
            </span>
            {isRejected && (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 rounded-full font-bold">ACTIVE</span>
            )}
          </div>
          <div className={`flex flex-col ${isApproved ? 'line-through decoration-slate-400/50' : ''}`}>
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Date</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {isApproved ? formatShortDate(appt.proposedDate) : dateStr}
            </span>
          </div>
          <div className={`flex flex-col ${isApproved ? 'line-through decoration-slate-400/50' : ''}`}>
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Time</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {isApproved ? `${formatClinicTime(appt.proposedStartTime)} - ${formatClinicTime(appt.proposedEndTime)}` : timeWindow}
            </span>
          </div>
        </div>

        {/* RIGHT SLOT (Proposed Date) */}
        <div className={`flex flex-col gap-2 p-3 rounded-md border ${
          appt.status === 'RESCHEDULE_REQUESTED' ? 'bg-amber-100/50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' :
          isApproved ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-500/20 shadow-sm ring-1 ring-emerald-500/20' :
          'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5 opacity-50'
        }`}>
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              appt.status === 'RESCHEDULE_REQUESTED' ? 'text-amber-600 dark:text-amber-400' :
              isApproved ? 'text-emerald-600 dark:text-emerald-400' :
              'text-slate-500'
            }`}>
              {isApproved ? 'New Secured Slot' :
               isRejected ? 'Requested Slot (Rejected)' :
               'Requested New Slot'}
            </span>
            {isApproved && (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 rounded-full font-bold">ACTIVE</span>
            )}
          </div>
          <div className={`flex flex-col ${isRejected ? 'line-through decoration-slate-400/50' : ''}`}>
            <span className={`text-[10px] uppercase tracking-wide ${
              appt.status === 'RESCHEDULE_REQUESTED' ? 'text-amber-700/60 dark:text-amber-300/60' : 'text-slate-400'
            }`}>Date</span>
            <span className={`font-medium ${
              appt.status === 'RESCHEDULE_REQUESTED' ? 'text-amber-900 dark:text-amber-100' : 'text-slate-800 dark:text-slate-200'
            }`}>
              {isApproved ? dateStr : formatShortDate(appt.proposedDate)}
            </span>
          </div>
          <div className={`flex flex-col ${isRejected ? 'line-through decoration-slate-400/50' : ''}`}>
            <span className={`text-[10px] uppercase tracking-wide ${
              appt.status === 'RESCHEDULE_REQUESTED' ? 'text-amber-700/60 dark:text-amber-300/60' : 'text-slate-400'
            }`}>Time</span>
            <span className={`font-medium ${
              appt.status === 'RESCHEDULE_REQUESTED' ? 'text-amber-900 dark:text-amber-100' : 'text-slate-800 dark:text-slate-200'
            }`}>
              {isApproved ? timeWindow : `${formatClinicTime(appt.proposedStartTime)} - ${formatClinicTime(appt.proposedEndTime)}`}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
