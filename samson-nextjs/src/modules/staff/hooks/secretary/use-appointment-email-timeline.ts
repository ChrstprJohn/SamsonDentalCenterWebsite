'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCommunicationSummaryPageAction } from '@/modules/emails/actions/logs/get-communication-summary-page.action';
import { getAppointmentCommunicationPageAction } from '@/modules/emails/actions/logs/get-appointment-communication-page.action';
import { resendEmailAction } from '@/modules/emails/actions/logs/resend-email.action';
import type { OutboxLogResponseDto } from '@/modules/emails/dtos/logs/outbox-log-response.dto';

export type LeftTab = 'all' | 'failed';

export interface TimelineEntry {
  id: string;
  channel: 'EMAIL' | 'SMS';
  eventType: string;
  status: string;
  rawStatus: string;
  recipient: string;
  timestamp: string;
  retryCount: number;
  errorLogs: string | null;
  payload: Record<string, any>;
}

export interface AppointmentCardData {
  id: string;
  patientName: string;
  treatmentName: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  doctorName: string;
  channelsUsed: { email: boolean; sms: boolean };
  lastActivity: string | null;
  hasFailed: boolean;
  failureCount: number;
  latestEventPreview?: string;
}

export function useAppointmentEmailTimeline() {
  const [appointmentCards, setAppointmentCards] = useState<AppointmentCardData[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [emailLogs, setEmailLogs] = useState<OutboxLogResponseDto[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isRefreshingApps, setIsRefreshingApps] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<LeftTab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabCounts, setTabCounts] = useState({ all: 0, failed: 0 });
  const [summaryHasMore, setSummaryHasMore] = useState(false);
  const [summaryIsLoadingMore, setSummaryIsLoadingMore] = useState(false);
  const [summaryLoadMoreError, setSummaryLoadMoreError] = useState<string | null>(null);
  const summaryCursorRef = useRef<string | null>(null);
  const summaryLoadingMoreRef = useRef(false);
  const summaryRequestId = useRef(0);
  const hasLoadedSummary = useRef(false);
  const timelineRequestId = useRef(0);
  const timelineCursorRef = useRef<string | null>(null);
  const timelineLoadingMoreRef = useRef(false);
  const [timelineHasMore, setTimelineHasMore] = useState(false);
  const [timelineIsLoadingMore, setTimelineIsLoadingMore] = useState(false);
  const [timelineLoadMoreError, setTimelineLoadMoreError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (options?: { append?: boolean }) => {
    const append = options?.append === true;
    if (append) {
      if (summaryLoadingMoreRef.current || !summaryCursorRef.current) return;
      summaryLoadingMoreRef.current = true;
      setSummaryIsLoadingMore(true);
      setSummaryLoadMoreError(null);
    } else {
      if (hasLoadedSummary.current) setIsRefreshingApps(true);
      else setIsLoadingApps(true);
      setAppsError(null);
      setSummaryLoadMoreError(null);
      summaryCursorRef.current = null;
    }

    const requestId = ++summaryRequestId.current;
    try {
      const activeParams = {
        limit: 25,
        cursor: append ? summaryCursorRef.current : null,
        tab: leftTab,
        search: searchTerm || undefined,
      } as const;
      const [activeResult, countResult] = append
        ? [await getCommunicationSummaryPageAction(activeParams), null]
        : await Promise.all([
          getCommunicationSummaryPageAction(activeParams),
          getCommunicationSummaryPageAction({ limit: 1, cursor: null, tab: leftTab === 'all' ? 'failed' : 'all', search: searchTerm || undefined }),
        ]);

      if (requestId !== summaryRequestId.current) return;
      if (!activeResult.success || !activeResult.data) throw new Error(activeResult.error || 'Could not load communication history.');
      if (!append && countResult && (!countResult.success || !countResult.data)) {
        throw new Error(countResult.error || 'Could not load communication totals.');
      }

      setAppointmentCards((previous) => append
        ? [...previous, ...activeResult.data.items.filter((item) => !previous.some((existing) => existing.id === item.id))]
        : activeResult.data.items);
      summaryCursorRef.current = activeResult.data.nextCursor;
      setSummaryHasMore(activeResult.data.hasMore);
      if (!append) {
        const activeTotal = activeResult.data.total ?? 0;
        const otherTotal = countResult?.data?.total ?? 0;
        setTabCounts(leftTab === 'all'
          ? { all: activeTotal, failed: otherTotal }
          : { all: otherTotal, failed: activeTotal });
      }
      hasLoadedSummary.current = true;
    } catch (cause) {
      if (requestId === summaryRequestId.current) {
        if (append) setSummaryLoadMoreError(cause instanceof Error ? cause.message : 'Could not load more communication history.');
        else setAppsError(cause instanceof Error ? cause.message : 'Could not load communication history.');
      }
    } finally {
      if (requestId === summaryRequestId.current) {
        setIsLoadingApps(false);
        setIsRefreshingApps(false);
        setSummaryIsLoadingMore(false);
        summaryLoadingMoreRef.current = false;
      }
    }
  }, [leftTab, searchTerm]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchAppointments(); }, 250);
    return () => window.clearTimeout(timer);
  }, [fetchAppointments]);

  useEffect(() => {
    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') void fetchAppointments();
    };
    document.addEventListener('visibilitychange', refreshOnVisible);
    return () => document.removeEventListener('visibilitychange', refreshOnVisible);
  }, [fetchAppointments]);

  const fetchEmailLogs = useCallback(async (appointmentId: string, options?: { append?: boolean }) => {
    const append = options?.append === true;
    if (append) {
      if (timelineLoadingMoreRef.current || !timelineCursorRef.current) return;
      timelineLoadingMoreRef.current = true;
      setTimelineIsLoadingMore(true);
      setTimelineLoadMoreError(null);
    } else {
      timelineCursorRef.current = null;
      setIsLoadingLogs(true);
      setLogsError(null);
      setTimelineLoadMoreError(null);
    }

    const requestId = ++timelineRequestId.current;
    try {
      const res = await getAppointmentCommunicationPageAction({
        appointmentId,
        limit: 25,
        cursor: append ? timelineCursorRef.current : null,
      });
      if (requestId !== timelineRequestId.current) return;
      if (!res.success || !res.data) throw new Error(res.error || 'Could not load communication timeline.');
      setEmailLogs((previous) => append
        ? [...previous, ...res.data.items.filter((item) => !previous.some((existing) => existing.id === item.id))]
        : res.data.items);
      timelineCursorRef.current = res.data.nextCursor;
      setTimelineHasMore(res.data.hasMore);
    } catch (cause) {
      if (requestId === timelineRequestId.current) {
        if (append) setTimelineLoadMoreError(cause instanceof Error ? cause.message : 'Could not load more timeline entries.');
        else setLogsError(cause instanceof Error ? cause.message : 'Could not load communication timeline.');
      }
    } finally {
      if (requestId === timelineRequestId.current) {
        setIsLoadingLogs(false);
        setTimelineIsLoadingMore(false);
        timelineLoadingMoreRef.current = false;
      }
    }
  }, []);

  const selectedAppointment = useMemo(
    () => appointmentCards.find((appointment) => appointment.id === selectedAppointmentId) ?? null,
    [appointmentCards, selectedAppointmentId]
  );

  useEffect(() => {
    if (selectedAppointmentId) {
      setEmailLogs([]);
      timelineCursorRef.current = null;
      setTimelineHasMore(false);
      void fetchEmailLogs(selectedAppointmentId);
    } else {
      timelineRequestId.current += 1;
      setEmailLogs([]);
      setLogsError(null);
      setIsLoadingLogs(false);
      timelineCursorRef.current = null;
      setTimelineHasMore(false);
    }
  }, [selectedAppointmentId, fetchEmailLogs]);

  useEffect(() => {
    if (selectedAppointmentId && !selectedAppointment) setSelectedAppointmentId(null);
  }, [selectedAppointment, selectedAppointmentId]);

  const resendEmail = useCallback(async (id: string) => {
    setResendingId(id);
    try {
      const res = await resendEmailAction({ id });
      if (res?.error) setLogsError(res.error);
      if (selectedAppointmentId) await fetchEmailLogs(selectedAppointmentId);
    } finally {
      setResendingId(null);
    }
  }, [fetchEmailLogs, selectedAppointmentId]);

  const timelineEntries: TimelineEntry[] = useMemo(() => emailLogs.map((log) => ({
    id: log.id,
    channel: log.eventType.endsWith('_SMS') || Boolean((log.payload as any)?.phoneNumber || (log.payload as any)?.phone) ? 'SMS' as const : 'EMAIL' as const,
    eventType: log.eventType,
    status: log.status === 'PROCESSED' ? 'Sent' : log.status === 'FAILED' ? 'Failed' : 'Pending',
    rawStatus: log.status,
    recipient: (log.payload as any)?.email || (log.payload as any)?.guestEmail || (log.payload as any)?.phoneNumber || (log.payload as any)?.phone || 'system',
    timestamp: log.createdAt,
    retryCount: log.retryCount,
    errorLogs: log.errorLogs || null,
    payload: log.payload,
  })), [emailLogs]);

  return {
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
    hasMore: summaryHasMore,
    isLoadingMore: summaryIsLoadingMore,
    loadMoreError: summaryLoadMoreError,
    loadMore: () => { void fetchAppointments({ append: true }); },
    timelineHasMore,
    timelineIsLoadingMore,
    timelineLoadMoreError,
    loadMoreTimeline: () => selectedAppointmentId && void fetchEmailLogs(selectedAppointmentId, { append: true }),
    refresh: () => fetchAppointments(),
    refreshTimeline: selectedAppointmentId ? () => fetchEmailLogs(selectedAppointmentId) : undefined,
  };
}
