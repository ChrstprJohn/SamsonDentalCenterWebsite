'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSecretary } from '../use-secretary';
import { getOutboxLogsAction } from '@/modules/emails/actions/logs/get-outbox-logs.action';
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

  const fetchLogs = async () => {
    setIsLoading(true);
    const res = await getOutboxLogsAction();
    if (res.success && res.data) {
      const mapped: EmailLog[] = res.data.map((log: any) => ({
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
      setLiveEmails(mapped);
    } else {
      setLiveEmails([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

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
    const res = await resendEmailAction({ id });
    if (res.error) {
      alert(res.error);
      await fetchLogs();
    } else {
      alert('Email resent successfully!');
      await fetchLogs();
    }
    setResendingId(null);
  };

  const handleRetryAllFailed = async () => {
    const failedEmails = filteredEmails.filter((e) => e.status === 'Failed');
    if (failedEmails.length === 0) {
      alert('No failed emails to retry.');
      return;
    }

    setIsRetryingAll(true);
    let successCount = 0;
    for (const eml of failedEmails) {
      const res = await resendEmailAction({ id: eml.id });
      if (!res.error) successCount++;
    }
    alert(`Batch retry complete. ${successCount}/${failedEmails.length} resent successfully.`);
    await fetchLogs();
    setIsRetryingAll(false);
  };

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
    refreshLogs: fetchLogs,
    resendingId,
    isRetryingAll,
    isLoading,
    onlyAppointments,
    setOnlyAppointments,
  };
}


