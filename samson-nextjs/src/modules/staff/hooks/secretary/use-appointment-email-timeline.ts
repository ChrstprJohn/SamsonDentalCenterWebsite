/**
 * @deprecated Communication History feature removed from UI.
 * Failed notifications are resent via the Notification Lifecycle tab in the
 * appointment detail pane (AppointmentNotificationsTab). Kept for reference only.
 */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCommunicationSummaryPageAction } from '@/modules/emails/actions/logs/get-communication-summary-page.action';
import { getCommunicationSummaryCountsAction } from '@/modules/emails/actions/logs/get-communication-summary-counts.action';
import { getAppointmentCommunicationPageAction } from '@/modules/emails/actions/logs/get-appointment-communication-page.action';
import { resendEmailAction } from '@/modules/emails/actions/logs/resend-email.action';
import type { AppointmentCommunicationSummaryDto } from '@/modules/emails/repositories/logs/appointment-communication-page.queries';

export type LeftTab = 'all' | 'failed' | 'inquiries';

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
  payload?: Record<string, any>;
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
  const [emailLogs, setEmailLogs] = useState<AppointmentCommunicationSummaryDto[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isRefreshingApps, setIsRefreshingApps] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<LeftTab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabCounts, setTabCounts] = useState({ all: 0, failed: 0, inquiries: 0 });
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
  const tabCacheRef = useRef<Partial<Record<LeftTab, { items: AppointmentCardData[]; nextCursor: string | null; hasMore: boolean; total: number }>>>({});

  const queryRef = useRef({ leftTab, searchTerm });
  const isPristineQuery = () => {
    const q = queryRef.current;
    return !q.searchTerm;
  };
  queryRef.current = { leftTab, searchTerm };

  const fetchAppointments = useCallback(async (options?: { append?: boolean; force?: boolean }) => {
    const append = options?.append === true;
    const force = options?.force === true;

    if (!append && !force && isPristineQuery()) {
      const cached = tabCacheRef.current[queryRef.current.leftTab];
      if (cached) {
        setAppointmentCards(cached.items);
        summaryCursorRef.current = cached.nextCursor;
        setSummaryHasMore(cached.hasMore);
        setTabCounts((previous) => ({ ...previous, [queryRef.current.leftTab]: cached.total }));
        setAppsError(null);
        return;
      }
    }

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
    const currentTab = queryRef.current.leftTab;
    try {
      if (currentTab === 'inquiries') {
        const { getOutboxLogsPageAction } = await import('@/modules/emails/actions/logs/get-outbox-logs-page.action');
        const outboxRes = await getOutboxLogsPageAction({
          limit: 25,
          cursor: append ? summaryCursorRef.current : null,
          category: 'INQUIRIES',
          search: queryRef.current.searchTerm || undefined,
        });
        if (requestId !== summaryRequestId.current) return;
        if (!outboxRes.success || !outboxRes.data) throw new Error(outboxRes.error || 'Could not load inquiry history.');
        const mappedCards: AppointmentCardData[] = outboxRes.data.items.map((log) => {
          const payload = (log.payload as any) || {};
          const guestName = `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || payload.patientName || payload.guestEmail || payload.email || 'Guest Inquiry';
          const label = log.eventType === 'REJECT_INQUIRY' ? 'Inquiry Declined' : 'Inquiry Received';
          return {
            id: log.id,
            patientName: guestName,
            treatmentName: label,
            date: log.createdAt.slice(0, 10),
            startTime: null,
            endTime: null,
            doctorName: '',
            channelsUsed: { email: true, sms: false },
            lastActivity: log.createdAt,
            hasFailed: log.status === 'FAILED',
            failureCount: log.retryCount || 0,
            latestEventPreview: `${label} → ${payload.email || payload.recipientEmail || 'guest'}`,
          };
        });

        setAppointmentCards((previous) => append
          ? [...previous, ...mappedCards.filter((item) => !previous.some((existing) => existing.id === item.id))]
          : mappedCards);
        summaryCursorRef.current = outboxRes.data.nextCursor;
        setSummaryHasMore(outboxRes.data.hasMore);
        const total = outboxRes.data.total ?? mappedCards.length;
        if (!append) {
          setTabCounts((prev) => ({ ...prev, inquiries: total }));
        }

        if (!append && isPristineQuery()) {
          tabCacheRef.current[currentTab] = {
            items: mappedCards,
            nextCursor: outboxRes.data.nextCursor,
            hasMore: outboxRes.data.hasMore,
            total,
          };
        }
      } else {
        const activeParams = {
          limit: 25,
          cursor: append ? summaryCursorRef.current : null,
          tab: currentTab,
          search: queryRef.current.searchTerm || undefined,
        } as const;
        const [activeResult, countResult] = append
          ? [await getCommunicationSummaryPageAction(activeParams), null]
          : await Promise.all([
            getCommunicationSummaryPageAction(activeParams),
            getCommunicationSummaryCountsAction({ search: queryRef.current.searchTerm || undefined }),
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

        const currentTotal = countResult?.data ? (countResult.data as any)[currentTab] : activeResult.data.items.length;
        if (!append) {
          setTabCounts((prev) => ({
            all: countResult?.data?.all ?? prev.all,
            failed: countResult?.data?.failed ?? prev.failed,
            inquiries: prev.inquiries,
          }));
        }

        if (!append && isPristineQuery()) {
          tabCacheRef.current[currentTab] = {
            items: activeResult.data.items,
            nextCursor: activeResult.data.nextCursor,
            hasMore: activeResult.data.hasMore,
            total: currentTotal,
          };
        }
      }
      hasLoadedSummary.current = true;
      if (!append) setLastRefreshedAt(new Date());
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
  }, []);

  useEffect(() => {
    if (isPristineQuery()) {
      const cached = tabCacheRef.current[leftTab];
      if (cached) {
        setAppointmentCards(cached.items);
        summaryCursorRef.current = cached.nextCursor;
        setSummaryHasMore(cached.hasMore);
        setTabCounts((previous) => ({ ...previous, [leftTab]: cached.total }));
        setAppsError(null);
        return;
      }
    }
    const timer = window.setTimeout(() => { void fetchAppointments(); }, 250);
    return () => window.clearTimeout(timer);
  }, [leftTab, searchTerm, fetchAppointments]);

  useEffect(() => {
    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') void fetchAppointments({ force: true });
    };
    document.addEventListener('visibilitychange', refreshOnVisible);
    return () => document.removeEventListener('visibilitychange', refreshOnVisible);
  }, [fetchAppointments]);

  const selectTab = useCallback((tab: LeftTab) => {
    setLeftTab(tab);
    setSelectedAppointmentId(null);
    if (isPristineQuery()) {
      const cached = tabCacheRef.current[tab];
      if (cached) {
        setAppointmentCards(cached.items);
        summaryCursorRef.current = cached.nextCursor;
        setSummaryHasMore(cached.hasMore);
        setTabCounts((previous) => ({ ...previous, [tab]: cached.total }));
        setAppsError(null);
        return;
      }
    }
    void fetchAppointments();
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
      if (leftTab === 'inquiries') {
        const { getOutboxLogByIdAction } = await import('@/modules/emails/actions/logs/get-outbox-log-by-id.action');
        const res = await getOutboxLogByIdAction(appointmentId);
        if (requestId !== timelineRequestId.current) return;
        if (!res.success || !('data' in res)) throw new Error((res as any).error || 'Could not load inquiry detail.');
        const singleItem: AppointmentCommunicationSummaryDto = {
          id: res.data.id,
          channel: res.data.eventType.endsWith('_SMS') ? 'SMS' : 'EMAIL',
          eventType: res.data.eventType,
          status: res.data.status === 'PROCESSED' ? 'PROCESSED' : res.data.status,
          recipient: (res.data.payload as any)?.email || (res.data.payload as any)?.guestEmail || (res.data.payload as any)?.recipientEmail || 'guest',
          createdAt: res.data.createdAt,
          retryCount: res.data.retryCount || 0,
          errorLogs: res.data.errorLogs || null,
          payload: res.data.payload,
        };
        setEmailLogs([singleItem]);
        timelineCursorRef.current = null;
        setTimelineHasMore(false);
      } else {
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
      }
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
  }, [leftTab]);

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
    if (selectedAppointmentId && !isLoadingApps && !selectedAppointment) setSelectedAppointmentId(null);
  }, [selectedAppointment, selectedAppointmentId, isLoadingApps]);

  const resendEmail = useCallback(async (id: string) => {
    setResendingId(id);
    try {
      const res = await resendEmailAction({ id });
      if (res?.error) setLogsError(res.error);
      if (selectedAppointmentId) await fetchEmailLogs(selectedAppointmentId);
      await fetchAppointments({ force: true });
    } finally {
      setResendingId(null);
    }
  }, [fetchAppointments, fetchEmailLogs, selectedAppointmentId]);

  const timelineEntries: TimelineEntry[] = useMemo(() => emailLogs.map((log) => ({
    id: log.id,
    channel: log.channel,
    eventType: log.eventType,
    status: log.status === 'PROCESSED' ? 'Sent' : log.status === 'FAILED' ? 'Failed' : 'Pending',
    rawStatus: log.status,
    recipient: log.recipient,
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
    lastRefreshedAt,
    isLoadingLogs,
    appsError,
    logsError,
    resendEmail,
    resendingId,
    leftTab,
    setLeftTab,
    selectTab,
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
    refresh: (options?: { force?: boolean }) => fetchAppointments(options ?? { force: true }),
    refreshTimeline: selectedAppointmentId ? () => fetchEmailLogs(selectedAppointmentId) : undefined,
  };
}
