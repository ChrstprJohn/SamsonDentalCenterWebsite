'use client';

import { useMemo, useState, useEffect } from 'react';
import { getOutboxLogsAction } from '@/modules/emails/actions/logs/get-outbox-logs.action';
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

  const fetchLogs = async () => {
    setIsLoading(true);
    const res = await getOutboxLogsAction();
    if (res.success && res.data) {
      // Filter for SMS events
      const smsEvents = res.data.filter((log: any) => 
        log.eventType?.endsWith('_SMS') || 
        !!(log.payload as any)?.phone || 
        !!(log.payload as any)?.mobileNumber
      );

      const mapped: SmsLog[] = smsEvents.map((log: any) => {
        const payload = (log.payload as any) || {};
        const recipientPhone = payload.phone || payload.mobileNumber || payload.recipientPhone || payload.email || 'system';

        return {
          id: log.id,
          recipient: recipientPhone,
          subject: log.eventType,
          type: log.eventType,
          timestamp: log.createdAt,
          status: log.status === 'PROCESSED' ? 'Sent' : log.status === 'FAILED' ? 'Failed' : 'Pending',
          rawStatus: log.status,
          content: JSON.stringify(log.payload, null, 2),
          errorLogs: log.errorLogs || null,
          retryCount: log.retryCount || 0,
        };
      });

      setLiveSmsLogs(mapped);
    } else {
      setLiveSmsLogs([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

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
    const res = await resendEmailAction({ id });
    if (res.error) {
      alert(res.error);
      await fetchLogs();
    } else {
      alert('SMS dispatch triggered successfully!');
      await fetchLogs();
    }
    setResendingId(null);
  };

  const handleRetryAllFailed = async () => {
    const failedSms = filteredSmsLogs.filter((e) => e.status === 'Failed');
    if (failedSms.length === 0) {
      alert('No failed SMS dispatches to retry.');
      return;
    }

    setIsRetryingAll(true);
    let successCount = 0;
    for (const sms of failedSms) {
      const res = await resendEmailAction({ id: sms.id });
      if (!res.error) successCount++;
    }
    alert(`Batch retry complete. ${successCount}/${failedSms.length} dispatched successfully.`);
    await fetchLogs();
    setIsRetryingAll(false);
  };

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
    refreshLogs: fetchLogs,
    resendingId,
    isRetryingAll,
    isLoading,
  };
}
