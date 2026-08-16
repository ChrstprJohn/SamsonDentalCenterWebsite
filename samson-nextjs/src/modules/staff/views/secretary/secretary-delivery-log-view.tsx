// src/modules/staff/views/secretary/secretary-delivery-log-view.tsx
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/shared/utils';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mail, MessageSquare, Search, ChevronLeft, ChevronRight, ChevronDown, RotateCw, Inbox, MoreHorizontal, AlertCircle, X, Info } from 'lucide-react';
import { getOutboxLogsPageAction } from '@/modules/emails/actions/logs/get-outbox-logs-page.action';
import { getOutboxLogByIdAction } from '@/modules/emails/actions/logs/get-outbox-log-by-id.action';
import { resendEmailAction } from '@/modules/emails/actions/logs/resend-email.action';
import { useToast } from '@/components/feedback/toast-container';
import { formatTimeAgo } from '@/shared/utils/date.util';
import { SecretaryListSkeleton, SecretaryListSkeletonTheme } from './sub-components/secretary-list-skeleton';
import type { OutboxLogResponseDto } from '@/modules/emails/dtos/logs/outbox-log-response.dto';

// UI Label Mappings for Event Types (Matching Notification Status Overview)
const EVENT_NAME_MAP: Record<string, string> = {
  'APPOINTMENT_INQUIRY_RECEIVED': 'Inquiry Request Received',
  'APPOINTMENT_BOOKED': 'Booking Confirmation',
  'APPOINTMENT_CONVERTED_FROM_INQUIRY': 'Booking Confirmation',
  'APPOINTMENT_CONVERTED_FROM_INQUIRY_PATIENT': 'Booking Confirmation',
  'APPOINTMENT_CONVERTED_FROM_INQUIRY_SMS': 'Booking Confirmation',
  'APPOINTMENT_MANUALLY_BOOKED_PATIENT': 'Booking Confirmation',
  'APPOINTMENT_MANUALLY_BOOKED_GUEST': 'Booking Confirmation',
  'APPOINTMENT_MANUALLY_BOOKED_SMS': 'Booking Confirmation',
  'APPOINTMENT_REMINDER_24H': '24-Hour Reminder',
  'APPOINTMENT_REMINDER_48H': '48-Hour Reminder',
  'APPOINTMENT_REMINDER_24H_SMS': '24-Hour Reminder',
  'APPOINTMENT_REMINDER_48H_SMS': '48-Hour Reminder',
  'RESCHEDULE_BOOKING': 'Reschedule Notice',
  'RESCHEDULE_BOOKING_SMS': 'Reschedule Notice',
  'CANCEL_BOOKING': 'Cancellation Notice',
  'CANCEL_BOOKING_SMS': 'Cancellation Notice',
  'STAFF_REPLIED_TO_CHAT': 'Staff Reply',
  'APPOINTMENT_CHECKOUT': 'Checkout / Thank You',
  'APPOINTMENT_COMPLETED_POST_CARE': 'Checkout / Thank You',
  'APPOINTMENT_COMPLETED_POST_CARE_SMS': 'Checkout / Thank You',
  'APPOINTMENT_CHECKOUT_FOLLOW_UP': '48h Follow-Up (Kamusta)',
  'APPOINTMENT_NO_SHOW': 'Missed Appointment (No-show)',
  'APPOINTMENT_NO_SHOW_SMS': 'Missed Appointment (No-show)',
  'REJECT_INQUIRY': 'Inquiry Rejected / Declined',
  'PATIENT_REGISTERED': 'Registration OTP',
  'PASSWORD_RESET_REQUESTED': 'Password Reset OTP',
};

const badgeClassFor = (status: string) =>
  status === 'SENT' || status === 'PROCESSED'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
    : status === 'FAILED'
    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
    : status === 'PENDING'
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';

const channelClassFor = (channel: 'EMAIL' | 'SMS') =>
  channel === 'EMAIL'
    ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400'
    : 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400';

interface DeliveryEntry {
  id: string;
  channel: 'EMAIL' | 'SMS';
  type: string;
  status: string;
  recipient: string;
  retryCount: number;
  errorLogs: string | null;
  appointmentId: string | null;
  inquiryId: string | null;
  timestamp: string;
}

function toEntry(log: OutboxLogResponseDto): DeliveryEntry {
  const isSms = log.eventType.endsWith('_SMS') || log.eventType.includes('SMS');
  const payload = (log.payload || {}) as Record<string, any>;
  const recipient = isSms
    ? payload.phone || payload.mobileNumber || payload.phoneNumber || payload.recipientPhone || payload.guestPhone || payload.to || payload.email || 'System Automated Dispatch'
    : payload.email || payload.guestEmail || payload.recipientEmail || payload.to || payload.recipient || payload.phoneNumber || payload.phone || payload.mobileNumber || payload.guestPhone || 'System Automated Dispatch';
  const rawAppointmentId = (payload.appointmentId || payload.appointment_id || null) as string | null;
  const rawInquiryId = (payload.inquiryId || payload.inquiry_id || null) as string | null;
  const finalInquiryId = rawInquiryId || (log.eventType.includes('INQUIRY') && rawAppointmentId && rawAppointmentId !== 'INQUIRY' ? rawAppointmentId : null);
  return {
    id: log.id,
    channel: isSms ? 'SMS' : 'EMAIL',
    type: EVENT_NAME_MAP[log.eventType] || log.eventType,
    status: log.status === 'PROCESSED' ? 'SENT' : log.status,
    recipient,
    retryCount: log.retryCount,
    errorLogs: log.errorLogs,
    // Inquiry events carry an inquiry id, not an appointment id — don't deep-link those.
    appointmentId: rawAppointmentId && !log.eventType.includes('INQUIRY') ? rawAppointmentId : null,
    inquiryId: finalInquiryId,
    timestamp: log.processedAt ?? log.createdAt,
  };
}

function DeliveryLogRow({
  entry,
  isPinned,
  resendingId,
  onResend,
  onViewError,
}: {
  entry: DeliveryEntry;
  isPinned?: boolean;
  resendingId: string | null;
  onResend: (id: string) => void;
  onViewError: (entry: DeliveryEntry) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const prefix = '/secretary-v2';
  return (
    <tr
      className={`border-b border-card-border/40 last:border-b-0 transition-colors ${
        isPinned ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/20'
      }`}
    >
      <td className="py-2.5 pr-3 text-sm font-medium text-foreground max-w-[130px] truncate" title={entry.type}>
        <span className="truncate block">{entry.type}</span>
      </td>
      <td className="py-2.5 pr-3 text-sm text-muted-foreground max-w-[160px] truncate" title={entry.recipient}>
        <span className="truncate block">{entry.recipient}</span>
      </td>
      <td className="py-2.5 pr-3 whitespace-nowrap">
        <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeClassFor(entry.status)}`}>
          {entry.status}
        </span>
      </td>
      <td className="py-2.5 pr-3 whitespace-nowrap text-sm text-muted-foreground font-mono">
        {entry.retryCount} / 3
      </td>
      <td className="py-2.5 pl-2 text-right text-sm text-muted-foreground font-mono whitespace-nowrap">
        {formatTimeAgo(entry.timestamp)}
      </td>
      <td className="py-2.5 pl-2 text-right whitespace-nowrap">
        {entry.status === 'SENT' ? (
          // Already delivered — no resend; avoids duplicate outbox rows.
          <span className="inline-block w-7" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={resendingId !== null}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                title="Actions"
              >
                {resendingId === entry.id ? (
                  <RotateCw className="size-3.5 animate-spin" />
                ) : (
                  <MoreHorizontal className="size-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                disabled={entry.status === 'PROCESSING'}
                onClick={() => void onResend(entry.id)}
                className="text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCw className="size-3.5 text-muted-foreground" />
                {entry.channel === 'SMS' ? 'Retry via SMS' : 'Retry via Email'}
              </DropdownMenuItem>
              {entry.errorLogs && (
                <DropdownMenuItem
                  onClick={() => onViewError(entry)}
                  className="text-sm flex items-center gap-2 cursor-pointer"
                >
                  <AlertCircle className="size-3.5 text-muted-foreground" />
                  View Error Log
                </DropdownMenuItem>
              )}
              {entry.appointmentId && (
                <DropdownMenuItem
                  onClick={() => router.push(`${prefix}/appointments?appointmentId=${entry.appointmentId}`)}
                  className="text-sm flex items-center gap-2 cursor-pointer"
                >
                  <Info className="size-3.5 text-muted-foreground" />
                  Appointment Detail
                </DropdownMenuItem>
              )}
              {entry.inquiryId && (
                <DropdownMenuItem
                  onClick={() => router.push(`${prefix}/pending?id=${entry.inquiryId}`)}
                  className="text-sm flex items-center gap-2 cursor-pointer"
                >
                  <Info className="size-3.5 text-muted-foreground" />
                  Request Detail
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </td>
    </tr>
  );
}

// ---- Date range filtering ----

type DatePresetKey = 'all' | 'today' | 'yesterday' | 'last3' | 'last7' | 'last15' | 'last30' | 'custom';

const DATE_PRESETS: { key: DatePresetKey; label: string }[] = [
  { key: 'all', label: 'All time' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last3', label: 'Last 3 days' },
  { key: 'last7', label: 'Last 7 days' },
  { key: 'last15', label: 'Last 15 days' },
  { key: 'last30', label: 'Last 30 days' },
];

interface DateRange {
  from?: Date;
  to?: Date;
  fromISO?: string;
  toISO?: string;
  label: string;
  preset: DatePresetKey;
}

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

function rangeForPreset(key: DatePresetKey, customFrom?: Date, customTo?: Date): DateRange {
  const now = new Date();
  switch (key) {
    case 'all':
      return { label: 'All time', preset: 'all' };
    case 'today': {
      const from = startOfDay(now);
      const to = endOfDay(now);
      return { from, to, fromISO: from.toISOString(), toISO: to.toISOString(), label: 'Today', preset: 'today' };
    }
    case 'yesterday': {
      const from = startOfDay(new Date(now.getTime() - 86400000));
      const to = endOfDay(new Date(now.getTime() - 86400000));
      return { from, to, fromISO: from.toISOString(), toISO: to.toISOString(), label: 'Yesterday', preset: 'yesterday' };
    }
    case 'last3': {
      const from = startOfDay(new Date(now.getTime() - 2 * 86400000));
      const to = endOfDay(now);
      return { from, to, fromISO: from.toISOString(), toISO: to.toISOString(), label: 'Last 3 days', preset: 'last3' };
    }
    case 'last7': {
      const from = startOfDay(new Date(now.getTime() - 6 * 86400000));
      const to = endOfDay(now);
      return { from, to, fromISO: from.toISOString(), toISO: to.toISOString(), label: 'Last 7 days', preset: 'last7' };
    }
    case 'last15': {
      const from = startOfDay(new Date(now.getTime() - 14 * 86400000));
      const to = endOfDay(now);
      return { from, to, fromISO: from.toISOString(), toISO: to.toISOString(), label: 'Last 15 days', preset: 'last15' };
    }
    case 'last30': {
      const from = startOfDay(new Date(now.getTime() - 29 * 86400000));
      const to = endOfDay(now);
      return { from, to, fromISO: from.toISOString(), toISO: to.toISOString(), label: 'Last 30 days', preset: 'last30' };
    }
    case 'custom': {
      if (!customFrom) return { label: 'All time', preset: 'all' };
      const from = startOfDay(customFrom);
      const to = customTo ? endOfDay(customTo) : endOfDay(customFrom);
      const fmt = (d: Date) => d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      return { from, to, fromISO: from.toISOString(), toISO: to.toISOString(), label: `${fmt(from)} – ${fmt(to)}`, preset: 'custom' };
    }
  }
}

// ---- Component ----

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'SENT', label: 'Sent' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
];

export function SecretaryDeliveryLogView() {
  const { addToast } = useToast();
  const [entries, setEntries] = useState<DeliveryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [channel, setChannel] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>(() => rangeForPreset('last7'));
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [viewingError, setViewingError] = useState<DeliveryEntry | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [prevPageCount, setPrevPageCount] = useState(0);
  const [pinnedEntry, setPinnedEntry] = useState<DeliveryEntry | null>(null);

  const nextCursorRef = useRef<string | null>(null);
  const prevCursorsRef = useRef<string[]>([]);
  const requestId = useRef(0);
  const deepLinkHandledRef = useRef(false);

  useEffect(() => {
    if (deepLinkHandledRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const status = params.get('status');
    if (!id && !status) return;
    deepLinkHandledRef.current = true;
    // FAILED_EMAIL_ALERT links carry ?status=Failed — apply it so the status
    // filter matches the pinned entry instead of staying "All statuses".
    if (status && STATUS_OPTIONS.some((opt) => opt.value === status.toUpperCase())) {
      setStatusFilter(status.toUpperCase());
    }
    if (!id) return;
    void (async () => {
      const res = await getOutboxLogByIdAction(id);
      if (!res.success || !res.data) return;
      const entry = toEntry(res.data);
      setPinnedEntry(entry);
      if (entry.channel === 'SMS') setChannel('SMS');
      // Narrow the date filter to the notification's age — tightest preset whose
      // window contains the entry's timestamp, instead of an "All time" dump.
      const ts = new Date(entry.timestamp);
      const preset: DatePresetKey = Number.isNaN(ts.getTime())
        ? 'all'
        : ts.getTime() >= startOfDay(new Date()).getTime() ? 'today'
        : ts.getTime() >= startOfDay(new Date(Date.now() - 86400000)).getTime() ? 'yesterday'
        : ts.getTime() >= startOfDay(new Date(Date.now() - 2 * 86400000)).getTime() ? 'last3'
        : ts.getTime() >= startOfDay(new Date(Date.now() - 6 * 86400000)).getTime() ? 'last7'
        : ts.getTime() >= startOfDay(new Date(Date.now() - 14 * 86400000)).getTime() ? 'last15'
        : ts.getTime() >= startOfDay(new Date(Date.now() - 29 * 86400000)).getTime() ? 'last30'
        : 'all';
      setDateRange(rangeForPreset(preset));
      window.history.replaceState(null, '', window.location.pathname);
    })();
  }, []);

  const fetchLogs = useCallback(async (mode: 'reset' | 'next' | 'prev') => {
    const id = ++requestId.current;
    if (mode === 'reset') setEntries([]); // show skeleton instead of stale rows
    setLoading(true);
    setError(null);

    let cursor: string | null = null;
    if (mode === 'next') cursor = nextCursorRef.current;
    if (mode === 'prev') cursor = prevCursorsRef.current[prevCursorsRef.current.length - 1] ?? null;

    try {
      const res = await getOutboxLogsPageAction({
        limit: 25,
        cursor,
        status: statusFilter === 'ALL' ? undefined : statusFilter === 'SENT' ? 'PROCESSED' : (statusFilter as 'FAILED' | 'PENDING' | 'PROCESSING'),
        search: searchTerm || undefined,
        channel,
        dateFrom: dateRange.fromISO,
        dateTo: dateRange.toISO,
      });
      if (id !== requestId.current) return;
      if (!res.success || !res.data) throw new Error(res.error || 'Could not load delivery logs.');

      setEntries(res.data.items.map(toEntry));
      setTotal(res.data.total ?? res.data.items.length);
      nextCursorRef.current = res.data.nextCursor;
      setHasMore(res.data.hasMore);
      prevCursorsRef.current =
        mode === 'reset' ? [] : mode === 'next' ? [...prevCursorsRef.current, cursor].filter((c): c is string => Boolean(c)) : prevCursorsRef.current.slice(0, -1);
      setPrevPageCount(prevCursorsRef.current.length);
    } catch (cause) {
      if (id === requestId.current) setError(cause instanceof Error ? cause.message : 'Could not load delivery logs.');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [statusFilter, channel, searchTerm, dateRange]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchLogs('reset'); }, 250);
    return () => window.clearTimeout(timer);
  }, [fetchLogs]);

  const handleResend = async (id: string) => {
    setResendingId(id);
    const res = await resendEmailAction({ id });
    if (res.error) {
      addToast(res.error, 'error');
    } else {
      addToast('Communication re-queued for dispatch.', 'success');
      await fetchLogs('reset');
    }
    setResendingId(null);
  };

  return (
    <div
      className="flex flex-col gap-6 flex-1 min-h-0 p-6 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      style={{ scrollbarWidth: 'thin' }}
      data-lenis-prevent
    >
      {/* Header */}
      <div className="flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">Delivery Logs</h1>
            <p className="text-xs text-text-muted">
              Email and SMS dispatch records across the clinic.
            </p>
          </div>

          {/* Channel Switch */}
        <div className="relative grid grid-cols-2 w-fit bg-muted/20 p-1 rounded-xl border border-card-border/60">
          <span
            aria-hidden
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-primary shadow-sm transition-transform duration-200 ease-out ${channel === 'SMS' ? 'translate-x-full' : ''}`}
          />
          {(['EMAIL', 'SMS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setChannel(tab); setEntries([]); }}
              aria-pressed={channel === tab}
              title={`Show ${tab === 'EMAIL' ? 'Email Logs' : 'SMS Logs'}`}
              className={`relative z-10 flex items-center justify-center gap-1.5 h-8 px-6 text-xs font-semibold rounded-lg transition-colors ${
                channel === tab ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'EMAIL' ? <Mail className="size-3.5" /> : <MessageSquare className="size-3.5" />}
              {tab === 'EMAIL' ? 'Email Logs' : 'SMS Logs'}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 shrink-0">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search recipient or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm bg-card w-full"
          />
        </div>

        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={STATUS_OPTIONS}
            className="w-full h-9 !py-0 bg-card"
          />

          <DropdownMenu open={dateMenuOpen} onOpenChange={setDateMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 justify-start w-full min-w-0 text-foreground text-sm"
              >
                <span className="flex-1 min-w-0 truncate text-left">{dateRange.label}</span>
                <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[21rem] max-w-[calc(100vw-2rem)] p-2" data-lenis-prevent>
            <div className="flex gap-2">
              <div className="flex flex-col gap-0.5 w-28 shrink-0">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => { setDateRange(rangeForPreset(preset.key)); setDateMenuOpen(false); }}
                    className={`text-left text-xs px-2.5 py-2 rounded-md transition-colors ${
                      dateRange.preset === preset.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <Calendar
                  mode="range"
                  selected={dateRange.from ? { from: dateRange.from, to: dateRange.to ?? dateRange.from } : undefined}
                  onSelect={(range) => {
                    if (range?.from) setDateRange(rangeForPreset('custom', range.from, range.to ?? range.from));
                  }}
                  classNames={{
                    head_cell: 'text-muted-foreground rounded-md w-7 font-normal text-[0.7rem]',
                    cell: 'h-7 w-7 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-transparent [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                    day: cn(buttonVariants({ variant: 'ghost' }), 'h-7 w-7 p-0 font-normal aria-selected:opacity-100'),
                    day_range_start: '!bg-slate-900 !text-white hover:!bg-slate-900 hover:!text-white rounded-md',
                    day_range_end: '!bg-emerald-600 !text-white hover:!bg-emerald-600 hover:!text-white rounded-md',
                    day_range_middle: 'aria-selected:bg-transparent aria-selected:text-foreground',
                    day_today: 'border border-slate-900 text-slate-900 font-semibold bg-transparent [&.day-selected]:!bg-slate-900 [&.day-selected]:!text-white [&.day-selected]:ring-2 [&.day-selected]:ring-offset-1 [&.day-selected]:ring-white',
                    caption_label: 'text-xs font-medium',
                  }}
                />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          variant="outline"
          onClick={() => void fetchLogs('reset')}
          disabled={loading}
          className="h-10 w-10 p-0 bg-card text-muted-foreground hover:text-foreground self-center shrink-0"
          title="Refresh logs"
        >
          <RotateCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col gap-3 min-h-0">
        {loading && entries.length === 0 ? (
          <SecretaryListSkeletonTheme>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-sm font-bold text-foreground border-b border-card-border/40">
                  <th className="py-2 pr-3 font-semibold">Type</th>
                  <th className="py-2 pr-3 font-semibold">To</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 pr-3 font-semibold">Auto-Retry</th>
                  <th className="py-2 pl-2 text-right font-semibold">Sent</th>
                  <th className="py-2 pl-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 7 }, (_, i) => (
                  <tr key={i} className="border-b border-card-border/40 last:border-b-0">
                    <td className="py-2.5 pr-3 max-w-[130px]"><SecretaryListSkeleton width={120} height={16} /></td>
                    <td className="py-2.5 pr-3 max-w-[160px]"><SecretaryListSkeleton width={140} height={16} /></td>
                    <td className="py-2.5 pr-3"><SecretaryListSkeleton width={56} height={16} borderRadius="9999px" /></td>
                    <td className="py-2.5 pr-3"><SecretaryListSkeleton width={32} height={16} /></td>
                    <td className="py-2.5 pl-2 text-right"><div className="flex justify-end"><SecretaryListSkeleton width={64} height={16} /></div></td>
                    <td className="py-2.5 pl-2 w-10"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SecretaryListSkeletonTheme>
        ) : error && entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-card-border/60 rounded-xl">
            <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <Inbox className="size-5 text-destructive/70" />
            </div>
            <p className="text-xs font-medium text-foreground">Could not load delivery logs</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void fetchLogs('reset')} className="mt-3 h-8 text-xs">Retry</Button>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="size-10 rounded-full bg-muted/20 flex items-center justify-center mb-2">
              <Inbox className="size-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground">No delivery logs found</p>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-[220px]">
              Try adjusting your filters.
            </p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-sm font-bold text-foreground border-b border-card-border/40">
                  <th className="py-2 pr-3 font-semibold">Type</th>
                  <th className="py-2 pr-3 font-semibold">To</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 pr-3 font-semibold">Auto-Retry</th>
                  <th className="py-2 pl-2 text-right font-semibold">Sent</th>
                  <th className="py-2 pl-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {pinnedEntry && (
                  <DeliveryLogRow
                    entry={pinnedEntry}
                    isPinned
                    resendingId={resendingId}
                    onResend={(entryId) => void handleResend(entryId)}
                    onViewError={setViewingError}
                  />
                )}
                {entries
                  .filter((entry) => !pinnedEntry || entry.id !== pinnedEntry.id)
                  .map((entry) => (
                    <DeliveryLogRow
                      key={entry.id}
                      entry={entry}
                      resendingId={resendingId}
                      onResend={(entryId) => void handleResend(entryId)}
                      onViewError={setViewingError}
                    />
                  ))}
              </tbody>
            </table>

            {(prevPageCount > 0 || hasMore) && (
              <div className="flex items-center justify-between pt-3 pb-4 mb-2 border-t border-card-border/40 shrink-0">
                <span className="text-sm text-muted-foreground">
                  Page {prevPageCount + 1} of {Math.max(1, Math.ceil(total / 25))} · Showing {entries.length} of {total}
                </span>
                <div className="flex items-center gap-1.5 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void fetchLogs('prev')}
                    disabled={prevPageCount === 0 || loading}
                    className="h-8 px-2.5 text-sm gap-1 text-muted-foreground hover:text-foreground"
                    title="Newer logs"
                  >
                    <ChevronLeft className="size-4" /> Newer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void fetchLogs('next')}
                    disabled={!hasMore || loading}
                    className="h-8 px-2.5 text-sm gap-1 text-muted-foreground hover:text-foreground"
                    title="Older logs"
                  >
                    Older <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {viewingError && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Failure Error Log"
          onClick={() => setViewingError(null)}
          onKeyDown={(e) => { if (e.key === 'Escape') setViewingError(null); }}
        >
          <div
            className="bg-card border border-card-border rounded-2xl p-6 max-w-lg w-full flex flex-col gap-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingError(null)}
              className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-full"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-destructive" />
              <h2 className="text-sm font-bold text-foreground">Failure Error Log</h2>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">To: <span className="text-foreground font-medium">{viewingError.recipient}</span></span>
              <span className="text-muted-foreground">{viewingError.type} · {viewingError.retryCount} of 3 attempts</span>
            </div>
            <pre className="text-[11px] font-mono text-rose-600 dark:text-rose-400 bg-destructive/5 border border-destructive/20 rounded-xl p-4 whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
              {viewingError.errorLogs}
            </pre>
            <Button
              onClick={() => setViewingError(null)}
              variant="outline"
              className="w-full text-xs h-9"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
