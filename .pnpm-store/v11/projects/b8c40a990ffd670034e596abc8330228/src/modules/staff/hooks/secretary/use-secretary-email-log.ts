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

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      const res = await getOutboxLogsAction();
      console.log('Email logs response:', res);
      if (res.success && res.data) {
        // Map database outbox fields to EmailLog view schema fields
        const mapped: EmailLog[] = res.data.map((log: any) => ({
          id: log.id,
          recipient: (log.payload as any)?.email || (log.payload as any)?.guestEmail || 'system',
          subject: log.eventType,
          type: log.eventType,
          timestamp: log.createdAt,
          status: log.status === 'PROCESSED' ? 'Sent' : log.status === 'FAILED' ? 'Failed' : 'Pending',
          content: JSON.stringify(log.payload, null, 2),
        }));
        setLiveEmails(mapped);
      } else {
        setLiveEmails([]);
      }
      setIsLoading(false);
    }
    fetchLogs();
  }, []);

  const selectedEmail = useMemo(
    () => liveEmails.find((email) => email.id === selectedEmailId) ?? null,
    [liveEmails, selectedEmailId]
  );

  const filteredEmails = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return liveEmails.filter((email) => {
      const matchesSearch =
        email.recipient.toLowerCase().includes(normalizedSearch) ||
        email.subject.toLowerCase().includes(normalizedSearch);
      
      const matchesStatus =
        statusFilter === 'ALL' || email.status.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [liveEmails, searchTerm, statusFilter]);

  const handleResend = async (id: string) => {
    setResendingId(id);
    const res = await resendEmailAction({ id });
    if (res.error) {
      alert(res.error);
      // Refresh logs to show updated status
      const refreshRes = await getOutboxLogsAction();
      if (refreshRes.success && refreshRes.data) {
        const mapped: EmailLog[] = refreshRes.data.map((log: any) => ({
          id: log.id,
          recipient: (log.payload as any)?.email || (log.payload as any)?.guestEmail || 'system',
          subject: log.eventType,
          type: log.eventType,
          timestamp: log.createdAt,
          status: log.status === 'PROCESSED' ? 'Sent' : log.status === 'FAILED' ? 'Failed' : 'Pending',
          content: JSON.stringify(log.payload, null, 2),
        }));
        setLiveEmails(mapped);
      }
    } else {
      alert('Email resent successfully!');
      setLiveEmails((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'Sent' } : e))
      );
    }
    setResendingId(null);
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
    resendingId,
    isLoading,
  };
}


