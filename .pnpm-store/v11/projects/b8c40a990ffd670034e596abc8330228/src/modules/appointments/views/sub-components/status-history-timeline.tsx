'use client';

import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface StatusHistoryTimelineProps {
  history: AppointmentDto['statusHistory'];
}

export function StatusHistoryTimeline({ history }: StatusHistoryTimelineProps) {
  if (!history || history.length === 0) return null;

  const sorted = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
        <span className="text-xl" aria-hidden="true">Log</span>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Status Audit Trail</h3>
      </div>
      <div className="relative pl-6 border-l border-slate-150 dark:border-white/5 flex flex-col gap-6 text-xs text-slate-650 dark:text-slate-350">
        {sorted.map((item, idx) => (
          <div key={item.id || idx} className="relative flex flex-col gap-1.5 text-left">
            <span className="absolute -left-[30px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-white dark:border-slate-950 bg-blue-500 text-[8px] text-white font-black">
              {idx + 1}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeColor(item.newStatus)}`}>
                {item.newStatus === 'RESCHEDULE_REQUESTED' ? 'Reschedule Requested' : item.newStatus}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{formatHistoryDate(item.createdAt)}</span>
            </div>
            {item.reason && (
              <p className="text-slate-700 dark:text-slate-300 mt-1 font-medium bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-150 dark:border-white/5 italic">
                &ldquo;{item.reason}&rdquo;
              </p>
            )}
            <span className="text-[10px] text-slate-450">
              Action by: <span className="font-semibold">{formatActorRole(item.actorRole)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatHistoryDate(createdAt: string) {
  return new Date(createdAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatActorRole(actorRole: string) {
  if (actorRole === 'PATIENT') return 'Patient (You)';
  return actorRole.charAt(0).toUpperCase() + actorRole.slice(1).toLowerCase();
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-450';
    case 'CANCELLED':
    case 'REJECTED':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-455';
    case 'RESCHEDULE_REQUESTED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
  }
}
