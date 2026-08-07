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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/feedback/toast-container';
import { resendNotificationAction } from '@/modules/appointments/actions/status/resend-notification.action';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Pencil, X, Check, Send, ChevronDown, Mail, MessageSquare, RotateCw, ChevronRight, UserRound } from 'lucide-react';
import { RenderedEmailFrame } from '@/components/emails/email-renderer';
import { getOutboxLogByIdAction } from '@/modules/emails/actions/logs/get-outbox-log-by-id.action';
import { computeNotificationStatus } from '@/modules/notifications/utils/notification-status.util';
import { SecretaryListSkeleton, SecretaryListSkeletonTheme, SecretaryRefreshBar } from './sub-components/secretary-list-skeleton';

// UI Label Mappings for Event Types (Guest vs Patient distinction noted in code comments)
const EVENT_NAME_MAP: Record<string, string> = {
  'APPOINTMENT_INQUIRY_RECEIVED': 'Inquiry Received (Email)',
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

class EmailErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error?.message || 'Could not render preview.' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="font-semibold">Unable to display message preview</p>
          <p className="mt-1 text-[11px] font-mono text-muted-foreground">{this.state.error}</p>
        </div>
      );
    }
    return this.props.children;
  }
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

  React.useEffect(() => {
    setPayload(entry.payload);
  }, [entry.payload]);

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
    if (nextVisible && (!payload || Object.keys(payload).length === 0) && !isLoadingPayload) {
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
            {!isLoadingPayload && !payloadError ? (
              <>
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
                    <EmailErrorBoundary>
                      {isEmail ? (
                        renderActualEmailComponent(entry.eventType, payload || {})
                      ) : (
                        <div className="p-4 bg-muted/10 text-xs leading-relaxed text-foreground font-sans">
                          <div className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider mb-2">SMS Message Content</div>
                          <p className="whitespace-pre-wrap">{payload?.smsBody || payload?.message || payload?.body || payload?.text || 'SMS notification dispatched to patient.'}</p>
                        </div>
                      )}
                    </EmailErrorBoundary>
                  </div>
                ) : (
                  <div className="bg-secondary-bg/30 border border-card-border/40 rounded-lg p-2.5 text-[11px] font-mono text-text-secondary leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {JSON.stringify(payload || {}, null, 2)}
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

const LEFT_TABS: { key: LeftTab; label: string }[] = [
  { key: 'all', label: 'Appointments' },
  { key: 'failed', label: 'Failed' },
  { key: 'inquiries', label: 'Inquiries' },
];

export function AppointmentEmailTimelineView() {
  const {
    appointmentCards,
    timelineEntries,
    selectedAppointment,
    selectedAppointmentId,
    setSelectedAppointmentId,
    isLoadingApps,
    isRefreshingApps,
    lastRefreshedAt,
    isLoadingLogs,
    appsError,
    logsError,
    resendEmail,
    resendingId,
    leftTab,
    selectTab,
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

  const { addToast } = useToast();
  const [mobileView, setMobileView] = useState<'list' | 'timeline'>('list');

  // Channel edit & Send notification states
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [isSavingChannel, setIsSavingChannel] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<'EMAIL' | 'SMS' | 'BOTH' | 'NONE'>('EMAIL');
  const [draftChannel, setDraftChannel] = useState<'EMAIL' | 'SMS' | 'BOTH' | 'NONE'>('EMAIL');
  const [isTriggeringNotification, setIsTriggeringNotification] = useState<string | null>(null);
  const [allowOverrideResend, setAllowOverrideResend] = useState(false);

  const filteredCards = appointmentCards;

  const handleSelect = (id: string) => {
    setSelectedAppointmentId(id);
    setMobileView('timeline');
    setIsEditingChannel(false);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setSelectedAppointmentId(null);
    setMobileView('list');
    setIsEditingChannel(false);
  };

  const selectedCard = appointmentCards.find((a) => a.id === selectedAppointmentId);
  const patientName = selectedCard?.patientName ?? '';
  const treatmentName = selectedAppointment?.treatmentName ?? '';

  // Sync current channel state when selected appointment changes by fetching actual DB value
  React.useEffect(() => {
    let cancelled = false;
    if (selectedAppointmentId) {
      import('@/shared/database/client').then(({ createClient }) => {
        const supabase = createClient();
        supabase
          .from('appointments')
          .select('confirmation_channel')
          .eq('id', selectedAppointmentId)
          .single()
          .then(({ data }) => {
            if (cancelled) return;
            const ch = (data?.confirmation_channel as any) || 'EMAIL';
            setCurrentChannel(ch);
            setDraftChannel(ch);
          });
      });
    }
    return () => {
      cancelled = true;
    };
  }, [selectedAppointmentId]);

  const handleSaveChannel = async () => {
    if (!selectedAppointmentId) return;
    setIsSavingChannel(true);
    const res = await updateConfirmationChannelAction({
      appointmentId: selectedAppointmentId,
      confirmationChannel: draftChannel,
    });
    if (res.success) {
      addToast('Notification channel updated.', 'success');
      setCurrentChannel(draftChannel);
      if (selectedAppointment) {
        (selectedAppointment as any).confirmationChannel = draftChannel;
      }
      setIsEditingChannel(false);
      refresh({ force: true });
    } else {
      addToast(res.error || 'Failed to update notification channel.', 'error');
    }
    setIsSavingChannel(false);
  };

  const handleTriggerNotification = async (
    eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H' | 'APPOINTMENT_CHECKOUT' | 'APPOINTMENT_INQUIRY_RECEIVED' | 'CANCEL_BOOKING' | 'RESCHEDULE_BOOKING',
    targetChannel?: 'EMAIL' | 'SMS'
  ) => {
    if (!selectedAppointmentId) return;
    const triggerKey = targetChannel ? `${eventType}_${targetChannel}` : eventType;
    setIsTriggeringNotification(triggerKey);
    const res = await resendNotificationAction({
      appointmentId: selectedAppointmentId,
      eventType,
      targetChannel,
    });
    if (res.success) {
      addToast('Notification sent successfully.', 'success');
      refreshTimeline?.();
      refresh({ force: true });
    } else {
      addToast(res.error || 'Failed to send notification.', 'error');
    }
    setIsTriggeringNotification(null);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar
        collapsible="none"
        className={`flex-col xl:w-[400px] lg:w-[380px] flex-1 lg:flex-none border-r border-card-border/40 bg-sidebar h-full overflow-hidden ${
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
          </div>

          <div className="px-1">
            <SidebarInput
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-md"
            />
          </div>

        {(() => {
          const activeIndex = LEFT_TABS.findIndex((t) => t.key === leftTab);
          const safeIndex = activeIndex < 0 ? 0 : activeIndex;
          return (
            <div className="relative grid grid-cols-3 gap-1 bg-muted/20 p-1 rounded-xl">
              <div
                className="absolute top-1 bottom-1 rounded-lg bg-primary transition-transform duration-200 ease-out shadow-xs"
                style={{
                  width: 'calc((100% - 0.5rem) / 3)',
                  transform: `translateX(calc(${safeIndex} * (100% + 0.25rem)))`,
                }}
              />
              {LEFT_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { selectTab(tab.key); setMobileView('list'); }}
                  className={`relative z-10 h-8 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center ${
                    leftTab === tab.key
                      ? 'text-primary-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label} ({tabCounts[tab.key]})
                </button>
              ))}
            </div>
          );
        })()}
        </SidebarHeader>
        {lastRefreshedAt ? (
          <div className="px-4 py-2 text-[10px] text-muted-foreground border-b border-card-border/20 flex items-center justify-between shrink-0">
            <span>Last updated {lastRefreshedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void refresh({ force: true })}
              disabled={isLoadingApps || isRefreshingApps}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Refresh communication history"
              title="Refresh"
            >
              <RotateCw className={`size-3 ${isRefreshingApps ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        ) : null}

        <SidebarContent
          data-lenis-prevent
          style={{ scrollbarWidth: 'thin' }}
          className="!overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        >
          <SidebarGroup className="px-0">
            <SidebarGroupContent className="flex flex-col">
              {isRefreshingApps && <SecretaryRefreshBar />}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-foreground">Communication Details</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {patientName} &middot; {treatmentName}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {isLoadingLogs && <RotateCw className="size-3.5 text-muted-foreground animate-spin" />}

                  {/* Channel Edit / Display */}
                  <div className="flex items-center gap-1.5 bg-muted/30 border border-card-border/60 rounded-lg px-2.5 py-1 text-xs">
                    <span className="text-[11px] text-muted-foreground font-medium">Channel:</span>
                    {isEditingChannel ? (
                      <div className="flex items-center gap-1.5">
                        <Select
                          value={draftChannel}
                          onChange={(e) => setDraftChannel(e.target.value as any)}
                          className="text-xs h-6 px-1.5 py-0 w-24 border-card-border/80"
                          options={[
                            { value: 'EMAIL', label: 'Email' },
                            { value: 'SMS', label: 'SMS' },
                            { value: 'BOTH', label: 'Email & SMS' },
                            { value: 'NONE', label: 'None' },
                          ]}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setDraftChannel(currentChannel); setIsEditingChannel(false); }}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          title="Cancel"
                        >
                          <X className="size-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveChannel}
                          disabled={isSavingChannel || draftChannel === currentChannel}
                          className="h-6 px-2 text-[10px] gap-1 bg-slate-900 text-white rounded-md disabled:cursor-not-allowed"
                        >
                          <Check className="size-3" /> {isSavingChannel ? '...' : 'Save'}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">
                          {currentChannel === 'EMAIL' ? 'Email' : currentChannel === 'SMS' ? 'SMS' : currentChannel === 'BOTH' ? 'Email & SMS' : 'None'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingChannel(true)}
                          className="h-5 px-1 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="size-3" /> Edit
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Trigger Notification Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        disabled={currentChannel === 'NONE' || Boolean(isTriggeringNotification)}
                        className="h-8 px-3 text-xs gap-1.5 bg-primary text-primary-foreground font-medium rounded-lg shadow-2xs disabled:opacity-50"
                      >
                        {isTriggeringNotification ? (
                          <RotateCw className="size-3.5 animate-spin" />
                        ) : (
                          <Send className="size-3.5" />
                        )}
                        <span>{isTriggeringNotification ? 'Sending...' : 'Send Notification'}</span>
                        <ChevronDown className="size-3 opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72">
                      {(() => {
                        const showEmail = currentChannel === 'EMAIL' || currentChannel === 'BOTH';
                        const showSms = currentChannel === 'SMS' || currentChannel === 'BOTH';

                        const NOTIFICATION_TYPES: {
                          eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H' | 'APPOINTMENT_CHECKOUT' | 'APPOINTMENT_INQUIRY_RECEIVED' | 'CANCEL_BOOKING' | 'RESCHEDULE_BOOKING';
                          label: string;
                          icon: string;
                          isRose?: boolean;
                          emailOnly?: boolean;
                        }[] = [
                          { eventType: 'APPOINTMENT_BOOKED', label: 'Booking Confirmation', icon: '📋' },
                          { eventType: 'APPOINTMENT_REMINDER_48H', label: '48-Hour Reminder', icon: '⏰' },
                          { eventType: 'APPOINTMENT_REMINDER_24H', label: '24-Hour Reminder', icon: '⏰' },
                          { eventType: 'APPOINTMENT_CHECKOUT', label: 'Checkout / Thank You', icon: '✨' },
                          { eventType: 'APPOINTMENT_INQUIRY_RECEIVED', label: 'Inquiry Request Received', icon: '📩', emailOnly: true },
                          { eventType: 'CANCEL_BOOKING', label: 'Cancellation Notice', icon: '🚫', isRose: true },
                          { eventType: 'RESCHEDULE_BOOKING', label: 'Reschedule Notice', icon: '📅' },
                        ];

                        const createdAt = (selectedCard as any)?.date || null;
                        const startTime = selectedCard?.startTime || null;

                        return NOTIFICATION_TYPES.map((type) => {
                          const getBadge = (ch: 'EMAIL' | 'SMS') => {
                            if (type.eventType === 'APPOINTMENT_INQUIRY_RECEIVED') {
                              const inquiryLog = timelineEntries.find((log) => log.eventType === 'APPOINTMENT_INQUIRY_RECEIVED');
                              const isConvertedInquiry = Boolean(
                                (selectedCard as any)?.inquiryId ||
                                (selectedCard as any)?.inquiry_id ||
                                (selectedAppointment as any)?.inquiryId ||
                                (selectedAppointment as any)?.inquiry_id ||
                                (selectedAppointment as any)?.appointmentInquiryId ||
                                (selectedAppointment as any)?.appointment_inquiry_id ||
                                inquiryLog
                              );
                              const displayStatus = inquiryLog
                                ? (inquiryLog.rawStatus === 'PROCESSED' ? 'SENT' : inquiryLog.rawStatus === 'FAILED' ? 'FAILED' : 'PENDING')
                                : isConvertedInquiry
                                  ? 'SENT'
                                  : 'NOT APPLICABLE';

                              const badgeClass = displayStatus === 'SENT'
                                ? 'bg-green-500/10 text-green-500'
                                : displayStatus === 'FAILED'
                                  ? 'bg-rose-500/10 text-rose-600'
                                  : displayStatus === 'PENDING'
                                    ? 'bg-muted text-muted-foreground/60'
                                    : 'bg-slate-500/10 text-slate-500 dark:text-slate-400';

                              return { label: displayStatus, badgeClass };
                            }

                            if (type.eventType === 'CANCEL_BOOKING' || type.eventType === 'RESCHEDULE_BOOKING') {
                              const logEventType = ch === 'SMS' ? `${type.eventType}_SMS` : type.eventType;
                              const log = timelineEntries.find((e) => (e.eventType === logEventType || e.eventType === type.eventType) && e.channel === ch);
                              const isSent = log?.rawStatus === 'PROCESSED';
                              const displayStatus = isSent ? 'SENT' : log ? (log.rawStatus === 'FAILED' ? 'FAILED' : 'PENDING') : 'NOT APPLICABLE';
                              const badgeClass = displayStatus === 'SENT'
                                ? 'bg-green-500/10 text-green-500'
                                : displayStatus === 'FAILED'
                                  ? 'bg-rose-500/10 text-rose-600'
                                  : displayStatus === 'PENDING'
                                    ? 'bg-muted text-muted-foreground/60'
                                    : 'bg-slate-500/10 text-slate-500 dark:text-slate-400';

                              return { label: displayStatus, badgeClass };
                            }

                            const isCore = ['APPOINTMENT_BOOKED', 'APPOINTMENT_REMINDER_48H', 'APPOINTMENT_REMINDER_24H', 'APPOINTMENT_CHECKOUT'].includes(type.eventType);
                            if (!isCore) return null;
                            const log = timelineEntries.find((e) => {
                              if (e.channel !== ch) return false;
                              if (type.eventType === 'APPOINTMENT_BOOKED') {
                                return ['APPOINTMENT_BOOKED', 'APPOINTMENT_CONVERTED_FROM_INQUIRY', 'APPOINTMENT_CONVERTED_FROM_INQUIRY_PATIENT', 'APPOINTMENT_CONVERTED_FROM_INQUIRY_SMS', 'APPOINTMENT_MANUALLY_BOOKED_PATIENT', 'APPOINTMENT_MANUALLY_BOOKED_GUEST', 'APPOINTMENT_MANUALLY_BOOKED_SMS'].includes(e.eventType);
                              }
                              if (type.eventType === 'APPOINTMENT_CHECKOUT') {
                                return ['APPOINTMENT_CHECKOUT', 'APPOINTMENT_COMPLETED_POST_CARE', 'APPOINTMENT_COMPLETED_POST_CARE_SMS'].includes(e.eventType);
                              }
                              if (type.eventType === 'APPOINTMENT_REMINDER_48H') {
                                return ['APPOINTMENT_REMINDER_48H', 'APPOINTMENT_REMINDER_48H_SMS'].includes(e.eventType);
                              }
                              if (type.eventType === 'APPOINTMENT_REMINDER_24H') {
                                return ['APPOINTMENT_REMINDER_24H', 'APPOINTMENT_REMINDER_24H_SMS'].includes(e.eventType);
                              }
                              return e.eventType === type.eventType;
                            });

                            const isSent = log?.rawStatus === 'PROCESSED';
                            const st = computeNotificationStatus({
                              eventType: type.eventType as any,
                              targetChannel: ch,
                              isSent,
                              currentChannel,
                              createdAt,
                              startTime,
                            });
                            return st;
                          };

                          const emailStatus = getBadge('EMAIL');
                          const smsStatus = getBadge('SMS');

                          return (
                            <React.Fragment key={type.eventType}>
                              {showEmail && (
                                <DropdownMenuItem
                                  onClick={() => handleTriggerNotification(type.eventType, 'EMAIL')}
                                  className={`text-xs flex items-center justify-between cursor-pointer ${type.isRose ? 'text-rose-600 focus:text-rose-600' : ''}`}
                                >
                                  <span className="truncate">{type.icon} {type.label} (Email)</span>
                                  {emailStatus && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ml-2 ${emailStatus.badgeClass}`}>
                                      {emailStatus.label}
                                    </span>
                                  )}
                                </DropdownMenuItem>
                              )}
                              {showSms && !type.emailOnly && (
                                <DropdownMenuItem
                                  onClick={() => handleTriggerNotification(type.eventType, 'SMS')}
                                  className={`text-xs flex items-center justify-between cursor-pointer ${type.isRose ? 'text-rose-600 focus:text-rose-600' : ''}`}
                                >
                                  <span className="truncate">💬 {type.label} (SMS)</span>
                                  {smsStatus && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ml-2 ${smsStatus.badgeClass}`}>
                                      {smsStatus.label}
                                    </span>
                                  )}
                                </DropdownMenuItem>
                              )}
                            </React.Fragment>
                          );
                        });
                      })()}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" data-lenis-prevent style={{ scrollbarWidth: 'thin' }}>
              {/* Notification History Section Overview */}
              {selectedAppointmentId && (
                <div className="bg-muted/15 border border-card-border/60 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Notification Status Overview</span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Channel: {currentChannel}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {/* 1. Inquiry Request Received */}
                    {(() => {
                      const inquiryLog = timelineEntries.find((log) => log.eventType === 'APPOINTMENT_INQUIRY_RECEIVED');
                      const isConvertedInquiry = Boolean(
                        (selectedCard as any)?.inquiryId ||
                        (selectedCard as any)?.inquiry_id ||
                        (selectedAppointment as any)?.inquiryId ||
                        (selectedAppointment as any)?.inquiry_id ||
                        (selectedAppointment as any)?.appointmentInquiryId ||
                        (selectedAppointment as any)?.appointment_inquiry_id ||
                        inquiryLog
                      );

                      const displayStatus = isLoadingLogs
                        ? 'LOADING...'
                        : inquiryLog
                          ? (inquiryLog.rawStatus === 'PROCESSED'
                            ? 'SENT'
                            : inquiryLog.rawStatus === 'FAILED'
                              ? 'FAILED'
                              : 'PENDING')
                          : isConvertedInquiry
                            ? 'SENT'
                            : 'NOT APPLICABLE';

                      const badgeClass = isLoadingLogs
                        ? 'bg-muted text-muted-foreground/60 animate-pulse'
                        : displayStatus === 'SENT'
                          ? 'bg-green-500/10 text-green-500'
                          : displayStatus === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-600'
                            : displayStatus === 'PENDING'
                              ? 'bg-muted text-muted-foreground/60'
                              : 'bg-slate-500/10 text-slate-500 dark:text-slate-400';

                      return (
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Inquiry Request Received</span>
                          <div className="flex items-center justify-between p-2.5 bg-secondary-bg/20 border border-card-border/60 rounded-xl">
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail className="size-3.5 text-muted-foreground shrink-0" />
                              <span className="text-xs font-medium text-foreground">Email</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeClass}`}>
                                {displayStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 2. Core Notification Events (Confirmation, 48h, 24h, Checkout) */}
                    {(() => {
                      const commEntries: {
                        key: string;
                        label: string;
                        eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H' | 'APPOINTMENT_CHECKOUT';
                      }[] = [
                        { key: 'confirmation', label: 'Booking Confirmation', eventType: 'APPOINTMENT_BOOKED' },
                        { key: 'reminder48h', label: '48-Hour Reminder', eventType: 'APPOINTMENT_REMINDER_48H' },
                        { key: 'reminder24h', label: '24-Hour Reminder', eventType: 'APPOINTMENT_REMINDER_24H' },
                        { key: 'checkout', label: 'Checkout / Thank You', eventType: 'APPOINTMENT_CHECKOUT' },
                      ];

                      const createdAt = (selectedCard as any)?.date || null;
                      const startTime = selectedCard?.startTime || null;

                      return commEntries.map((entry) => {
                        const getEventPillStatus = (eventType: string, targetChannel: 'EMAIL' | 'SMS') => {
                          const log = timelineEntries.find((e) => {
                            if (e.channel !== targetChannel) return false;
                            if (eventType === 'APPOINTMENT_BOOKED') {
                              return ['APPOINTMENT_BOOKED', 'APPOINTMENT_CONVERTED_FROM_INQUIRY', 'APPOINTMENT_CONVERTED_FROM_INQUIRY_PATIENT', 'APPOINTMENT_CONVERTED_FROM_INQUIRY_SMS', 'APPOINTMENT_MANUALLY_BOOKED_PATIENT', 'APPOINTMENT_MANUALLY_BOOKED_GUEST', 'APPOINTMENT_MANUALLY_BOOKED_SMS'].includes(e.eventType);
                            }
                            if (eventType === 'APPOINTMENT_CHECKOUT') {
                              return ['APPOINTMENT_CHECKOUT', 'APPOINTMENT_COMPLETED_POST_CARE', 'APPOINTMENT_COMPLETED_POST_CARE_SMS'].includes(e.eventType);
                            }
                            if (eventType === 'APPOINTMENT_REMINDER_48H') {
                              return ['APPOINTMENT_REMINDER_48H', 'APPOINTMENT_REMINDER_48H_SMS'].includes(e.eventType);
                            }
                            if (eventType === 'APPOINTMENT_REMINDER_24H') {
                              return ['APPOINTMENT_REMINDER_24H', 'APPOINTMENT_REMINDER_24H_SMS'].includes(e.eventType);
                            }
                            return e.eventType === eventType;
                          });

                          return computeNotificationStatus({
                            eventType: eventType as any,
                            targetChannel,
                            isSent: log?.rawStatus === 'PROCESSED',
                            currentChannel,
                            createdAt,
                            startTime,
                          });
                        };

                        const smsStatus = getEventPillStatus(entry.eventType, 'SMS');
                        const emailStatus = getEventPillStatus(entry.eventType, 'EMAIL');

                        return (
                          <div key={entry.key} className="space-y-1">
                            <span className="text-xs text-muted-foreground">{entry.label}</span>
                            <div className="flex flex-col gap-2">
                              {/* SMS row */}
                              <div className="flex items-center justify-between p-2.5 bg-secondary-bg/20 border border-card-border/60 rounded-xl">
                                <div className="flex items-center gap-2 min-w-0">
                                  <MessageSquare className="size-3.5 text-muted-foreground shrink-0" />
                                  <span className="text-xs font-medium text-foreground">SMS</span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${smsStatus.badgeClass}`}>
                                    {smsStatus.label}
                                  </span>
                                </div>
                              </div>

                              {/* Email row */}
                              <div className="flex items-center justify-between p-2.5 bg-secondary-bg/20 border border-card-border/60 rounded-xl">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Mail className="size-3.5 text-muted-foreground shrink-0" />
                                  <span className="text-xs font-medium text-foreground">Email</span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${emailStatus.badgeClass}`}>
                                    {emailStatus.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}

                    {/* 3. Cancellation & Reschedule Notice */}
                    {(['CANCEL_BOOKING', 'RESCHEDULE_BOOKING'] as const).map((eventType) => {
                      const label = eventType === 'CANCEL_BOOKING' ? 'Cancellation' : 'Reschedule';

                      return (
                        <div key={eventType} className="space-y-1">
                          <span className="text-xs text-muted-foreground">{label}</span>
                          <div className="flex flex-col gap-2">
                            {(['EMAIL', 'SMS'] as const).map((channelType) => {
                              const logEventType = channelType === 'SMS' ? `${eventType}_SMS` : eventType;
                              const latestLog = timelineEntries.find((e) => (e.eventType === logEventType || e.eventType === eventType) && e.channel === channelType);
                              const isSent = latestLog?.rawStatus === 'PROCESSED';
                              const displayStatus = isLoadingLogs
                                ? 'LOADING...'
                                : isSent
                                  ? 'SENT'
                                  : latestLog
                                    ? latestLog.rawStatus === 'FAILED'
                                      ? 'FAILED'
                                      : 'PENDING'
                                    : 'NOT APPLICABLE';

                              const statusBadgeClass = isLoadingLogs
                                ? 'bg-muted text-muted-foreground/60 animate-pulse'
                                : displayStatus === 'SENT'
                                  ? 'bg-green-500/10 text-green-500'
                                  : displayStatus === 'FAILED'
                                    ? 'bg-rose-500/10 text-rose-600'
                                    : displayStatus === 'PENDING'
                                      ? 'bg-muted text-muted-foreground/60'
                                      : 'bg-slate-500/10 text-slate-500 dark:text-slate-400';

                              const Icon = channelType === 'SMS' ? MessageSquare : Mail;

                              return (
                                <div key={channelType} className="flex items-center justify-between p-2.5 bg-secondary-bg/20 border border-card-border/60 rounded-xl">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Icon className="size-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-xs font-medium text-foreground">{channelType === 'SMS' ? 'SMS' : 'Email'}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusBadgeClass}`}>
                                      {displayStatus}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
