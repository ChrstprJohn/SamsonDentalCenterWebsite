'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { getClinicAppointmentsPageAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments-page.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { resolveNoShowAction } from '@/modules/appointments/actions/status/resolve-no-show.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { getStaffAppointmentByIdAction } from '@/modules/appointments/actions/clinic/get-staff-appointment-by-id.action';
import type { AppointmentDto } from '@/modules/appointments/dtos/exports';
import { getTodayLocalDateStr } from '@/shared/utils/date.util';

export type PastFollowUpTab = 'missed-checkouts' | 'no-show-follow-ups';

export function usePastAppointmentFollowUps() {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [activeTab, setActiveTab] = useState<PastFollowUpTab>('missed-checkouts');
  const [tabCounts, setTabCounts] = useState<Record<PastFollowUpTab, number>>({ 'missed-checkouts': 0, 'no-show-follow-ups': 0 });
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [resolveAppt, setResolveAppt] = useState<AppointmentDto | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const resourcesLoadedRef = useRef(false);
  const resourcesLoadingRef = useRef<Promise<void> | null>(null);
  const detailRequestIdRef = useRef(0);
  const [rescheduleDoctor, setRescheduleDoctor] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');
  const [rescheduleJustification, setRescheduleJustification] = useState('');
  const today = getTodayLocalDateStr();
  const latestRequestId = useRef(0);
  const nextCursorRef = useRef<string | null>(null);
  const loadingMoreRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const queryRef = useRef({ activeTab, searchTerm });
  queryRef.current = { activeTab, searchTerm };

  const buildPageParams = (tab: PastFollowUpTab, cursor: string | null) => ({
    limit: 25,
    cursor,
    statuses: [tab === 'missed-checkouts' ? 'CHECKED_IN' : 'NO_SHOW'],
    dateBefore: today,
    noShowUnresolvedOnly: tab === 'no-show-follow-ups',
    search: queryRef.current.searchTerm || undefined,
  });

  const fetchData = useCallback(async (options?: { append?: boolean }) => {
    const append = options?.append === true;
    if (append) {
      if (loadingMoreRef.current || !nextCursorRef.current) return;
      loadingMoreRef.current = true;
      setIsLoadingMore(true);
      setLoadMoreError(null);
    } else {
      if (hasLoadedRef.current) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);
      setLoadMoreError(null);
      nextCursorRef.current = null;
      setNextCursor(null);
    }

    const requestId = ++latestRequestId.current;
    const currentTab = queryRef.current.activeTab;
    const otherTab: PastFollowUpTab = currentTab === 'missed-checkouts' ? 'no-show-follow-ups' : 'missed-checkouts';
    try {
      const activeRequest = getClinicAppointmentsPageAction(buildPageParams(currentTab, append ? nextCursorRef.current : null));
      const otherRequest = append ? Promise.resolve(null) : getClinicAppointmentsPageAction({ ...buildPageParams(otherTab, null), countOnly: true });
      const [apptRes, otherRes] = await Promise.all([activeRequest, otherRequest]);
      if (requestId !== latestRequestId.current) return;
      if (!apptRes.success || !apptRes.data) throw new Error(apptRes.error || 'Could not load past appointment follow-ups.');
      const page = apptRes.data;
      setAppointments((previous) => append
        ? [...previous, ...page.items.filter((item) => !previous.some((existing) => existing.id === item.id))]
        : page.items);
      nextCursorRef.current = page.nextCursor;
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
      setLastRefreshedAt(new Date());
      setTabCounts((previous) => ({ ...previous, [currentTab]: page.total ?? page.items.length }));
      if (otherRes?.success && otherRes.data) setTabCounts((previous) => ({ ...previous, [otherTab]: otherRes.data.total ?? otherRes.data.items.length }));
      hasLoadedRef.current = true;
    } catch (cause) {
      if (requestId === latestRequestId.current) {
        if (append) setLoadMoreError(cause instanceof Error ? cause.message : 'Could not load more follow-ups.');
        else setError(cause instanceof Error ? cause.message : 'Could not load past appointment follow-ups.');
      }
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
        loadingMoreRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => { void fetchData(); }, 300);
    return () => window.clearTimeout(timeout);
  }, [activeTab, searchTerm, fetchData]);

  useEffect(() => {
    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') void fetchData();
    };
    document.addEventListener('visibilitychange', refreshOnVisible);
    return () => document.removeEventListener('visibilitychange', refreshOnVisible);
  }, [fetchData]);

  const missedCheckouts = appointments;
  const unresolvedNoShows = appointments;

  const list = activeTab === 'missed-checkouts' ? missedCheckouts : unresolvedNoShows;
  const selectedAppointment = list.find((appointment) => appointment.id === selectedAppointmentId) || null;

  useEffect(() => {
    if (selectedAppointmentId && !list.some((appointment) => appointment.id === selectedAppointmentId)) {
      const timeout = window.setTimeout(() => setSelectedAppointmentId(null), 0);
      return () => window.clearTimeout(timeout);
    }
  }, [list, selectedAppointmentId]);

  const selectTab = (tab: PastFollowUpTab) => {
    setActiveTab(tab);
    setSelectedAppointmentId(null);
  };

  const selectAppointment = useCallback((appointmentId: string | null) => {
    setSelectedAppointmentId(appointmentId);
    if (!appointmentId) return;
    const requestId = ++detailRequestIdRef.current;
    void getStaffAppointmentByIdAction(appointmentId).then((result) => {
      if (requestId !== detailRequestIdRef.current || !result.success || !result.data) return;
      setAppointments((previous) => previous.map((appointment) => appointment.id === appointmentId ? result.data! : appointment));
    });
  }, []);

  const loadActionResources = useCallback(async () => {
    if (resourcesLoadedRef.current) return;
    if (resourcesLoadingRef.current) return resourcesLoadingRef.current;
    const request = Promise.all([getDoctorsAction({ includeHidden: true }), getServicesAction('BOOKABLE')])
      .then(([doctorResult, serviceResult]) => {
        if (doctorResult.success && doctorResult.data) setDoctorsList(doctorResult.data);
        if (serviceResult.data) setServicesList(serviceResult.data);
        resourcesLoadedRef.current = Boolean(doctorResult.data && serviceResult.data);
      })
      .catch((cause) => setActionError(cause instanceof Error ? cause.message : 'Failed to load reschedule resources'))
      .finally(() => { resourcesLoadingRef.current = null; });
    resourcesLoadingRef.current = request;
    return request;
  }, []);

  const loadMore = useCallback(() => { void fetchData({ append: true }); }, [fetchData]);

  const completeMissedCheckout = (appointmentId: string, reason?: string) => {
    setActionError(null);
    startTransition(async () => {
      const result = await updateAppointmentStatusAction({
        appointmentId,
        status: 'COMPLETED',
        statusReason: reason || 'Late checkout — past appointment follow-up',
      });
      if (!result.success) {
        setActionError(result.error || 'Could not complete the missed checkout.');
        return;
      }
      setSelectedAppointmentId(null);
      await fetchData();
    });
  };

  const handleResolveNoShowSubmit = (payload: {
    appointmentId: string;
    resolution: 'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'RESCHEDULE' | 'CHECKED_IN';
    reason: string;
    newDate?: string;
    newStartTime?: string;
    newEndTime?: string;
    newDoctorId?: string;
  }) => {
    startTransition(async () => {
      const result = await resolveNoShowAction(payload);
      if (!result.success) {
        setActionError(result.error || 'Could not resolve the no-show.');
        return;
      }
      setResolveAppt(null);
      setSelectedAppointmentId(null);
      await fetchData();
    });
  };

  return {
    activeTab, selectTab, tabCounts, missedCheckouts, unresolvedNoShows, list, selectedAppointment, actionError, setActionError,
    selectedAppointmentId, setSelectedAppointmentId, isLoading, isRefreshing, error, lastRefreshedAt, isPending, fetchData,
    resolveAppt, setResolveAppt, completeMissedCheckout, handleResolveNoShowSubmit,
    todayStr: today, doctorsList, servicesList, selectAppointment, loadActionResources,
    rescheduleDoctor, setRescheduleDoctor, rescheduleDate, setRescheduleDate,
    rescheduleTime, setRescheduleTime, rescheduleEndTime, setRescheduleEndTime,
    rescheduleJustification, setRescheduleJustification,
    searchTerm, setSearchTerm, hasMore, isLoadingMore, loadMoreError, loadMore,
  };
}
