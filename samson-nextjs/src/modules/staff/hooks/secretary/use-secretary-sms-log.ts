'use client';

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { getOutboxLogsPageAction } from '@/modules/emails/actions/logs/get-outbox-logs-page.action';
import { resendEmailAction } from '@/modules/emails/actions/logs/resend-email.action';

export interface SmsLog {
  id: string;
  recipient: string; // phone number or recipient
  subject: string;
  type: string;
  timestamp: string;
  status: 'Sent' | 'Failed' | 'Pending';
  rawStatus: string;
  content: string;
  errorLogs: string | null;
  retryCount: number;
}

export function useSecretarySmsLog() {
  const [liveSmsLogs, setLiveSmsLogs] = useState<SmsLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedSmsId, setSelectedSmsId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [isRetryingAll, setIsRetryingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const latestRequestId = useRef(0);
  const nextCursorRef = useRef<string | null>(null);
  const loadingMoreRef = useRef(false);

  const statusForQuery = () => statusFilter === 'SENT' ? 'PROCESSED' as const : statusFilter === 'FAILED' ? 'FAILED' as const : statusFilter === 'PENDING' ? 'PENDING' as const : undefined;

  const fetchLogs = useCallback(async (options?: { append?: boolean }) => {
    const append = options?.append === true;
    if (append) {
      if (loadingMoreRef.current || !nextCursorRef.current) return;
      loadingMoreRef.current = true;
      setIsLoadingMore(true);
      setLoadMoreError(null);
    } else {
      setIsLoading(true);
      setError(null);
      setLoadMoreError(null);
      nextCursorRef.current = null;
      setNextCursor(null);
    }

    const requestId = ++latestRequestId.current;
    try {
      const res = await getOutboxLogsPageAction({
        limit: 25,
        cursor: append ? nextCursorRef.current : null,
        status: statusForQuery(),
        search: searchTerm || undefined,
        channel: 'SMS',
        onlyAppointments: false,
      });
      if (requestId !== latestRequestId.current) return;
      if (!res.success || !res.data) throw new Error(res.error || 'Could not load SMS logs.');

      const mapped: SmsLog[] = res.data.items.map((log) => {
        const payload = (log.payload as Record<string, unknown>) || {};
        const recipientPhone = payload.phone || payload.mobileNumber || payload.recipientPhone || payload.phoneNumber || payload.email || 'system';

        return {
          id: log.id,
          recipient: String(recipientPhone),
          subject: log.eventType,
          type: log.eventType,
          timestamp: log.createdAt,
          status: log.status === 'PROCESSED' ? 'Sent' : log.status === 'FAILED' ? 'Failed' : 'Pending',
          rawStatus: log.status,
          content: JSON.stringify(log.payload, null, 2),
          errorLogs: log.errorLogs,
          retryCount: log.retryCount,
        };
      });

      setLiveSmsLogs((previous) => append
        ? [...previous, ...mapped.filter((item) => !previous.some((existing) => existing.id === item.id))]
        : mapped);
      nextCursorRef.current = res.data.nextCursor;
      setNextCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    } catch (cause) {
      if (requestId === latestRequestId.current) {
        if (append) setLoadMoreError(cause instanceof Error ? cause.message : 'Could not load more SMS logs.');
        else setError(cause instanceof Error ? cause.message : 'Could not load SMS logs.');
      }
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
        loadingMoreRef.current = false;
      }
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchLogs(); }, 250);
    return () => window.clearTimeout(timer);
  }, [fetchLogs]);

  useEffect(() => {
    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') void fetchLogs();
    };
    document.addEventListener('visibilitychange', refreshOnVisible);
    return () => document.removeEventListener('visibilitychange', refreshOnVisible);
  }, [fetchLogs]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedSms = useMemo(
    () => liveSmsLogs.find((sms) => sms.id === selectedSmsId) ?? null,
    [liveSmsLogs, selectedSmsId]
  );

  const filteredSmsLogs = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return liveSmsLogs.filter((sms) => {
      const matchesSearch =
        sms.recipient.toLowerCase().includes(normalizedSearch) ||
        sms.subject.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'ALL' || sms.status.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [liveSmsLogs, searchTerm, statusFilter]);

  const handleResend = async (id: string) => {
    setResendingId(id);
    try {
      const res = await resendEmailAction({ id });
      if (res.error) {
        setToast({ message: res.error, type: 'error' });
      } else {
        setToast({ message: 'SMS dispatch triggered successfully!', type: 'success' });
      }
      await fetchLogs();
    } catch (cause) {
      setToast({ message: cause instanceof Error ? cause.message : 'Could not resend SMS.', type: 'error' });
    } finally {
      setResendingId(null);
    }
  };

  const handleRetryAllFailed = async () => {
    const failedSms = filteredSmsLogs.filter((e) => e.status === 'Failed');
    if (failedSms.length === 0) {
      setToast({ message: 'No failed SMS dispatches to retry.', type: 'error' });
      return;
    }

    setIsRetryingAll(true);
    let successCount = 0;
    for (const sms of failedSms) {
      const res = await resendEmailAction({ id: sms.id });
      if (!res.error) successCount++;
    }
    setToast({ message: `Batch retry complete. ${successCount}/${failedSms.length} dispatched successfully.`, type: successCount === failedSms.length ? 'success' : 'error' });
    await fetchLogs();
    setIsRetryingAll(false);
  };

  const loadMore = useCallback(() => { void fetchLogs({ append: true }); }, [fetchLogs]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedSmsId,
    setSelectedSmsId,
    selectedSms,
    filteredSmsLogs,
    handleResend,
    handleRetryAllFailed,
    refreshLogs: () => fetchLogs(),
    resendingId,
    isRetryingAll,
    isLoading,
    error,
    toast,
    hasMore,
    isLoadingMore,
    loadMoreError,
    loadMore,
  };
}
