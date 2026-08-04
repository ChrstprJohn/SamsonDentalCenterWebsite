'use client';

import React, { useState } from 'react';
import { formatClinicTime } from '@/shared/utils/date.util';
import { useAppointmentEmailTimeline, LeftTab } from '@/modules/staff/hooks/secretary/use-appointment-email-timeline';
import type { AppointmentCardData, TimelineEntry } from '@/modules/staff/hooks/secretary/use-appointment-email-timeline';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Mail, RotateCw, ChevronRight, UserRound } from 'lucide-react';
import { RenderedEmailFrame } from '@/components/emails/email-renderer';
import { getOutboxLogByIdAction } from '@/modules/emails/actions/logs/get-outbox-log-by-id.action';
import { SecretaryListSkeleton, SecretaryListSkeletonTheme } from './sub-components/secretary-list-skeleton';

// UI Label Mappings for Event Types (Guest vs Patient distinction noted in code comments)
const EVENT_NAME_MAP: Record<string, string> = {
  'APPOINTMENT_BOOKED': 'Booking Confirmation (Email)',
  'APPOINTMENT_CONVERTED_FROM_INQUIRY': 'Inquiry Approved (Email)', // Guest inquiry conversion email
  'APPOINTMENT_CONVERTED_FROM_INQUIRY_PATIENT': 'Inquiry Approved (Email)', // Patient inquiry conversion email
  'APPOINTMENT_CONVERTED_FROM_INQUIRY_SMS': 'Inquiry Approved (SMS)',
  'APPOINTMENT_MANUALLY_BOOKED_PATIENT': 'Manual Booking (Email)', // Registered patient manual booking email
  'APPOINTMENT_MANUALLY_BOOKED_GUEST': 'Manual Booking (Email)', // Guest patient manual booking email
  'APPOINTMENT_MANUALLY_BOOKED_SMS': 'Manual Booking (SMS)',
  'APPOINTMENT_REMINDER_24H': '24-Hour Reminder (Email)',
  'APPOINTMENT_REMINDER_48H': '48-Hour Reminder (Email)',
  'APPOINTMENT_REMINDER_24H_SMS': '24-Hour Reminder (SMS)',
  'APPOINTMENT_REMINDER_48H_SMS': '48-Hour Reminder (SMS)',
  'RESCHEDULE_BOOKING': 'Rescheduled (Email)',
  'RESCHEDULE_BOOKING_SMS': 'Rescheduled (SMS)',
  'CANCEL_BOOKING': 'Cancelled (Email)',
  'CANCEL_BOOKING_SMS': 'Cancelled (SMS)',
  'STAFF_REPLIED_TO_CHAT': 'Staff Reply (Email)',
  'APPOINTMENT_COMPLETED_POST_CARE': 'Post-Care Review (Email)',
  'APPOINTMENT_COMPLETED_POST_CARE_SMS': 'Post-Care (SMS)',
  'PATIENT_REGISTERED': 'Registration OTP (Email)',
  'PASSWORD_RESET_REQUESTED': 'Password Reset OTP (Email)',
};

function formatMessageTime(dateStr: string): string {
  try {
    const d = new Date(dateStr).getTime();
    if (isNaN(d)) return '';
    const date = new Date(d);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

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
  if (start && end) {
    const s = formatClinicTime(start);
    const e = formatClinicTime(end);
    if (s && e) return `${s} - ${e}`;
    if (s) return s;
    return '';
  }
  if (start) return formatClinicTime(start);
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
  const hasActivity = !!app.lastActivity;

  return (
    <button
      onClick={onClick}
      className={`flex items-start w-full gap-3 border-b p-4 text-sm leading-tight text-left transition-colors last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
        isSelected
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-foreground'
      }`}
    >
      <div className="size-10 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border-2 border-border/60 overflow-hidden">
        <UserRound className="size-8 text-muted-foreground/70 translate-y-0.5" />
      </div>
      <div className="flex flex-col min-w-0 flex-1 gap-1.5">
        <div className="flex w-full items-center justify-between gap-2">
          <span className={hasActivity ? 'font-semibold truncate' : 'truncate'}>
            {app.patientName}
          </span>
          {app.lastActivity && (
            <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap shrink-0">
              {formatMessageTime(app.lastActivity)}
            </span>
          )}
        </div>
        <span className="font-medium text-xs text-text-secondary truncate">
          {app.treatmentName}
        </span>
        <div className="flex w-full items-end justify-between gap-4 min-w-0">
          {app.latestEventPreview ? (
            <span className="truncate text-xs text-muted-foreground">
              {app.latestEventPreview}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic flex-1">
              No recent activity
            </span>
          )}
          {app.hasFailed && (
            <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-1 shrink-0">
              <span className="size-3.5 rounded-full bg-rose-500/15 flex items-center justify-center text-[8px] font-bold">!</span>
              {app.failureCount} Failed
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function recipientLabel(recipient: string): string {
  if (!recipient || recipient === 'system') return 'System Automated Dispatch';
  return recipient;
}

function renderActualEmailComponent(eventType: string, payload: Record<string, any>) {
  return <RenderedEmailFrame eventType={eventType} payload={payload} />;
}

function TimelineEntryCard({ entry, onResend, resendingId }: { entry: TimelineEntry; onResend?: (id: string) => void; resendingId?: string | null }) {
  const [showPayload, setShowPayload] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'preview' | 'payload'>('preview');
  const [payload, setPayload] = useState<Record<string, any> | undefined>(entry.payload);
  const [isLoadingPayload, setIsLoadingPayload] = useState(false);
  const [payloadError, setPayloadError] = useState<string | null>(null);

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

  const isEmail = entry.channel === 'EMAIL';

  const togglePayload = async () => {
    const nextVisible = !showPayload;
    setShowPayload(nextVisible);
    if (nextVisible && payload === undefined && !isLoadingPayload) {
      setIsLoadingPayload(true);
      setPayloadError(null);
      const result = await getOutboxLogByIdAction(entry.id);
      if (result.success) setPayload(result.data.payload);
      else setPayloadError(result.error);
      setIsLoadingPayload(false);
    }
  };

  return (
    <div className="relative flex gap-3 pb-5 last:pb-0">
      <div className="flex flex-col items-center shrink-0">
        <div className={`size-7 rounded-full flex items-center justify-center border-2 text-[10px] font-bold ${statusColor}`}>
          {isEmail ? 'E' : 'S'}
        </div>
        <div className="w-px flex-1 bg-border/60 mt-1" />
      </div>

      <div className="flex-1 min-w-0">
        <button
          onClick={() => { void togglePayload(); }}
          className="w-full text-left"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">
                {EVENT_NAME_MAP[entry.eventType] || entry.eventType}
              </span>
              <span className="text-[9px] text-muted-foreground font-mono leading-none shrink-0">
                {entry.eventType}
              </span>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusPill}`}>
              {entry.status}
            </span>
          </div>

          <div className="text-xs text-muted-foreground mt-1 truncate">
            To: {recipientLabel(entry.recipient)}
          </div>

          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground/70">
            <span>{showPayload ? 'Hide' : 'View'} Details & Preview</span>
            <ChevronRight className={`size-3 transition-transform ${showPayload ? 'rotate-90' : ''}`} />
          </div>

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
            {resendingId === entry.id
              ? 'Sending...'
              : entry.rawStatus === 'PROCESSED'
                ? 'Send New'
                : 'Resend'}
          </button>
        )}

        {showPayload && (
          <div className="mt-3 space-y-2.5">
            {entry.errorLogs && (
              <div className="bg-rose-950/10 border border-rose-500/20 rounded-lg p-2.5 text-[11px] font-mono text-rose-600 whitespace-pre-wrap leading-relaxed">
                {entry.errorLogs}
              </div>
            )}

            {isLoadingPayload ? <div className="text-xs text-muted-foreground">Loading communication details...</div> : null}
            {payloadError ? <div className="text-xs text-destructive">{payloadError}</div> : null}
            {!isLoadingPayload && !payloadError && payload ? <>
            {/* Sub-tabs for Preview vs Payload */}
            <div className="flex gap-1 border-b border-card-border/40 pb-1 text-xs">
              <button
                onClick={() => setActiveDetailTab('preview')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  activeDetailTab === 'preview'
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isEmail ? '📧 Email Preview' : '💬 Message Preview'}
              </button>
              <button
                onClick={() => setActiveDetailTab('payload')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  activeDetailTab === 'payload'
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {'{ }'} Technical Payload
              </button>
            </div>

            {activeDetailTab === 'preview' ? (
              <div className="rounded-xl border border-card-border/60 overflow-hidden shadow-2xs bg-white text-black max-h-[500px] overflow-y-auto">
                {renderActualEmailComponent(entry.eventType, payload)}
              </div>
            ) : (
              <div className="bg-secondary-bg/30 border border-card-border/40 rounded-lg p-2.5 text-[11px] font-mono text-text-secondary leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {JSON.stringify(payload, null, 2)}
              </div>
            )}
            </> : null}
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
    isRefreshingApps,
    isLoadingLogs,
    appsError,
    logsError,
    resendEmail,
    resendingId,
    leftTab,
    setLeftTab,
    searchTerm,
    setSearchTerm,
    tabCounts,
    hasMore,
    isLoadingMore,
    loadMoreError,
    loadMore,
    timelineHasMore,
    timelineIsLoadingMore,
    timelineLoadMoreError,
    loadMoreTimeline,
    refresh,
    refreshTimeline,
  } = useAppointmentEmailTimeline();

  const [mobileView, setMobileView] = useState<'list' | 'timeline'>('list');

  const filteredCards = appointmentCards;

  const handleSelect = (id: string) => {
    setSelectedAppointmentId(id);
    setMobileView('timeline');
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setSelectedAppointmentId(null);
    setMobileView('list');
  };

  const selectedCard = appointmentCards.find((a) => a.id === selectedAppointmentId);
  const patientName = selectedCard?.patientName ?? '';
  const treatmentName = selectedAppointment?.treatmentName ?? '';

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar
        collapsible="none"
        className={`flex-col lg:w-[350px] flex-1 lg:flex-none border-r border-card-border/40 bg-sidebar h-full overflow-hidden ${
          mobileView === 'list' ? 'flex' : 'hidden'
        } lg:flex`}
      >
        <SidebarHeader className="gap-3.5 border-b p-4 shrink-0">
          <div className="flex w-full h-8 items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="lg:hidden -ml-1 text-muted-foreground hover:text-foreground" />
              <div className="text-base font-medium text-foreground">
                Communication List
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={refresh}
              disabled={isRefreshingApps || isLoadingApps}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              title="Refresh logs"
            >
              <RotateCw className={`size-3.5 ${isLoadingApps || isRefreshingApps ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="px-1">
            <SidebarInput
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-md"
            />
          </div>

          <div className="flex gap-1 bg-muted/20 p-1 rounded-lg">
            {LEFT_TABS.map((tab) => (
              <Button
                key={tab.key}
                onClick={() => { setLeftTab(tab.key); setSelectedAppointmentId(null); setMobileView('list'); }}
                variant="ghost"
                size="sm"
                className={`flex-1 h-8 text-xs font-semibold rounded-xl transition-all ${
                  leftTab === tab.key
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                  {tab.label} ({tabCounts[tab.key]})
              </Button>
            ))}
          </div>
        </SidebarHeader>

        <SidebarContent
          data-lenis-prevent
          style={{ scrollbarWidth: 'thin' }}
          className="!overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        >
          <SidebarGroup className="px-0">
            <SidebarGroupContent className="flex flex-col">
              {isLoadingApps ? (
                <SecretaryListSkeletonTheme>
                  <div className="flex flex-col w-full">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-start w-full gap-3 border-b p-4 last:border-b-0">
                        <SecretaryListSkeleton circle width={40} height={40} />
                        <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                          <div className="flex w-full items-center justify-between gap-2">
                            <SecretaryListSkeleton width={132} height={20} />
                            <SecretaryListSkeleton width={40} height={12} />
                          </div>
                          <SecretaryListSkeleton width={88} height={16} />
                          <SecretaryListSkeleton width="100%" height={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </SecretaryListSkeletonTheme>
              ) : appsError && filteredCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Mail className="size-8 text-destructive/60 mb-2" />
                  <p className="text-xs font-medium text-foreground">Could not load communication history</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[240px]">{appsError}</p>
                  <Button variant="outline" size="sm" onClick={() => void refresh()} className="mt-3 h-8 text-xs">Retry</Button>
                </div>
              ) : filteredCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Mail className="size-8 text-muted-foreground/40 mb-2" />
                  <p className="text-xs font-medium text-foreground">
                    {leftTab === 'failed' ? 'No failed deliveries' : 'No appointments with logs'}
                  </p>
                </div>
              ) : (
                <>
                {appsError && (
                  <div className="m-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                    <div className="flex items-center justify-between gap-3">
                      <span>Could not refresh communication history. {appsError}</span>
                      <Button variant="outline" size="sm" onClick={() => void refresh()} className="h-7 shrink-0 text-xs">Retry</Button>
                    </div>
                  </div>
                )}
                {filteredCards.map((app) => (
                  <AppointmentCard
                    key={app.id}
                    app={app}
                    isSelected={app.id === selectedAppointmentId}
                    onClick={() => handleSelect(app.id)}
                  />
                ))}
                {loadMoreError && (
                  <div className="m-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                    <div className="flex items-center justify-between gap-3">
                      <span>Could not load more communication history. {loadMoreError}</span>
                      <Button variant="outline" size="sm" onClick={loadMore} className="h-7 shrink-0 text-xs">Retry</Button>
                    </div>
                  </div>
                )}
                {hasMore && (
                  <Button variant="ghost" size="sm" onClick={loadMore} disabled={isLoadingMore} className="m-3 text-xs">
                    {isLoadingMore ? <RotateCw className="mr-2 size-3.5 animate-spin" /> : null}
                    {isLoadingMore ? 'Loading…' : 'Show More'}
                  </Button>
                )}
                </>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

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
                  {selectedCard?.channelsUsed.email && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-2xs">
                      Email
                    </span>
                  )}
                  {selectedCard?.channelsUsed.sms && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 shadow-2xs">
                      SMS
                    </span>
                  )}
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
              ) : logsError ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center mb-2.5">
                    <Mail className="size-5 text-destructive/70" />
                  </div>
                  <p className="text-xs font-medium text-foreground">Could not load timeline</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[240px]">{logsError}</p>
                  <Button variant="outline" size="sm" onClick={() => refreshTimeline?.()} className="mt-3 h-8 text-xs">Retry</Button>
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
                  {timelineLoadMoreError && (
                    <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                      <div className="flex items-center justify-between gap-3">
                        <span>Could not load more timeline entries. {timelineLoadMoreError}</span>
                        <Button variant="outline" size="sm" onClick={loadMoreTimeline} className="h-7 shrink-0 text-xs">Retry</Button>
                      </div>
                    </div>
                  )}
                  {timelineHasMore && (
                    <Button variant="ghost" size="sm" onClick={loadMoreTimeline} disabled={timelineIsLoadingMore} className="mt-3 text-xs">
                      {timelineIsLoadingMore ? <RotateCw className="mr-2 size-3.5 animate-spin" /> : null}
                      {timelineIsLoadingMore ? 'Loading…' : 'Show More'}
                    </Button>
                  )}
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
