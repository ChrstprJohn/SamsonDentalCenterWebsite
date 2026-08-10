'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { resolveNoShowAction } from '@/modules/appointments/actions/status/resolve-no-show.action';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AvailableSlotDto } from '@/modules/appointments/dtos/availability/get-available-time-slots.dto';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { getClinicAppointmentsPageAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments-page.action';
import { getStaffAppointmentByIdAction } from '@/modules/appointments/actions/clinic/get-staff-appointment-by-id.action';
import { getTodayLocalDateStr, calculateEndTime } from '@/shared/utils/date.util';

export type AppointmentDirectoryTab = 'upcoming' | 'needs-attention' | 'history';
export type DoctorFilterItem = { id: string; firstName: string; lastName: string };
export type AvailableDoctorItem = { doctorId: string; doctorName: string };

export function useSecretaryAppointments() {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [doctors, setDoctors] = useState<DoctorFilterItem[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<AppointmentDirectoryTab>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [rescheduleJustification, setRescheduleJustification] = useState('');
  const [changeTreatment, setChangeTreatment] = useState(false);
  const [services, setServices] = useState<ServiceResponseDto[]>([]);
  const [rescheduleServiceId, setRescheduleServiceId] = useState('');
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [changeDoctor, setChangeDoctor] = useState(false);
  const [rescheduleDoctor, setRescheduleDoctor] = useState('');
  const [rescheduleMonth, setRescheduleMonth] = useState<Date>(new Date());
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');
  const [cancelReasonPreset, setCancelReasonPreset] = useState('');
  const [cancelReasonCustom, setCancelReasonCustom] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [confirmationChannel, setConfirmationChannel] = useState<'EMAIL' | 'SMS' | 'BOTH' | 'NONE'>('EMAIL');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [tabTotals, setTabTotals] = useState<Record<AppointmentDirectoryTab, number>>({ upcoming: 0, 'needs-attention': 0, history: 0 });
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [doctorsList, setDoctorsList] = useState<DoctorFilterItem[]>([]);
  const [servicesList, setServicesList] = useState<ServiceResponseDto[]>([]);
  const resourcesLoadedRef = useRef(false);
  const resourcesLoadingRef = useRef<Promise<void> | null>(null);
  const today = getTodayLocalDateStr();
  const latestRequestId = useRef(0);
  const doctorsLoadedRef = useRef(false);
  const servicesLoadedRef = useRef(false);
  const servicesLoadingRef = useRef<Promise<void> | null>(null);
  const detailRequestIdRef = useRef(0);
  const preserveSelectionRef = useRef(false);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState<AppointmentDto | null>(null);
  const nextCursorRef = useRef<string | null>(null);
  const loadingMoreRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const tabCacheRef = useRef<Partial<Record<AppointmentDirectoryTab, { items: AppointmentDto[]; nextCursor: string | null; hasMore: boolean; total: number }>>>({});
  const listRef = useRef<AppointmentDto[]>([]);
  listRef.current = appointments;
  const pageBackStackRef = useRef<{ items: AppointmentDto[]; nextCursor: string | null }[]>([]);

  const queryRef = useRef({ activeTab, searchTerm, doctorFilter, dateFilter, historyStatusFilter, sourceFilter });
  const isPristineQuery = () => {
    const q = queryRef.current;
    return !q.searchTerm && !q.doctorFilter && !q.dateFilter && !q.historyStatusFilter && !q.sourceFilter;
  };
  queryRef.current = { activeTab, searchTerm, doctorFilter, dateFilter, historyStatusFilter, sourceFilter };

  const selectedAppointment = selectedAppointmentDetails?.id === selectedAppointmentId
    ? selectedAppointmentDetails
    : appointments.find((appointment) => appointment.id === selectedAppointmentId);
  const activeServiceId = changeTreatment ? rescheduleServiceId : (selectedAppointment?.serviceId ?? '');
  const activeDoctorId = changeDoctor ? rescheduleDoctor : (selectedAppointment?.doctorId ?? '');
  const availableDates: string[] = [];
  const availableRescheduleDoctors = useMemo(() => {
    return doctors.map((d) => ({
      doctorId: d.id,
      doctorName: `Dr. ${d.firstName} ${d.lastName}`,
    }));
  }, [doctors]);
  const timeslots: AvailableSlotDto[] = [];


  const statusesForTab = (tab: AppointmentDirectoryTab): string[] => {
    if (tab === 'upcoming') return ['APPROVED', 'CHECKED_IN', 'NO_SHOW'];
    if (tab === 'needs-attention') return ['CHECKED_IN', 'NO_SHOW'];
    return ['COMPLETED', 'CANCELLED', 'REJECTED', 'DISPLACED', 'NO_SHOW'];
  };

  const buildPageParams = (tab: AppointmentDirectoryTab, cursor: string | null, includeSearch = true, countOnly = false) => {
    const current = queryRef.current;
    return {
      limit: 25,
      cursor,
      statuses: statusesForTab(tab),
      search: includeSearch ? current.searchTerm : undefined,
      doctorId: current.doctorFilter || undefined,
      source: (current.sourceFilter || undefined) as 'SELF_BOOKED' | 'STAFF_CREATED' | 'CONVERTED' | undefined,
      date: current.dateFilter || undefined,
      dateBefore: tab === 'needs-attention' ? today : undefined,
      dateFrom: tab === 'upcoming' ? today : undefined,
      noShowUnresolvedOnly: tab === 'needs-attention' || tab === 'upcoming' || undefined,
      noShowResolvedOnly: tab === 'history' || undefined,
      status: tab === 'history' && current.historyStatusFilter ? current.historyStatusFilter : undefined,
      countOnly: countOnly || undefined,
    };
  };

  const fetchData = useCallback(async (options?: { append?: boolean; force?: boolean }) => {
    const append = options?.append === true;
    const force = options?.force === true;
    if (!append && !force && isPristineQuery()) {
      const cached = tabCacheRef.current[queryRef.current.activeTab];
      if (cached) {
        setAppointments(cached.items);
        setNextCursor(cached.nextCursor);
        setHasMore(cached.hasMore);
        setTabTotals((previous) => ({ ...previous, [queryRef.current.activeTab]: cached.total }));
        setError(null);
        if (!doctorsLoadedRef.current) void getDoctorsAction({ includeHidden: true }).then((res) => { if (res.success && res.data) { setDoctors(res.data as DoctorFilterItem[]); doctorsLoadedRef.current = true; } });
        return;
      }
    }
    if (append) {
      if (loadingMoreRef.current || !nextCursorRef.current) return;
      loadingMoreRef.current = true;
      setIsLoadingMore(true);
      setLoadMoreError(null);
    } else {
      pageBackStackRef.current = [];
      if (hasLoadedRef.current) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);
      setLoadMoreError(null);
      nextCursorRef.current = null;
      setNextCursor(null);
    }

    const requestId = ++latestRequestId.current;
    const currentTab = queryRef.current.activeTab;
    try {
      const activeRequest = getClinicAppointmentsPageAction(buildPageParams(currentTab, append ? nextCursorRef.current : null));
      const doctorsRequest = append || doctorsLoadedRef.current ? Promise.resolve(null) : getDoctorsAction({ includeHidden: true });
      const otherTabs = (['upcoming', 'needs-attention', 'history'] as const).filter((tab) => tab !== currentTab);
      const otherRequests = append || otherTabs.length === 0
        ? [Promise.resolve(null)]
        : otherTabs.map((tab) => getClinicAppointmentsPageAction(buildPageParams(tab, null, true, true)));
      const [appRes, docRes, ...otherResults] = await Promise.all([activeRequest, doctorsRequest, ...otherRequests]);
      if (requestId !== latestRequestId.current) return;
      if (!appRes.success || !appRes.data) throw new Error(appRes.error || 'Could not load appointments.');

      const page = appRes.data;
      if (append) {
        pageBackStackRef.current.push({ items: listRef.current, nextCursor: page.nextCursor });
      }
      setAppointments((previous) => append
        ? [...previous, ...page.items.filter((item) => !previous.some((existing) => existing.id === item.id))]
        : page.items);
      nextCursorRef.current = page.nextCursor;
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
      setTabTotals((previous) => ({ ...previous, [currentTab]: page.total ?? page.items.length }));
      if (!append && isPristineQuery()) {
        tabCacheRef.current[currentTab] = { items: page.items, nextCursor: page.nextCursor, hasMore: page.hasMore, total: page.total ?? page.items.length };
      }

      otherResults.forEach((otherRes, index) => {
        if (otherRes?.success && otherRes.data) {
          setTabTotals((previous) => ({ ...previous, [otherTabs[index]]: otherRes.data.total ?? otherRes.data.items.length }));
        }
      });
      if (docRes?.success && docRes.data) {
        setDoctors(docRes.data as DoctorFilterItem[]);
        doctorsLoadedRef.current = true;
      }
      hasLoadedRef.current = true;
      if (!append) setLastRefreshedAt(new Date());
    } catch (err) {
      if (requestId === latestRequestId.current) {
        if (append) setLoadMoreError(err instanceof Error ? err.message : 'Could not load more appointments.');
        else setError(err instanceof Error ? err.message : 'Could not load appointments.');
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
    if (isPristineQuery()) {
      const cached = tabCacheRef.current[activeTab];
      if (cached) {
        pageBackStackRef.current = [];
        setAppointments(cached.items);
        setNextCursor(cached.nextCursor);
        setHasMore(cached.hasMore);
        setTabTotals((previous) => ({ ...previous, [activeTab]: cached.total }));
        setError(null);
        return;
      }
    }
    const timeout = window.setTimeout(() => { void fetchData(); }, 600);
    return () => window.clearTimeout(timeout);
  }, [activeTab, searchTerm, doctorFilter, dateFilter, historyStatusFilter, sourceFilter, fetchData]);

  useEffect(() => {
    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') void fetchData({ force: true });
    };
    document.addEventListener('visibilitychange', refreshOnVisible);
    return () => document.removeEventListener('visibilitychange', refreshOnVisible);
  }, [fetchData]);

  const loadServices = useCallback(async () => {
    if (servicesLoadedRef.current) return;
    if (servicesLoadingRef.current) return servicesLoadingRef.current;
    setIsLoadingServices(true);
    const request = getServicesAction('BOOKABLE')
      .then((res) => {
        if (res?.data) {
          setServices(res.data as ServiceResponseDto[]);
          servicesLoadedRef.current = true;
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load services'))
      .finally(() => {
        servicesLoadingRef.current = null;
        setIsLoadingServices(false);
      });
    servicesLoadingRef.current = request;
    return request;
  }, []);

  const openRescheduleForm = useCallback(() => {
    void loadServices();
    if (selectedAppointment) {
      setRescheduleServiceId(selectedAppointment.serviceId || '');
      setRescheduleDoctor(selectedAppointment.doctorId || '');
      setRescheduleDate(selectedAppointment.date || '');
      const parseTimeToHHMM = (timeStr?: string | null) => {
        if (!timeStr) return '';
        if (timeStr.includes('T')) {
          const timePart = timeStr.split('T')[1];
          if (timePart) return timePart.slice(0, 5);
        }
        const match = timeStr.match(/^(\d{2}):(\d{2})/);
        if (match) return `${match[1]}:${match[2]}`;
        return '';
      };
      const initialStart = parseTimeToHHMM(selectedAppointment.startTime);
      let initialEnd = parseTimeToHHMM(selectedAppointment.endTime);
      if (initialStart && (!initialEnd || initialStart >= initialEnd)) {
        const duration = selectedAppointment.service?.durationMinutes || 30;
        initialEnd = calculateEndTime(initialStart, duration);
      }
      const initialChannel = (selectedAppointment.confirmationChannel as any) || (selectedAppointment as any).confirmation_channel || 'EMAIL';
      setConfirmationChannel(initialChannel);
      setRescheduleTime(initialStart);
      setRescheduleEndTime(initialEnd);
      setRescheduleJustification('');
    }
    setShowRescheduleForm(true);
    setShowCancelForm(false);
  }, [loadServices, selectedAppointment]);

  const handleSetShowRescheduleForm = useCallback((show: boolean) => {
    if (show) {
      openRescheduleForm();
    } else {
      setShowRescheduleForm(false);
    }
  }, [openRescheduleForm]);

  const resetActionForms = useCallback(() => {
    setShowRescheduleForm(false);
    setShowCancelForm(false);
    setRescheduleJustification('');
    setChangeTreatment(false);
    setChangeDoctor(false);
    setRescheduleServiceId('');
    setRescheduleDoctor('');
    setRescheduleDate('');
    setRescheduleTime('');
    setRescheduleEndTime('');
    setCancelReasonPreset('');
    setCancelReasonCustom('');
    setConfirmationChannel('EMAIL');
  }, []);

  useEffect(() => { resetActionForms(); }, [selectedAppointmentId, resetActionForms]);


  const formatPatientName = (appointment: AppointmentDto): string => {
    if (appointment.dependent) {
      const holder = appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Unknown';
      return `${appointment.dependent.firstName} ${appointment.dependent.lastName} (Dependent: ${holder})`;
    }
    if ((appointment.source === 'STAFF_CREATED' || appointment.source === 'CONVERTED') && !appointment.patientId) {
      if (appointment.guestContact) {
        return `${appointment.guestContact.firstName ?? ''} ${appointment.guestContact.lastName ?? ''}`.trim() || 'Guest Patient';
      }
      return 'Guest Patient';
    }
    return appointment.patient
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : appointment.guestContact
        ? `${appointment.guestContact.firstName ?? ''} ${appointment.guestContact.lastName ?? ''}`.trim() || 'Guest Patient'
        : 'Guest Patient';
  };

  const filteredAppointments = useMemo(() => appointments, [appointments]);
  const visibleAppointments = filteredAppointments;

  useEffect(() => {
    if (selectedAppointmentId && !appointments.some((appointment) => appointment.id === selectedAppointmentId)) {
      // Keep the detail panel open right after an in-panel action (reschedule/cancel).
      // Ref is set during submit*; fall through next time so normal list filtering still clears.
      if (preserveSelectionRef.current) {
        preserveSelectionRef.current = false;
        return;
      }
      const timeout = window.setTimeout(() => setSelectedAppointmentId(null), 0);
      return () => window.clearTimeout(timeout);
    }
  }, [appointments, selectedAppointmentId]);

  const loadMore = useCallback(() => { void fetchData({ append: true }); }, [fetchData]);

  const selectTab = (tab: AppointmentDirectoryTab) => {
    setActiveTab(tab);
    setSelectedAppointmentId(null);
    setSelectedAppointmentDetails(null);
  };

  const selectAppointment = useCallback((appointmentId: string | null) => {
    setSelectedAppointmentId(appointmentId);
    if (!appointmentId) {
      setSelectedAppointmentDetails(null);
      return;
    }
    const summary = appointments.find((appointment) => appointment.id === appointmentId) || null;
    setSelectedAppointmentDetails(summary);
    const requestId = ++detailRequestIdRef.current;
    void getStaffAppointmentByIdAction(appointmentId).then((result) => {
      if (requestId !== detailRequestIdRef.current) return;
      if (result.success && result.data) setSelectedAppointmentDetails(result.data);
      else if (!result.success) setError(result.error || 'Failed to load appointment details');
    });
  }, [appointments]);

  const toggleChangeTreatment = () => {
    setChangeTreatment((current) => !current);
  };

  const toggleChangeDoctor = () => {
    setChangeDoctor((current) => !current);
  };

  const selectRescheduleService = (serviceId: string) => {
    setRescheduleServiceId(serviceId);
  };

  const selectRescheduleDate = (date: string) => {
    setRescheduleDate(date);
  };

  const selectRescheduleSlot = (slot: AvailableSlotDto) => {
    setRescheduleTime(slot.startTime);
    setRescheduleEndTime(slot.endTime);
  };

  const submitReschedule = async () => {
    if (!selectedAppointment) return;
    const targetDoctorId = rescheduleDoctor || selectedAppointment.doctorId || activeDoctorId;
    const duration = selectedAppointment.service?.durationMinutes || 30;

    // Behavior Note: Fallback to calculated end time if empty or if invalid (endTime <= startTime)
    // to guarantee that chronological validation passes and outbox notifications are dispatched.
    let computedEndTime = rescheduleEndTime;
    if (!computedEndTime || (rescheduleTime && computedEndTime <= rescheduleTime)) {
      computedEndTime = calculateEndTime(rescheduleTime, duration);
    }

    if (!rescheduleDate || !targetDoctorId || !rescheduleTime || !computedEndTime) {
      setError('Please complete all scheduling fields (date, doctor, timeslot).');
      return;
    }
    if (changeTreatment && !rescheduleServiceId) {
      setError('Please select a treatment service.');
      return;
    }
    if (!rescheduleJustification.trim()) {
      setError('Justification note is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const formatIso = (dateStr: string, timeStr: string) => {
        if (!dateStr || !timeStr) return undefined;
        if (timeStr.includes('T')) return timeStr;
        const timeFormatted = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
        return `${dateStr}T${timeFormatted}Z`;
      };

      const res = await updateAppointmentStatusAction({
        appointmentId: selectedAppointment.id,
        status: 'APPROVED',
        statusReason: rescheduleJustification.trim(),
        newDate: rescheduleDate,
        newStartTime: formatIso(rescheduleDate, rescheduleTime),
        newEndTime: formatIso(rescheduleDate, computedEndTime),
        newDoctorId: targetDoctorId,
        newServiceId: rescheduleServiceId || selectedAppointment.serviceId || undefined,
        confirmationChannel,
      });
      if (res.success) {
        setError(null);
        setShowRescheduleForm(false);
        preserveSelectionRef.current = true;
        await fetchData({ force: true });
        // Keep panel open: refresh selected appointment details so the pane re-renders with new schedule.
        const detail = await getStaffAppointmentByIdAction(selectedAppointment.id);
        if (detail.success && detail.data) setSelectedAppointmentDetails(detail.data);
      } else {
        setError(res.error || 'Failed to reschedule.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitCancel = async () => {
    if (!selectedAppointment) return;
    const finalReason = cancelReasonPreset === 'CUSTOM' ? cancelReasonCustom : cancelReasonPreset;
    if (!finalReason?.trim()) {
      setError('Please select or write a cancellation reason.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await updateAppointmentStatusAction({
        appointmentId: selectedAppointment.id,
        status: 'CANCELLED',
        statusReason: finalReason.trim(),
        confirmationChannel,
      });
      if (res.success) {
        setError(null);
        setShowCancelForm(false);
        preserveSelectionRef.current = true;
        await fetchData({ force: true });
        // Keep panel open with cancelled status instead of clearing selection.
        const detail = await getStaffAppointmentByIdAction(selectedAppointment.id);
        if (detail.success && detail.data) setSelectedAppointmentDetails(detail.data);
      } else {
        setError(res.error || 'Failed to cancel.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      preserveSelectionRef.current = true;
      await fetchData({ force: true });
      const fresh = await getStaffAppointmentByIdAction(appointmentId);
      if (fresh.success && fresh.data) setSelectedAppointmentDetails(fresh.data);
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
      preserveSelectionRef.current = true;
      await fetchData({ force: true });
      const fresh = await getStaffAppointmentByIdAction(payload.appointmentId);
      if (fresh.success && fresh.data) setSelectedAppointmentDetails(fresh.data);
    });
  };

  const refreshAppointment = useCallback(async (appointmentId?: string) => {
    preserveSelectionRef.current = true;
    await fetchData({ force: true });
    const targetId = appointmentId || selectedAppointmentId;
    if (targetId) {
      const fresh = await getStaffAppointmentByIdAction(targetId);
      if (fresh.success && fresh.data) setSelectedAppointmentDetails(fresh.data);
    }
  }, [fetchData, selectedAppointmentId]);

  return {
    appointments, filteredAppointments, visibleAppointments, doctors, tabTotals, selectedAppointment, selectedAppointmentId, setSelectedAppointmentId, selectAppointment,
    isLoading, isRefreshing, lastRefreshedAt, error, isSubmitting, activeTab, selectTab, searchTerm, setSearchTerm, doctorFilter, setDoctorFilter, dateFilter,
    setDateFilter, historyStatusFilter, setHistoryStatusFilter, sourceFilter, setSourceFilter, showRescheduleForm, setShowRescheduleForm: handleSetShowRescheduleForm,
    rescheduleJustification, setRescheduleJustification, changeTreatment, services, rescheduleServiceId,
    isLoadingServices, changeDoctor, rescheduleDoctor, setRescheduleDoctor, availableRescheduleDoctors,
    isLoadingRescheduleDoctors: false, rescheduleMonth, setRescheduleMonth, availableDates: [],
    isLoadingDays: false, rescheduleDate, timeslots, isLoadingSlots: false,
    rescheduleTime, setRescheduleTime, rescheduleEndTime, setRescheduleEndTime, cancelReasonPreset, setCancelReasonPreset, cancelReasonCustom, setCancelReasonCustom,
    showCancelForm, setShowCancelForm, confirmationChannel, setConfirmationChannel, activeServiceId, activeDoctorId, formatPatientName, toggleChangeTreatment,
    toggleChangeDoctor, selectRescheduleService, selectRescheduleDate, selectRescheduleSlot, submitReschedule, submitCancel, fetchData, refreshAppointment, onAppointmentUpdated: refreshAppointment, loadServices,
    hasMore, isLoadingMore, loadMoreError, loadMore,
    canGoNewer: pageBackStackRef.current.length > 0,
    goNewer: useCallback(() => {
      const snapshot = pageBackStackRef.current.pop();
      if (!snapshot) return;
      setAppointments(snapshot.items);
      nextCursorRef.current = snapshot.nextCursor;
      setNextCursor(snapshot.nextCursor);
      setHasMore(true);
      setLoadMoreError(null);
    }, []),
    actionError, isPending, completeMissedCheckout, handleResolveNoShowSubmit, loadActionResources,
    doctorsList, servicesList, setRescheduleDate,
  };
}

