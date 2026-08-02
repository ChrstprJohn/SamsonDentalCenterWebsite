'use client';

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useSecretary } from '../use-secretary';
import { getOutboxLogsPageAction } from '@/modules/emails/actions/logs/get-outbox-logs-page.action';
import { resendEmailAction } from '@/modules/emails/actions/logs/resend-email.action';
import { EmailLog } from '../../types/secretary.types';

export function useSecretaryEmailLog() {
  const { emails: mockEmails } = useSecretary();
  const [liveEmails, setLiveEmails] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [isRetryingAll, setIsRetryingAll] = useState(false);
  const [onlyAppointments, setOnlyAppointments] = useState(true);
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
        channel: 'EMAIL',
        onlyAppointments,
      });
      if (requestId !== latestRequestId.current) return;
      if (!res.success || !res.data) throw new Error(res.error || 'Could not load email logs.');
      const mapped: EmailLog[] = res.data.items.map((log) => ({
        id: log.id,
        recipient: (log.payload as any)?.email || (log.payload as any)?.guestEmail || 'system',
        subject: log.eventType,
        type: log.eventType,
        timestamp: log.createdAt,
        status: log.status === 'PROCESSED' ? 'Sent' : log.status === 'FAILED' ? 'Failed' : 'Pending',
        rawStatus: log.status,
        content: JSON.stringify(log.payload, null, 2),
        errorLogs: log.errorLogs || null,
        retryCount: log.retryCount || 0,
      }));
      setLiveEmails((previous) => append
        ? [...previous, ...mapped.filter((item) => !previous.some((existing) => existing.id === item.id))]
        : mapped);
      nextCursorRef.current = res.data.nextCursor;
      setNextCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    } catch (cause) {
      if (requestId === latestRequestId.current) {
        if (append) setLoadMoreError(cause instanceof Error ? cause.message : 'Could not load more email logs.');
        else setError(cause instanceof Error ? cause.message : 'Could not load email logs.');
      }
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
        loadingMoreRef.current = false;
      }
    }
  }, [onlyAppointments, searchTerm, statusFilter]);

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

  const selectedEmail = useMemo(
    () => liveEmails.find((email) => email.id === selectedEmailId) ?? null,
    [liveEmails, selectedEmailId]
  );

  const AUTH_EVENT_TYPES = ['PATIENT_REGISTERED', 'PASSWORD_RESET_REQUESTED'];

  const filteredEmails = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return liveEmails.filter((email) => {
      // Filter out auth events if onlyAppointments is enabled
      if (onlyAppointments && AUTH_EVENT_TYPES.includes(email.type)) {
        return false;
      }

      const matchesSearch =
        email.recipient.toLowerCase().includes(normalizedSearch) ||
        email.subject.toLowerCase().includes(normalizedSearch);
      
      const matchesStatus =
        statusFilter === 'ALL' || email.status.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [liveEmails, searchTerm, statusFilter, onlyAppointments]);

  const handleResend = async (id: string) => {
    setResendingId(id);
    try {
      const res = await resendEmailAction({ id });
      if (res.error) {
        setToast({ message: res.error, type: 'error' });
      } else {
        setToast({ message: 'Email resent successfully!', type: 'success' });
      }
      await fetchLogs();
    } catch (cause) {
      setToast({ message: cause instanceof Error ? cause.message : 'Could not resend email.', type: 'error' });
    } finally {
      setResendingId(null);
    }
  };

  const handleRetryAllFailed = async () => {
    const failedEmails = filteredEmails.filter((e) => e.status === 'Failed');
    if (failedEmails.length === 0) {
      setToast({ message: 'No failed emails to retry.', type: 'error' });
      return;
    }

    setIsRetryingAll(true);
    let successCount = 0;
    for (const eml of failedEmails) {
      const res = await resendEmailAction({ id: eml.id });
      if (!res.error) successCount++;
    }
    setToast({ message: `Batch retry complete. ${successCount}/${failedEmails.length} resent successfully.`, type: successCount === failedEmails.length ? 'success' : 'error' });
    await fetchLogs();
    setIsRetryingAll(false);
  };

  const loadMore = useCallback(() => { void fetchLogs({ append: true }); }, [fetchLogs]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedEmailId,
    setSelectedEmailId,
    selectedEmail,
    filteredEmails,
    handleResend,
    handleRetryAllFailed,
    refreshLogs: () => fetchLogs(),
    resendingId,
    isRetryingAll,
    isLoading,
    error,
    toast,
    onlyAppointments,
    setOnlyAppointments,
    hasMore,
    isLoadingMore,
    loadMoreError,
    loadMore,
  };
}


