// src/modules/staff/views/secretary/secretary-delivery-log-view.tsx
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mail, MessageSquare, Search, ChevronLeft, ChevronRight, RotateCw, Inbox, MoreHorizontal } from 'lucide-react';
import { getOutboxLogsPageAction } from '@/modules/emails/actions/logs/get-outbox-logs-page.action';
import { resendEmailAction } from '@/modules/emails/actions/logs/resend-email.action';
import { useToast } from '@/components/feedback/toast-container';
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
  'APPOINTMENT_NO_SHOW': 'Missed Appointment (No-show)',
  'APPOINTMENT_NO_SHOW_SMS': 'Missed Appointment (No-show)',
  'REJECT_INQUIRY': 'Inquiry Rejected / Declined',
  'PATIENT_REGISTERED': 'Registration OTP',
  'PASSWORD_RESET_REQUESTED': 'Password Reset OTP',
};

function formatTimeFull(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

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
  timestamp: string;
}

function toEntry(log: OutboxLogResponseDto): DeliveryEntry {
  const isSms = log.eventType.endsWith('_SMS') || log.eventType.includes('SMS');
  const payload = (log.payload || {}) as Record<string, any>;
  const recipient = isSms
    ? payload.phone || payload.mobileNumber || payload.phoneNumber || payload.recipientPhone || payload.guestPhone || payload.to || payload.email || 'System Automated Dispatch'
    : payload.email || payload.guestEmail || payload.recipientEmail || payload.to || payload.recipient || payload.phoneNumber || payload.phone || payload.mobileNumber || payload.guestPhone || 'System Automated Dispatch';
  return {
    id: log.id,
    channel: isSms ? 'SMS' : 'EMAIL',
    type: EVENT_NAME_MAP[log.eventType] || log.eventType,
    status: log.status === 'PROCESSED' ? 'SENT' : log.status,
    recipient,
    timestamp: log.createdAt,
  };
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
  const [dateRange, setDateRange] = useState<DateRange>({ label: 'All time', preset: 'all' });
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [prevPageCount, setPrevPageCount] = useState(0);

  const nextCursorRef = useRef<string | null>(null);
  const prevCursorsRef = useRef<string[]>([]);
  const requestId = useRef(0);

  const fetchLogs = useCallback(async (mode: 'reset' | 'next' | 'prev') => {
    const id = ++requestId.current;
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
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">Delivery Logs</h1>
          <p className="text-xs text-text-muted">
            Email and SMS dispatch records across the clinic.
          </p>
        </div>

        {/* Channel Tabs */}
        <div className="flex w-fit gap-1 bg-muted/20 p-1 rounded-xl">
          {(['EMAIL', 'SMS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setChannel(tab)}
              className={`flex items-center gap-1.5 h-9 px-6 text-xs font-semibold rounded-lg transition-colors ${
                channel === tab ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'EMAIL' ? <Mail className="size-3.5" /> : <MessageSquare className="size-3.5" />}
              {tab === 'EMAIL' ? 'Email Logs' : 'SMS Logs'}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search recipient or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9 text-xs bg-card w-full"
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
                className="h-9 justify-start w-full min-w-0 text-foreground"
              >
                <span className="truncate">{dateRange.label}</span>
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[27rem] max-w-[calc(100vw-2rem)] p-2" data-lenis-prevent>
            <div className="flex gap-2">
              <div className="flex flex-col gap-0.5 w-36 shrink-0">
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
                  className="rounded-xl border border-card-border/60"
                />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => void fetchLogs('reset')}
          disabled={loading}
          className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground self-center shrink-0"
          title="Refresh logs"
        >
          <RotateCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col gap-3 min-h-0">
        {loading && entries.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-muted/30 border border-card-border p-3 flex gap-3 animate-pulse">
                <div className="size-8 rounded-lg bg-muted/30 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 rounded bg-muted/40" />
                  <div className="h-3 w-60 rounded bg-muted/30" />
                </div>
              </div>
            ))}
          </div>
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
          <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-card-border/60 rounded-xl">
            <div className="size-10 rounded-full bg-muted/20 flex items-center justify-center mb-2">
              <Inbox className="size-5 text-muted-foreground/50" />
            </div>
            <p className="text-xs font-medium text-foreground">No delivery logs found</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">
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
                  <th className="py-2 pl-2 text-right font-semibold">Time</th>
                  <th className="py-2 pl-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-card-border/40 last:border-b-0 hover:bg-muted/20 transition-colors">
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
                    <td className="py-2.5 pl-2 text-right text-sm text-muted-foreground font-mono whitespace-nowrap">
                      {formatTimeFull(entry.timestamp)}
                    </td>
                    <td className="py-2.5 pl-2 text-right whitespace-nowrap">
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
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            disabled={entry.status === 'PROCESSING'}
                            onClick={() => void handleResend(entry.id)}
                            className="text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <RotateCw className="size-3 text-muted-foreground" />
                            {entry.status === 'FAILED' ? 'Retry' : entry.status === 'SENT' ? 'Resend' : 'Send Again'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(prevPageCount > 0 || hasMore) && (
              <div className="flex items-center justify-between pt-3 pb-4 mb-2 border-t border-card-border/40 shrink-0">
                <span className="text-[11px] text-muted-foreground">
                  Page {prevPageCount + 1} of {Math.max(1, Math.ceil(total / 25))}
                </span>
                <div className="flex items-center gap-1.5 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void fetchLogs('prev')}
                    disabled={prevPageCount === 0 || loading}
                    className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                    title="Newer logs"
                  >
                    <ChevronLeft className="size-3.5" /> Newer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void fetchLogs('next')}
                    disabled={!hasMore || loading}
                    className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                    title="Older logs"
                  >
                    Older <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
