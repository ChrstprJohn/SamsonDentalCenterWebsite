'use client';

import { useState, useCallback, useEffect } from 'react';
import { createCoordinationLogAction } from '@/modules/appointments/actions/coordination/create-coordination-log.action';
import { deleteCoordinationLogAction } from '@/modules/appointments/actions/coordination/delete-coordination-log.action';
import { getCoordinationLogsAction } from '@/modules/appointments/actions/coordination/get-coordination-logs.action';
import type { CoordinationLogResponseDto, CreateCoordinationLogActionType } from '@/modules/appointments/dtos/coordination/coordination-log-response.dto';

export function useCoordinationHub(inquiryId: string | null) {
  const [logs, setLogs] = useState<CoordinationLogResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState('');

  const loadLogs = useCallback(async () => {
    if (!inquiryId) return;
    setIsLoading(true);
    setError(null);
    const res = await getCoordinationLogsAction(inquiryId);
    setIsLoading(false);
    if (res.success && res.data) {
      setLogs(res.data);
    } else {
      setError(res.error || 'Failed to load logs');
    }
  }, [inquiryId]);

  useEffect(() => {
    setLogs([]);
    setCustomNote('');
    setError(null);
    if (inquiryId) loadLogs();
  }, [inquiryId, loadLogs]);

  const addLog = useCallback(async (actionType: CreateCoordinationLogActionType, message: string) => {
    if (!inquiryId) return;
    const res = await createCoordinationLogAction({ inquiryId, actionType, message });
    if (res.success && res.data) {
      setLogs((prev) => [res.data!, ...prev]);
    } else {
      setError(res.error || 'Failed to add log');
    }
  }, [inquiryId]);

  const removeLog = useCallback(async (logId: string) => {
    const res = await deleteCoordinationLogAction(logId);
    if (res.success) {
      setLogs((prev) => prev.filter((l) => l.id !== logId));
    } else {
      setError(res.error || 'Failed to delete log');
    }
  }, []);

  const addCustomNote = useCallback(async () => {
    if (!customNote.trim() || !inquiryId) return;
    await addLog('CUSTOM_NOTE', customNote.trim());
    setCustomNote('');
  }, [customNote, inquiryId, addLog]);

  return {
    logs,
    isLoading,
    error,
    customNote,
    setCustomNote,
    addLog,
    removeLog,
    addCustomNote,
  };
}
