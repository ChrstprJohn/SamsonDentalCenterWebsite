'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { checkInAction } from '@/modules/appointments/actions/status/check-in.action';
import { undoCheckInAction } from '@/modules/appointments/actions/status/undo-check-in.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { resolveNoShowAction } from '@/modules/appointments/actions/status/resolve-no-show.action';
import { getStaffAppointmentByIdAction } from '@/modules/appointments/actions/clinic/get-staff-appointment-by-id.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { createClient } from '@/shared/database/client';
import type { AppointmentDto } from '@/modules/appointments/dtos/exports';
import { getTodayLocalDateStr } from '@/shared/utils/date.util';

export function useSecretaryCheckInOutTracker() {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [bypassWindow, setBypassWindow] = useState(false); // Dev/Test toggle for anytime check-in
  const [checkInAppt, setCheckInAppt] = useState<AppointmentDto | null>(null);
  const [noShowAppt, setNoShowAppt] = useState<AppointmentDto | null>(null);
  const [checkoutAppt, setCheckoutAppt] = useState<AppointmentDto | null>(null);
  const [viewAppt, setViewAppt] = useState<AppointmentDto | null>(null);
  const [resolveAppt, setResolveAppt] = useState<AppointmentDto | null>(null);
  const [rescheduleAppt, setRescheduleAppt] = useState<AppointmentDto | null>(null);
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');
  const [rescheduleDoctor, setRescheduleDoctor] = useState('');
  const [rescheduleService, setRescheduleService] = useState('');
  const [rescheduleJustification, setRescheduleJustification] = useState('');
  const [servicesList, setServicesList] = useState<any[]>([]);
  const servicesLoadedRef = useRef(false);
  const servicesLoadingRef = useRef<Promise<void> | null>(null);
  const requestIdRef = useRef(0);
  const realtimeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressRealtimeUntilRef = useRef(0);
  const detailRequestIdRef = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const supabase = useMemo(() => createClient(), []);
  const todayStr = getTodayLocalDateStr();

  const toNaiveUtc = (date: Date) => new Date(date.getTime() + (-date.getTimezoneOffset()) * 60000);

  const [doctorsList, setDoctorsList] = useState<any[]>([]);

  const fetchData = useCallback(async (silent = false) => {
    const requestId = ++requestIdRef.current;
    if (!silent) setIsLoading(true);
    setErrorMessage(null);
    try {
      const [apptRes, docRes] = await Promise.all([
        getClinicAppointmentsAction({ date: todayStr }),
        getDoctorsAction({ includeHidden: true }),
      ]);
      if (requestId !== requestIdRef.current) return;
      if (apptRes.success && apptRes.data) {
        setAppointments(apptRes.data);
      } else {
        setErrorMessage(apptRes.error || 'Failed to load appointments');
      }
      if (docRes.success && docRes.data) {
        setDoctorsList(docRes.data);
      }
    } catch (err: any) {
      if (requestId === requestIdRef.current) {
        setErrorMessage(err.message || 'An unexpected error occurred');
      }
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [todayStr]);

  const loadServices = useCallback(async () => {
    if (servicesLoadedRef.current) return;
    if (servicesLoadingRef.current) return servicesLoadingRef.current;
    const load = (async () => {
      const result = await getServicesAction('BOOKABLE');
      if (result && (result as any).data) {
        setServicesList((result as any).data);
        servicesLoadedRef.current = true;
      }
      servicesLoadingRef.current = null;
    })().catch((error) => {
      servicesLoadingRef.current = null;
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load services');
    });
    servicesLoadingRef.current = load;
    return load;
  }, []);

  const scheduleRealtimeRefresh = useCallback(() => {
    if (Date.now() < suppressRealtimeUntilRef.current) return;
    if (realtimeTimerRef.current) clearTimeout(realtimeTimerRef.current);
    realtimeTimerRef.current = setTimeout(() => {
      realtimeTimerRef.current = null;
      void fetchData(true); // silent — don't flash full-screen loader
    }, 250);
  }, [fetchData]);

  const resetRescheduleDraft = () => {
    setRescheduleDate('');
    setRescheduleTime('');
    setRescheduleEndTime('');
    setRescheduleDoctor('');
    setRescheduleService('');
    setRescheduleJustification('');
  };

  const clearSelection = () => {
    setCheckInAppt(null);
    setNoShowAppt(null);
    setCheckoutAppt(null);
    setViewAppt(null);
    setResolveAppt(null);
    setRescheduleAppt(null);
    resetRescheduleDraft();
  };

  useEffect(() => {
    setCurrentTime(toNaiveUtc(new Date()));
    const tick = setInterval(() => setCurrentTime(toNaiveUtc(new Date())), 60_000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const channel = supabase
      .channel('check-in-out-tracker')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `date=eq.${todayStr}` }, scheduleRealtimeRefresh)
      .subscribe();
    return () => {
      if (realtimeTimerRef.current) clearTimeout(realtimeTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [supabase, scheduleRealtimeRefresh, todayStr]);

  const parseLocalTime = (date: string, time: string | null) => {
    if (!time) return null;
    const t = time.substring(0, 5);
    return new Date(`${date}T${t}:00+08:00`);
  };

  const getCheckInStatus = (appointment: AppointmentDto) => {
    if (bypassWindow) return { enabled: true, message: 'Check In (Bypassed)' };
    if (!currentTime) return { enabled: false, message: 'Check In' };
    const startTime = parseLocalTime(appointment.date, appointment.startTime);
    const endTime = parseLocalTime(appointment.date, appointment.endTime);
    if (!startTime || !endTime) return { enabled: false, message: 'Check In' };

    const windowStart = new Date(startTime.getTime() - 15 * 60 * 1000);
    if (currentTime < windowStart) {
      return { enabled: false, message: `In ${Math.ceil((windowStart.getTime() - currentTime.getTime()) / 60000)}m` };
    }
    if (currentTime > endTime) {
      return { enabled: false, message: 'Expired' };
    }
    return { enabled: true, message: 'Check In' };
  };

  const isPastEndTime = (appointment: AppointmentDto) => {
    if (!currentTime || !appointment.endTime) return false;
    const endTime = parseLocalTime(appointment.date, appointment.endTime);
    if (!endTime) return false;
    return currentTime > endTime;
  };

  const runStatusAction = (appointmentId: string, action: () => Promise<any>, fallback: string) => {
    startTransition(async () => {
      const res = await action();
      if (!res.success) setErrorMessage(res.error || fallback);
      else {
        suppressRealtimeUntilRef.current = Date.now() + 500;
        await fetchData(true); // silent — don't flash full-screen loader
        // Keep panel open, re-open in details view with the refreshed appointment.
        const fresh = await getStaffAppointmentByIdAction(appointmentId);
        if (fresh.success && fresh.data) {
          clearSelection();
          setViewAppt(fresh.data);
          setSelectionVersion((version) => version + 1);
        }
      }
    });
  };

  const handleCheckIn = (appointmentId: string, reason?: string) =>
    runStatusAction(appointmentId, () => reason ? checkInAction({ appointmentId, reason }) : checkInAction({ appointmentId }), 'Failed to check in');

  const handleUndoCheckIn = (appointmentId: string, reason?: string) => {
    runStatusAction(appointmentId, () => undoCheckInAction({ appointmentId, reason }), 'Failed to undo check-in');
  };

  const handleMarkNoShow = (appointmentId: string, reason?: string) =>
    runStatusAction(
      appointmentId,
      () =>
        updateAppointmentStatusAction({
          appointmentId,
          status: 'NO_SHOW',
          statusReason: reason || 'Marked as no-show by secretary during check-in',
        }),
      'Failed to mark as no-show'
    );

  const handleCheckoutComplete = (appointmentId: string, reason?: string) => {
    startTransition(async () => {
      const res = await updateAppointmentStatusAction({
        appointmentId,
        status: 'COMPLETED',
        statusReason: reason || 'Checked out patient and dispatched Thank You & Post-Care Review Request message.',
      });
      if (!res.success) setErrorMessage(res.error || 'Failed to complete checkout');
      else {
        suppressRealtimeUntilRef.current = Date.now() + 500;
        await fetchData(true); // silent — don't flash full-screen loader
        // Keep panel open, re-open in details view with the refreshed appointment.
        const fresh = await getStaffAppointmentByIdAction(appointmentId);
        if (fresh.success && fresh.data) {
          clearSelection();
          setViewAppt(fresh.data);
          setSelectionVersion((version) => version + 1);
        }
      }
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
    confirmationChannel?: 'EMAIL' | 'SMS' | 'BOTH' | 'NONE';
  }) => {
    startTransition(async () => {
      const res = await resolveNoShowAction(payload);
      if (!res.success) setErrorMessage(res.error || 'Failed to resolve no-show');
      else {
        suppressRealtimeUntilRef.current = Date.now() + 500;
        await fetchData(true); // silent — don't flash full-screen loader
        // Keep panel open, re-open in details view with the refreshed appointment.
        const fresh = await getStaffAppointmentByIdAction(payload.appointmentId);
        if (fresh.success && fresh.data) {
          clearSelection();
          setViewAppt(fresh.data);
          setSelectionVersion((version) => version + 1);
        }
      }
    });
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleAppt || !rescheduleDate || !rescheduleTime) return;
    const appointmentId = rescheduleAppt.id;
    startTransition(async () => {
      const formatIso = (dateStr: string, timeStr: string) => {
        if (!dateStr || !timeStr) return undefined;
        const timeFormatted = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
        return `${dateStr}T${timeFormatted}Z`;
      };
      const startIso = formatIso(rescheduleDate, rescheduleTime);
      const endIso = rescheduleEndTime
        ? formatIso(rescheduleDate, rescheduleEndTime)
        : new Date(new Date(startIso!).getTime() + 30 * 60 * 1000).toISOString();

      const res = await updateAppointmentStatusAction({
        appointmentId: rescheduleAppt.id,
        status: 'APPROVED',
        statusReason: rescheduleJustification || 'Rescheduling appointment slot',
        newDate: rescheduleDate,
        newStartTime: startIso,
        newEndTime: endIso,
        newDoctorId: rescheduleDoctor || rescheduleAppt.doctorId || undefined,
        newServiceId: rescheduleService || rescheduleAppt.serviceId,
      });
      if (!res.success) setErrorMessage(res.error || 'Failed to reschedule');
      else {
        suppressRealtimeUntilRef.current = Date.now() + 500;
        await fetchData(true); // silent — don't flash full-screen loader
        // Keep panel open, re-open in details view with the refreshed appointment.
        const fresh = await getStaffAppointmentByIdAction(appointmentId);
        if (fresh.success && fresh.data) {
          clearSelection();
          setViewAppt(fresh.data);
          setSelectionVersion((version) => version + 1);
        }
      }
    });
  };

  const handleViewApptDetails = (appointment: AppointmentDto) => {
    clearSelection();
    setViewAppt(appointment);
    setSelectionVersion((version) => version + 1);
    const detailRequestId = ++detailRequestIdRef.current;
    void getStaffAppointmentByIdAction(appointment.id).then((result) => {
      if (detailRequestId !== detailRequestIdRef.current) return;
      if (result.success && result.data) setViewAppt(result.data);
      else if (!result.success) setErrorMessage(result.error || 'Failed to load appointment details');
    });
  };

  const openCheckIn = (appointment: AppointmentDto) => {
    clearSelection();
    setCheckInAppt(appointment);
  };

  const openNoShow = (appointment: AppointmentDto) => {
    clearSelection();
    setNoShowAppt(appointment);
  };

  const openCheckout = (appointment: AppointmentDto) => {
    clearSelection();
    setCheckoutAppt(appointment);
  };

  const openResolve = (appointment: AppointmentDto) => {
    clearSelection();
    setResolveAppt(appointment);
  };

  const openReschedule = (appointment: AppointmentDto) => {
    clearSelection();
    void loadServices();
    setRescheduleAppt(appointment);
  };

  const columns = useMemo(() => {
    return {
      approved: appointments.filter((appointment) => appointment.status === 'APPROVED' && !isPastEndTime(appointment)),
      noShow: appointments.filter((appointment) => appointment.status === 'NO_SHOW' || (appointment.status === 'APPROVED' && isPastEndTime(appointment))),
      checkedIn: appointments.filter((appointment) => ['CHECKED_IN', 'TREATMENT_RENDERED'].includes(appointment.status)),
      completed: appointments.filter((appointment) => appointment.status === 'COMPLETED'),
    };
  }, [appointments, currentTime]);

  const stats = {
    totalCheckedInToday: columns.checkedIn.length,
    completedToday: columns.completed.length,
    noShowCountToday: columns.noShow.length,
  };

  const refreshAppointment = useCallback(async (appointmentId?: string) => {
    suppressRealtimeUntilRef.current = Date.now() + 500;
    await fetchData(true); // silent — don't flash full-screen loader
    const targetId = appointmentId || viewAppt?.id;
    if (targetId) {
      const fresh = await getStaffAppointmentByIdAction(targetId);
      if (fresh.success && fresh.data) {
        clearSelection();
        setViewAppt(fresh.data);
        setSelectionVersion((version) => version + 1);
      }
    }
  }, [fetchData, viewAppt?.id]);

  return {
    appointments,
    doctorsList,
    columns,
    stats,
    currentTime,
    todayStr,
    isLoading,
    errorMessage,
    isPending,
    bypassWindow,
    setBypassWindow,
    clearSelection,
    selectionVersion,
    resetRescheduleDraft,
    checkInAppt,
    setCheckInAppt,
    noShowAppt,
    setNoShowAppt,
    checkoutAppt,
    setCheckoutAppt,
    viewAppt,
    setViewAppt,
    resolveAppt,
    setResolveAppt,
    rescheduleAppt,
    setRescheduleAppt,
    rescheduleDate,
    setRescheduleDate,
    rescheduleTime,
    setRescheduleTime,
    rescheduleEndTime,
    setRescheduleEndTime,
    rescheduleDoctor,
    setRescheduleDoctor,
    rescheduleService,
    setRescheduleService,
    rescheduleJustification,
    setRescheduleJustification,
    servicesList,
    loadServices,
    fetchData,
    refreshAppointment,
    onAppointmentUpdated: refreshAppointment,
    getCheckInStatus,
    handleCheckIn,
    handleUndoCheckIn,
    handleMarkNoShow,
    handleCheckoutComplete,
    handleResolveNoShowSubmit,
    handleRescheduleSubmit,
    handleViewApptDetails,
    openCheckIn,
    openNoShow,
    openCheckout,
    openResolve,
    openReschedule,
    isPastEndTime,
  };
}
