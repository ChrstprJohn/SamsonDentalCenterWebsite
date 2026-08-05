'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AvailableSlotDto } from '@/modules/appointments/dtos/availability/get-available-time-slots.dto';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { getClinicAppointmentsPageAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments-page.action';
import { getStaffAppointmentByIdAction } from '@/modules/appointments/actions/clinic/get-staff-appointment-by-id.action';

export type AppointmentDirectoryTab = 'upcoming' | 'history';
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
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [rescheduleJustification, setRescheduleJustification] = useState('');
  const [changeTreatment, setChangeTreatment] = useState(false);
  const [services, setServices] = useState<ServiceResponseDto[]>([]);
  const [rescheduleServiceId, setRescheduleServiceId] = useState('');
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [changeDoctor, setChangeDoctor] = useState(false);
  const [rescheduleDoctorId, setRescheduleDoctorId] = useState('');
  const [rescheduleMonth, setRescheduleMonth] = useState<Date>(new Date());
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');
  const [cancelReasonPreset, setCancelReasonPreset] = useState('');
  const [cancelReasonCustom, setCancelReasonCustom] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [confirmationChannel, setConfirmationChannel] = useState<'EMAIL' | 'SMS' | 'BOTH' | 'NONE'>('EMAIL');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [tabTotals, setTabTotals] = useState<Record<AppointmentDirectoryTab, number>>({ upcoming: 0, history: 0 });
  const latestRequestId = useRef(0);
  const doctorsLoadedRef = useRef(false);
  const servicesLoadedRef = useRef(false);
  const servicesLoadingRef = useRef<Promise<void> | null>(null);
  const detailRequestIdRef = useRef(0);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState<AppointmentDto | null>(null);
  const nextCursorRef = useRef<string | null>(null);
  const loadingMoreRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const tabCacheRef = useRef<Partial<Record<AppointmentDirectoryTab, { items: AppointmentDto[]; nextCursor: string | null; hasMore: boolean; total: number }>>>({});

  const queryRef = useRef({ activeTab, searchTerm, doctorFilter, dateFilter, historyStatusFilter });
  const isPristineQuery = () => {
    const q = queryRef.current;
    return !q.searchTerm && !q.doctorFilter && !q.dateFilter && !q.historyStatusFilter;
  };
  queryRef.current = { activeTab, searchTerm, doctorFilter, dateFilter, historyStatusFilter };

  const selectedAppointment = selectedAppointmentDetails?.id === selectedAppointmentId
    ? selectedAppointmentDetails
    : appointments.find((appointment) => appointment.id === selectedAppointmentId);
  const activeServiceId = changeTreatment ? rescheduleServiceId : (selectedAppointment?.serviceId ?? '');
  const activeDoctorId = changeDoctor ? rescheduleDoctorId : (selectedAppointment?.doctorId ?? '');
  const availableDates: string[] = [];
  const availableRescheduleDoctors = useMemo(() => {
    return doctors.map((d) => ({
      doctorId: d.id,
      doctorName: `Dr. ${d.firstName} ${d.lastName}`,
    }));
  }, [doctors]);
  const timeslots: AvailableSlotDto[] = [];


  const statusesForTab = (tab: AppointmentDirectoryTab): string[] => tab === 'upcoming'
    ? ['APPROVED', 'CHECKED_IN']
    : ['COMPLETED', 'CANCELLED', 'REJECTED', 'DISPLACED', 'NO_SHOW'];

  const buildPageParams = (tab: AppointmentDirectoryTab, cursor: string | null, includeSearch = true, countOnly = false) => {
    const current = queryRef.current;
    return {
      limit: 25,
      cursor,
      statuses: statusesForTab(tab),
      search: includeSearch ? current.searchTerm : undefined,
      doctorId: current.doctorFilter || undefined,
      date: current.dateFilter || undefined,
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
      const otherTab: AppointmentDirectoryTab = currentTab === 'upcoming' ? 'history' : 'upcoming';
      const otherRequest = append
        ? Promise.resolve(null)
        : getClinicAppointmentsPageAction(buildPageParams(otherTab, null, true, true));
      const [appRes, docRes, otherRes] = await Promise.all([activeRequest, doctorsRequest, otherRequest]);
      if (requestId !== latestRequestId.current) return;
      if (!appRes.success || !appRes.data) throw new Error(appRes.error || 'Could not load appointments.');

      const page = appRes.data;
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

      if (otherRes?.success && otherRes.data) {
        setTabTotals((previous) => ({ ...previous, [otherTab]: otherRes.data.total ?? otherRes.data.items.length }));
      }
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
  }, [activeTab, searchTerm, doctorFilter, dateFilter, historyStatusFilter, fetchData]);

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
      setRescheduleDoctorId(selectedAppointment.doctorId || '');
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
      setRescheduleStartTime(parseTimeToHHMM(selectedAppointment.startTime));
      setRescheduleEndTime(parseTimeToHHMM(selectedAppointment.endTime));
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
    setRescheduleDoctorId('');
    setRescheduleDate('');
    setRescheduleStartTime('');
    setRescheduleEndTime('');
    setCancelReasonPreset('');
    setCancelReasonCustom('');
  }, []);

  useEffect(() => { resetActionForms(); }, [selectedAppointmentId, resetActionForms]);


  const formatPatientName = (appointment: AppointmentDto): string => {
    if (appointment.dependent) {
      const holder = appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Unknown';
      return `${appointment.dependent.firstName} ${appointment.dependent.lastName} (Dependent: ${holder})`;
    }
    if (appointment.source === 'STAFF_CREATED' && !appointment.patientId) {
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
    setRescheduleStartTime(slot.startTime);
    setRescheduleEndTime(slot.endTime);
  };

  const submitReschedule = async () => {
    if (!selectedAppointment) return;
    const targetDoctorId = rescheduleDoctorId || selectedAppointment.doctorId || activeDoctorId;
    if (!rescheduleDate || !targetDoctorId || !rescheduleStartTime || !rescheduleEndTime) {
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
        newStartTime: formatIso(rescheduleDate, rescheduleStartTime),
        newEndTime: formatIso(rescheduleDate, rescheduleEndTime),
        newDoctorId: targetDoctorId,
        newServiceId: rescheduleServiceId || selectedAppointment.serviceId || undefined,
        confirmationChannel,
      });
      if (res.success) {
        setError(null);
        setShowRescheduleForm(false);
        await fetchData({ force: true });
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
        await fetchData({ force: true });
      } else {
        setError(res.error || 'Failed to cancel.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    appointments, filteredAppointments, visibleAppointments, doctors, tabTotals, selectedAppointment, selectedAppointmentId, setSelectedAppointmentId, selectAppointment,
    isLoading, isRefreshing, lastRefreshedAt, error, isSubmitting, activeTab, selectTab, searchTerm, setSearchTerm, doctorFilter, setDoctorFilter, dateFilter,
    setDateFilter, historyStatusFilter, setHistoryStatusFilter, showRescheduleForm, setShowRescheduleForm: handleSetShowRescheduleForm,
    rescheduleJustification, setRescheduleJustification, changeTreatment, services, rescheduleServiceId,
    isLoadingServices, changeDoctor, rescheduleDoctorId, setRescheduleDoctorId, availableRescheduleDoctors,
    isLoadingRescheduleDoctors: false, rescheduleMonth, setRescheduleMonth, availableDates: [],
    isLoadingDays: false, rescheduleDate, timeslots, isLoadingSlots: false,
    rescheduleStartTime, setRescheduleStartTime, rescheduleEndTime, setRescheduleEndTime, cancelReasonPreset, setCancelReasonPreset, cancelReasonCustom, setCancelReasonCustom,
    showCancelForm, setShowCancelForm, confirmationChannel, setConfirmationChannel, activeServiceId, activeDoctorId, formatPatientName, toggleChangeTreatment,
    toggleChangeDoctor, selectRescheduleService, selectRescheduleDate, selectRescheduleSlot, submitReschedule, submitCancel, fetchData, loadServices,
    hasMore, isLoadingMore, loadMoreError, loadMore,
  };
}

