import React from 'react';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';
import { formatShortDate, formatClinicTime } from '@/shared/utils/date.util';

interface AppointmentScheduleCardProps {
  appt: AppointmentDto;
}

export function AppointmentScheduleCard({ appt }: AppointmentScheduleCardProps) {
  const dateStr = formatShortDate(appt.date);
  const timeWindow = `${formatClinicTime(appt.startTime)} - ${formatClinicTime(appt.endTime)}`;

  const renderStatusReasonCallout = () => {
    if (!appt.statusReason) return null;

    const isResched = !!appt.proposedDate;
    const textLower = appt.statusReason.toLowerCase();

    if (isResched) {
      const isRejected = textLower.includes('reject');
      return (
        <div className={`mt-4 p-4 rounded-xl text-xs border leading-relaxed ${
          appt.status === 'RESCHEDULE_REQUESTED'
            ? 'bg-amber-500/5 border-amber-500/10 text-slate-650 dark:text-slate-400'
            : isRejected
            ? 'bg-rose-500/5 border-rose-500/10 text-slate-655 dark:text-slate-400'
            : 'bg-emerald-500/5 border-emerald-500/10 text-slate-655 dark:text-slate-400'
        }`}>
          <span className={`font-bold block mb-1 ${
            appt.status === 'RESCHEDULE_REQUESTED' ? 'text-amber-600 dark:text-amber-450' :
            isRejected ? 'text-rose-600 dark:text-rose-455' :
            'text-emerald-600 dark:text-emerald-450'
          }`}>
            {appt.status === 'RESCHEDULE_REQUESTED' ? '🗓️ Reschedule Reason (Pending Review):' :
             isRejected ? '🚫 Reschedule Request Rejected:' :
             '✅ Reschedule Request Approved:'}
          </span>
          {appt.statusReason}
        </div>
      );
    }

    return (
      <div className={`mt-4 p-4 rounded-xl text-xs border leading-relaxed ${
        appt.status === 'APPROVED' || appt.status === 'COMPLETED'
          ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-655 dark:text-slate-400'
          : appt.status === 'CANCELLED' || appt.status === 'REJECTED'
          ? 'bg-rose-500/5 border-rose-500/10 text-slate-655 dark:text-slate-400'
          : 'bg-amber-500/5 border-amber-500/10 text-slate-655 dark:text-slate-400'
      }`}>
        <span className={`font-bold block mb-1 ${
          appt.status === 'APPROVED' || appt.status === 'COMPLETED' ? 'text-emerald-600 dark:text-emerald-450' :
          appt.status === 'CANCELLED' || appt.status === 'REJECTED' ? 'text-rose-600 dark:text-rose-455' :
          'text-amber-600 dark:text-amber-450'
        }`}>
          {appt.status === 'APPROVED' ? '✅ Approval Remarks:' :
           appt.status === 'COMPLETED' ? '👩‍⚕️ Treatment Remarks:' :
           appt.status === 'CANCELLED' ? '❌ Cancellation Reason:' :
           appt.status === 'REJECTED' ? '🚫 Rejection Reason:' :
           appt.status === 'DISPLACED' ? '⚠️ Displacement Cause:' : 'Remarks:'}
        </span>
        {appt.statusReason}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
        <span className="text-xl">📅</span>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Schedule & Timing</h3>
      </div>

      {appt.proposedDate && appt.proposedStartTime && appt.proposedEndTime ? (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-slate-500">
            Reschedule requested slot comparison:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current Slot */}
            <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
              appt.status === 'RESCHEDULE_REQUESTED'
                ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-white/5 opacity-75'
                : appt.statusReason?.includes('approved')
                ? 'bg-slate-100 dark:bg-slate-950/20 border-slate-200 dark:border-white/5 opacity-50'
                : 'bg-white dark:bg-slate-900 border-emerald-500/20 shadow-sm ring-1 ring-emerald-500/10'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">
                  {appt.statusReason?.includes('approved') ? 'Previous Slot (Replaced)' : 'Secured Current Slot'}
                </span>
                {appt.statusReason?.includes('rejected') && (
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-955 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-extrabold uppercase">Active</span>
                )}
              </div>
              <div className={appt.statusReason?.includes('approved') ? 'line-through decoration-slate-400' : ''}>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Date</span>
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  {appt.statusReason?.includes('approved') ? formatShortDate(appt.proposedDate) : dateStr}
                </span>
              </div>
              <div className={appt.statusReason?.includes('approved') ? 'line-through decoration-slate-400' : ''}>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Time Window</span>
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  {appt.statusReason?.includes('approved') ? `${formatClinicTime(appt.proposedStartTime)} - ${formatClinicTime(appt.proposedEndTime)}` : timeWindow}
                </span>
              </div>
            </div>

            {/* Proposed Slot */}
            <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
              appt.status === 'RESCHEDULE_REQUESTED'
                ? 'bg-amber-500/5 dark:bg-amber-955/20 border-amber-200 dark:border-amber-900'
                : appt.statusReason?.includes('approved')
                ? 'bg-white dark:bg-slate-900 border-emerald-500/20 shadow-sm ring-1 ring-emerald-500/10'
                : 'bg-slate-100 dark:bg-slate-950/20 border-slate-200 dark:border-white/5 opacity-50'
            }`}>
              <div className="flex justify-between items-center">
                <span className={`text-[9px] uppercase tracking-widest font-black ${
                  appt.status === 'RESCHEDULE_REQUESTED' ? 'text-amber-600 dark:text-amber-450' :
                  appt.statusReason?.includes('approved') ? 'text-emerald-600 dark:text-emerald-450' : 'text-slate-400'
                }`}>
                  {appt.statusReason?.includes('approved') ? 'New Secured Slot' :
                   appt.statusReason?.includes('rejected') ? 'Requested Slot (Rejected)' :
                   'Requested New Slot'}
                </span>
                {appt.statusReason?.includes('approved') && (
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-955 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-extrabold uppercase">Active</span>
                )}
              </div>
              <div className={appt.statusReason?.includes('rejected') ? 'line-through decoration-slate-400' : ''}>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Date</span>
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  {appt.statusReason?.includes('approved') ? dateStr : formatShortDate(appt.proposedDate)}
                </span>
              </div>
              <div className={appt.statusReason?.includes('rejected') ? 'line-through decoration-slate-400' : ''}>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Time Window</span>
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  {appt.statusReason?.includes('approved') ? timeWindow : `${formatClinicTime(appt.proposedStartTime)} - ${formatClinicTime(appt.proposedEndTime)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Appointment Date</span>
            <span className="text-base font-bold text-blue-600 dark:text-blue-400">{dateStr}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Time Window</span>
            <span className="text-base font-bold text-blue-600 dark:text-blue-400">{timeWindow}</span>
          </div>
        </div>
      )}

      {/* Render consistent status reason callout here */}
      {renderStatusReasonCallout()}
    </div>
  );
}
