import React from 'react';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';
import { formatShortDate, formatClinicTime } from '@/shared/utils/date.util';
import { AppointmentStatusReasonCallout } from './appointment-status-reason-callout';

interface AppointmentScheduleCardProps {
  appt: AppointmentDto;
}

export function AppointmentScheduleCard({ appt }: AppointmentScheduleCardProps) {
  const dateStr = formatShortDate(appt.date);
  const timeWindow = `${formatClinicTime(appt.startTime)} - ${formatClinicTime(appt.endTime)}`;
  const hasProposedSlot = !!(appt.proposedDate && appt.proposedStartTime && appt.proposedEndTime);

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
        <span className="text-xl" aria-hidden="true">Cal</span>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Schedule & Timing</h3>
      </div>

      {hasProposedSlot ? (
        <ProposedSlotComparison appt={appt} dateStr={dateStr} timeWindow={timeWindow} />
      ) : (
        <CurrentSlotSummary dateStr={dateStr} timeWindow={timeWindow} />
      )}

      <AppointmentStatusReasonCallout appt={appt} />
    </div>
  );
}

function CurrentSlotSummary({ dateStr, timeWindow }: { dateStr: string; timeWindow: string }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ScheduleValue label="Appointment Date" value={dateStr} />
      <ScheduleValue label="Time Window" value={timeWindow} />
    </div>
  );
}

function ScheduleValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-base font-bold text-blue-600 dark:text-blue-400">{value}</span>
    </div>
  );
}

function ProposedSlotComparison({
  appt,
  dateStr,
  timeWindow,
}: {
  appt: AppointmentDto;
  dateStr: string;
  timeWindow: string;
}) {
  const approved = appt.statusReason?.includes('approved');
  const rejected = appt.statusReason?.includes('rejected');
  const proposedDate = appt.proposedDate ?? appt.date;
  const proposedStartTime = appt.proposedStartTime ?? appt.startTime;
  const proposedEndTime = appt.proposedEndTime ?? appt.endTime;

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold text-slate-500">Reschedule requested slot comparison:</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SlotPanel
          title={approved ? 'Previous Slot (Replaced)' : 'Secured Current Slot'}
          date={approved ? formatShortDate(proposedDate) : dateStr}
          time={approved ? `${formatClinicTime(proposedStartTime)} - ${formatClinicTime(proposedEndTime)}` : timeWindow}
          state={appt.status === 'RESCHEDULE_REQUESTED' ? 'muted' : approved ? 'inactive' : 'active'}
          crossed={approved}
          badge={rejected ? 'Active' : undefined}
        />
        <SlotPanel
          title={approved ? 'New Secured Slot' : rejected ? 'Requested Slot (Rejected)' : 'Requested New Slot'}
          date={approved ? dateStr : formatShortDate(proposedDate)}
          time={approved ? timeWindow : `${formatClinicTime(proposedStartTime)} - ${formatClinicTime(proposedEndTime)}`}
          state={appt.status === 'RESCHEDULE_REQUESTED' ? 'pending' : approved ? 'active' : 'inactive'}
          crossed={rejected}
          badge={approved ? 'Active' : undefined}
        />
      </div>
    </div>
  );
}

function SlotPanel({
  title,
  date,
  time,
  state,
  crossed,
  badge,
}: {
  title: string;
  date: string;
  time: string;
  state: 'active' | 'inactive' | 'muted' | 'pending';
  crossed?: boolean;
  badge?: string;
}) {
  const styles = {
    active: 'bg-white dark:bg-slate-900 border-emerald-500/20 shadow-sm ring-1 ring-emerald-500/10',
    inactive: 'bg-slate-100 dark:bg-slate-950/20 border-slate-200 dark:border-white/5 opacity-50',
    muted: 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-white/5 opacity-75',
    pending: 'bg-amber-500/5 dark:bg-amber-955/20 border-amber-200 dark:border-amber-900',
  };

  return (
    <div className={`p-4 rounded-xl border flex flex-col gap-2 ${styles[state]}`}>
      <div className="flex justify-between items-center">
        <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">{title}</span>
        {badge && <span className="text-[9px] bg-emerald-100 dark:bg-emerald-955 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-extrabold uppercase">{badge}</span>}
      </div>
      <SlotField label="Date" value={date} crossed={crossed} />
      <SlotField label="Time Window" value={time} crossed={crossed} />
    </div>
  );
}

function SlotField({ label, value, crossed }: { label: string; value: string; crossed?: boolean }) {
  return (
    <div className={crossed ? 'line-through decoration-slate-400' : ''}>
      <span className="text-[10px] text-slate-400 uppercase tracking-wide block">{label}</span>
      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}
