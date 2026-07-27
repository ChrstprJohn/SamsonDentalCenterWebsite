'use client';

import React, { useState } from 'react';
import { useAppointmentEmailTimeline, LeftTab } from '@/modules/staff/hooks/secretary/use-appointment-email-timeline';
import type { AppointmentCardData, TimelineEntry } from '@/modules/staff/hooks/secretary/use-appointment-email-timeline';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Mail, RotateCw, ChevronRight } from 'lucide-react';

const EVENT_NAME_MAP: Record<string, string> = {
  'APPOINTMENT_BOOKED': 'Booking Confirmation',
  'APPOINTMENT_CONVERTED_FROM_INQUIRY': 'Inquiry Approved',
  'APPOINTMENT_MANUALLY_BOOKED_PATIENT': 'Manual Booking (Patient)',
  'APPOINTMENT_MANUALLY_BOOKED_GUEST': 'Manual Booking (Guest)',
  'APPOINTMENT_REMINDER_24H': '24-Hour Reminder',
  'APPOINTMENT_REMINDER_48H': '48-Hour Reminder',
  'RESCHEDULE_BOOKING': 'Rescheduled',
  'CANCEL_BOOKING': 'Cancelled',
  'STAFF_REPLIED_TO_CHAT': 'Staff Reply',
  'APPOINTMENT_MANUALLY_BOOKED_SMS': 'Manual Booking SMS',
  'APPOINTMENT_REMINDER_48H_SMS': '48-Hour Reminder SMS',
  'APPOINTMENT_REMINDER_24H_SMS': '24-Hour Reminder SMS',
  'APPOINTMENT_COMPLETED_POST_CARE_SMS': 'Post-Care SMS',
  'PATIENT_REGISTERED': 'Registration OTP',
  'PASSWORD_RESET_REQUESTED': 'Password Reset OTP',
};

function timeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr).getTime();
    if (isNaN(d)) return '';
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function formatTimeFull(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatTimeRange(start: string | null, end: string | null) {
  const fmt = (t: string) => new Date(`2000-01-01T${t}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (start && end) return `${fmt(start)} - ${fmt(end)}`;
  if (start) return fmt(start);
  return '';
}

const LEFT_TABS: { key: LeftTab; label: string }[] = [
  { key: 'all', label: 'All Logs' },
  { key: 'failed', label: 'Failed / Delivery Alerts' },
];

function AppointmentCard({
  app,
  isSelected,
  onClick,
}: {
  app: AppointmentCardData;
  isSelected: boolean;
  onClick: () => void;
}) {
  const range = formatTimeRange(app.startTime, app.endTime);

  return (
    <button
      onClick={onClick}
      className={`flex flex-col w-full gap-1 border-b p-3 text-left transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
        isSelected
          ? 'bg-sidebar-accent text-sidebar-accent-foreground [&_*]:text-sidebar-accent-foreground [&_.e-badge]:bg-sidebar-accent-foreground/20 [&_.s-badge]:bg-sidebar-accent-foreground/20 [&_.fail-badge]:bg-sidebar-accent-foreground/20'
          : 'text-foreground'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold truncate">{app.patientName}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {app.channelsUsed.email && <span className="e-badge size-3.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[8px] font-bold flex items-center justify-center">E</span>}
          {app.channelsUsed.sms && <span className="s-badge size-3.5 rounded-full bg-blue-500/10 text-blue-600 text-[8px] font-bold flex items-center justify-center">S</span>}
          {app.hasFailed && <span className="fail-badge size-3.5 rounded-full bg-rose-500/10 text-rose-600 text-[8px] font-bold flex items-center justify-center">!</span>}
        </div>
      </div>
      <div className="text-[11px] text-text-secondary truncate">
        {app.treatmentName}{range ? ` \u00b7 ${range}` : ''}
      </div>
      {app.latestEventPreview && (
        <div className="text-[10px] text-muted-foreground truncate">
          {app.latestEventPreview}
        </div>
      )}
      {app.lastActivity && (
        <div className="text-[10px] text-muted-foreground text-right -mt-0.5">
          {timeAgo(app.lastActivity)}
        </div>
      )}
    </button>
  );
}

function recipientLabel(recipient: string): string {
  if (!recipient || recipient === 'system') return 'System Automated Dispatch';
  return recipient;
}

function TimelineEntryCard({ entry, onResend, resendingId }: { entry: TimelineEntry; onResend?: (id: string) => void; resendingId?: string | null }) {
  const [showPayload, setShowPayload] = useState(false);

  const statusColor =
    entry.rawStatus === 'FAILED'
      ? 'border-rose-300 bg-rose-50 text-rose-600'
      : entry.rawStatus === 'PROCESSED'
        ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
        : 'border-amber-300 bg-amber-50 text-amber-600';

  const statusPill =
    entry.rawStatus === 'FAILED'
      ? 'bg-rose-100 text-rose-700'
      : entry.rawStatus === 'PROCESSED'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700';

  return (
    <div className="relative flex gap-4 pb-5 last:pb-0">
      <div className="flex flex-col items-center shrink-0">
        <div className={`size-7 rounded-full flex items-center justify-center border-2 text-[10px] font-bold ${statusColor}`}>
          {entry.channel === 'EMAIL' ? 'E' : 'S'}
        </div>
        <div className="w-px flex-1 bg-border/60 mt-1" />
      </div>

      <div className="flex-1 min-w-0">
        <button
          onClick={() => setShowPayload(!showPayload)}
          className="w-full text-left"
        >
          {/* Top Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">
                {EVENT_NAME_MAP[entry.eventType] || entry.eventType}
              </span>
              <span className="text-[9px] text-text-secondary font-mono leading-none pt-0.5 shrink-0">
                {entry.eventType}
              </span>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusPill}`}>
              {entry.status}
            </span>
          </div>

          {/* Middle Block */}
          <div className="text-[12px] text-muted-foreground mt-1 truncate">
            To: {recipientLabel(entry.recipient)}
          </div>

          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-muted-foreground/70">
            <span>{showPayload ? 'Hide' : 'View'} Message Details</span>
            <ChevronRight className={`size-3 transition-transform ${showPayload ? 'rotate-90' : ''}`} />
          </div>

          {/* Bottom Row */}
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
            <span>{formatTimeFull(entry.timestamp)}</span>
            <span>&middot;</span>
            <span>{timeAgo(entry.timestamp)}</span>
            <span>&middot;</span>
            <span>Retries: {entry.retryCount}/3</span>
          </div>
        </button>

        {onResend && (
          <button
            onClick={(e) => { e.stopPropagation(); onResend(entry.id); }}
            disabled={resendingId === entry.id}
            className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
          >
            {resendingId === entry.id ? 'Resending...' : 'Resend'}
          </button>
        )}

        {/* Collapsible Content */}
        {showPayload && (
          <div className="mt-2 pl-0">
            {entry.errorLogs && (
              <div className="mb-2 bg-rose-950/10 border border-rose-500/20 rounded-lg p-2.5 text-[11px] font-mono text-rose-600 whitespace-pre-wrap leading-relaxed">
                {entry.errorLogs}
              </div>
            )}
            <div className="bg-secondary-bg/30 border border-card-border/40 rounded-lg p-2.5 text-[11px] font-mono text-text-secondary leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
              {JSON.stringify(entry.payload, null, 2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AppointmentEmailTimelineView() {
  const {
    appointmentCards,
    timelineEntries,
    selectedAppointment,
    selectedAppointmentId,
    setSelectedAppointmentId,
    isLoadingApps,
    isLoadingLogs,
    resendEmail,
    resendingId,
    leftTab,
    setLeftTab,
    refresh,
  } = useAppointmentEmailTimeline();

  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'timeline'>('list');

  const filteredCards = search
    ? appointmentCards.filter((a) => a.patientName.toLowerCase().includes(search.toLowerCase()))
    : appointmentCards;

  const handleSelect = (id: string) => {
    setSelectedAppointmentId(id);
    setMobileView('timeline');
  };

  const patientName = selectedAppointment
    ? appointmentCards.find((a) => a.id === selectedAppointmentId)?.patientName ?? ''
    : '';
  const treatmentName = selectedAppointment?.service?.name ?? '';

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div
        className={`w-[400px] lg:flex flex-col border-r border-card-border/40 bg-sidebar h-full overflow-hidden ${
          mobileView === 'list' ? 'flex' : 'hidden'
        }`}
      >
        <div className="p-3.5 border-b shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-foreground">Appointments</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={refresh}
              disabled={isLoadingApps}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            >
              <RotateCw className={`size-3.5 ${isLoadingApps ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs rounded-md h-8"
            />
          </div>

          <div className="flex gap-1 bg-muted/20 p-1 rounded-lg">
            {LEFT_TABS.map((tab) => (
              <Button
                key={tab.key}
                onClick={() => setLeftTab(tab.key)}
                variant="ghost"
                size="sm"
                className={`flex-1 h-8 text-xs transition-all ${
                  leftTab === tab.key
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" data-lenis-prevent style={{ scrollbarWidth: 'thin' }}>
          {isLoadingApps ? (
            <div className="flex flex-col">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col gap-2 border-b p-3.5 animate-pulse">
                  <div className="h-3.5 w-36 rounded bg-muted/40" />
                  <div className="h-3 w-24 rounded bg-muted/30" />
                  <div className="h-3 w-16 rounded bg-muted/20" />
                </div>
              ))}
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Mail className="size-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-medium text-foreground">
                {leftTab === 'failed' ? 'No failed deliveries' : 'No appointments with logs'}
              </p>
            </div>
          ) : (
            filteredCards.map((app) => (
              <AppointmentCard
                key={app.id}
                app={app}
                isSelected={app.id === selectedAppointmentId}
                onClick={() => handleSelect(app.id)}
              />
            ))
          )}
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col h-full overflow-hidden ${
          mobileView === 'timeline' ? 'flex' : 'hidden'
        } lg:flex`}
      >
        {selectedAppointment ? (
          <>
            <div className="p-4 border-b border-card-border/40 shrink-0">
              <button
                onClick={() => setMobileView('list')}
                className="lg:hidden text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 mb-1"
              >
                &larr; Back to appointments
              </button>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-foreground">Communication Details</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {patientName} &middot; {treatmentName}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isLoadingLogs && <RotateCw className="size-3.5 text-muted-foreground animate-spin" />}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3" data-lenis-prevent style={{ scrollbarWidth: 'thin' }}>
              {isLoadingLogs ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="size-8 rounded-full bg-muted/30 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-40 rounded bg-muted/40" />
                        <div className="h-3 w-60 rounded bg-muted/30" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : timelineEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="size-10 rounded-full bg-muted/20 flex items-center justify-center mb-2.5">
                    <Mail className="size-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-xs font-medium text-foreground">No logs found</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[240px]">This appointment has no associated communication activity yet.
                  </p>
                </div>
              ) : (
                <div>
                  {timelineEntries.map((entry) => (
                    <TimelineEntryCard key={entry.id} entry={entry} onResend={resendEmail} resendingId={resendingId} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 p-6 text-center">
            <div className="size-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
              <Mail className="size-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground">Select an appointment</p>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              Choose an appointment from the list to view its communication timeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
