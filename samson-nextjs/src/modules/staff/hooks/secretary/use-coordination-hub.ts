'use client';

import { useState, useCallback, useEffect } from 'react';
import { createCoordinationLogAction } from '@/modules/appointments/actions/coordination/create-coordination-log.action';
import { deleteCoordinationLogAction } from '@/modules/appointments/actions/coordination/delete-coordination-log.action';
import { getCoordinationLogsAction } from '@/modules/appointments/actions/coordination/get-coordination-logs.action';
import type { CoordinationLogResponseDto, CreateCoordinationLogActionType } from '@/modules/appointments/dtos/coordination/coordination-log-response.dto';

export function useCoordinationHub(targetId: string | null, targetType: 'inquiry' | 'appointment' = 'inquiry') {
  const [logs, setLogs] = useState<CoordinationLogResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState('');

  const loadLogs = useCallback(async () => {
    if (!targetId) return;
    setIsLoading(true);
    setError(null);
    const res = await getCoordinationLogsAction(targetId);
    setIsLoading(false);
    if (res.success && res.data) {
      setLogs(res.data);
    } else {
      setError(res.error || 'Failed to load logs');
    }
  }, [targetId]);

  useEffect(() => {
    setLogs([]);
    setCustomNote('');
    setError(null);
    if (targetId) loadLogs();
  }, [targetId, loadLogs]);

  const addLog = useCallback(async (actionType: CreateCoordinationLogActionType, message: string) => {
    if (!targetId) return;
    const payload = targetType === 'appointment'
      ? { appointmentId: targetId, actionType, message }
      : { inquiryId: targetId, actionType, message };
    const res = await createCoordinationLogAction(payload);
    if (res.success && res.data) {
      setLogs((prev) => [res.data!, ...prev]);
    } else {
      setError(res.error || 'Failed to add log');
    }
  }, [targetId, targetType]);

  const removeLog = useCallback(async (logId: string) => {
    const res = await deleteCoordinationLogAction(logId);
    if (res.success) {
      setLogs((prev) => prev.filter((l) => l.id !== logId));
    } else {
      setError(res.error || 'Failed to delete log');
    }
  }, []);

  const addCustomNote = useCallback(async () => {
    if (!customNote.trim() || !targetId) return;
    await addLog('CUSTOM_NOTE', customNote.trim());
    setCustomNote('');
  }, [customNote, targetId, addLog]);

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
