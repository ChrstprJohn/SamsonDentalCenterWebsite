'use client';

import { History } from 'lucide-react';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';

type TimelineEntry = {
  id: string;
  status: string;
  label: string;
  time: string;
  reason: string | null;
  actor: string;
};

const statusLabels: Record<string, string> = {
  PENDING: 'Requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  RESCHEDULE_REQUESTED: 'Reschedule Requested',
  DISPLACED: 'Displaced',
  CHECKED_IN: 'Checked In',
  TREATMENT_RENDERED: 'Treatment Rendered',
  COMPLETED: 'Completed',
  NO_SHOW: 'No Show',
};

function getStatusStyle(status: string) {
  switch (status) {
    case 'PENDING': return { dot: '#f59e0b', bg: '#fef3c7' };
    case 'APPROVED': return { dot: '#22c55e', bg: '#dcfce7' };
    case 'REJECTED':
    case 'CANCELLED': return { dot: '#ef4444', bg: '#fee2e2' };
    case 'RESCHEDULE_REQUESTED': return { dot: '#06b6d4', bg: '#cffafe' };
    case 'DISPLACED':
    case 'NO_SHOW': return { dot: '#f97316', bg: '#ffedd5' };
    case 'CHECKED_IN': return { dot: '#8b5cf6', bg: '#ede9fe' };
    case 'TREATMENT_RENDERED': return { dot: '#14b8a6', bg: '#ccfbf1' };
    case 'COMPLETED': return { dot: '#22c55e', bg: '#dcfce7' };
    default: return { dot: '#6b7280', bg: '#f3f4f6' };
  }
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function AppointmentStatusHistory({ appointment, activeTab, compact }: { appointment: AppointmentDto; activeTab: 'upcoming' | 'history'; compact?: boolean }) {
  const entries = buildTimelineEntries(appointment);

  return (
    <div className="py-3 px-4 space-y-2">
      <span className="text-sm font-medium text-foreground block">Appointment Timeline</span>
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
          <div className="size-8 rounded-full bg-muted/30 flex items-center justify-center mb-2">
            <History className="size-4 text-muted-foreground/60" />
          </div>
          <span className="text-xs font-medium text-foreground">No timeline records</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Status change history will appear here.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border/60" />
          <div className="flex flex-col">
            {entries.map((entry) => {
              const style = getStatusStyle(entry.status);
              return (
                <div key={entry.id} className="relative pl-8 pb-5 last:pb-0">
                  <div
                    className="absolute left-[5px] top-[5px] size-3 rounded-full border-2 z-10"
                    style={{ borderColor: style.dot, backgroundColor: style.bg }}
                  />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xs font-semibold" style={{ color: style.dot }}>{statusLabels[entry.status] || entry.status}</span>
                      <span className="text-xs text-text-muted">{formatTime(entry.time)}</span>
                    </div>
                    {entry.reason && (
                      <p className="text-xs text-text-secondary leading-relaxed">&ldquo;{entry.reason}&rdquo;</p>
                    )}
                    <span className="text-[10px] text-text-muted">- {entry.actor}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'history' && appointment.status === 'COMPLETED' && (
        <div className="border-t border-card-border/80 pt-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-text-secondary">Invoice Receipt</span>
          <div className="border border-green-500/25 bg-green-500/5 rounded-xl p-3 text-xs flex flex-col gap-1">
            <div className="flex justify-between"><span className="text-text-muted">Payment status:</span><span className="font-bold text-green-500 uppercase">Paid & Finalized</span></div>
            <a href="/secretary/invoices" className="text-primary hover:underline font-semibold mt-1 inline-block text-[11px]">View Invoice Directory</a>
          </div>
        </div>
      )}
    </div>
  );
}

function buildTimelineEntries(appointment: AppointmentDto): TimelineEntry[] {
  const history = appointment.statusHistory || [];
  const entries: TimelineEntry[] = [];

  const hasPendingEntry = history.some((h) => h.newStatus === 'PENDING');
  if (!hasPendingEntry) {
    const isStaffCreated = appointment.source === 'STAFF_CREATED';
    entries.push({
      id: 'initial',
      status: 'PENDING',
      label: 'Requested',
      time: appointment.createdAt || new Date().toISOString(),
      reason: null,
      actor: isStaffCreated ? 'Secretary' : 'Patient',
    });
  }

  for (const h of history) {
    const rawActor = h.actorRole || 'System';
    const displayActor = rawActor === 'STAFF' || rawActor === 'SECRETARY' ? 'Secretary' : rawActor;
    entries.push({
      id: h.id,
      status: h.newStatus,
      label: statusLabels[h.newStatus] || h.newStatus,
      time: h.createdAt,
      reason: h.reason,
      actor: displayActor,
    });
  }

  return entries;
}
