'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { checkInAction } from '@/modules/appointments/actions/status/check-in.action';
import { undoCheckInAction } from '@/modules/appointments/actions/status/undo-check-in.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { resolveNoShowAction } from '@/modules/appointments/actions/status/resolve-no-show.action';
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
  const [checkoutAppt, setCheckoutAppt] = useState<AppointmentDto | null>(null);
  const [viewAppt, setViewAppt] = useState<AppointmentDto | null>(null);
  const [resolveAppt, setResolveAppt] = useState<AppointmentDto | null>(null);
  const [rescheduleAppt, setRescheduleAppt] = useState<AppointmentDto | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');
  const [rescheduleDoctor, setRescheduleDoctor] = useState('');
  const [rescheduleService, setRescheduleService] = useState('');
  const [rescheduleJustification, setRescheduleJustification] = useState('');
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const supabase = useMemo(() => createClient(), []);
  const todayStr = getTodayLocalDateStr();

  const toNaiveUtc = (date: Date) => new Date(date.getTime() + (-date.getTimezoneOffset()) * 60000);

  const [doctorsList, setDoctorsList] = useState<any[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [apptRes, docRes, svcRes] = await Promise.all([
        getClinicAppointmentsAction({ date: todayStr }),
        getDoctorsAction({ includeHidden: true }),
        getServicesAction('BOOKABLE'),
      ]);
      if (apptRes.success && apptRes.data) {
        setAppointments(apptRes.data);
      } else {
        setErrorMessage(apptRes.error || 'Failed to load appointments');
      }
      if (docRes.success && docRes.data) {
        setDoctorsList(docRes.data);
      }
      if (svcRes && (svcRes as any).data) {
        setServicesList((svcRes as any).data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentTime(toNaiveUtc(new Date()));
    const tick = setInterval(() => setCurrentTime(toNaiveUtc(new Date())), 60_000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('check-in-out-tracker')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => fetchData())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

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

  const runStatusAction = (action: () => Promise<any>, fallback: string) => {
    startTransition(async () => {
      const res = await action();
      if (!res.success) alert(res.error || fallback);
      else fetchData();
    });
  };

  const handleCheckIn = (appointmentId: string) =>
    runStatusAction(() => checkInAction({ appointmentId }), 'Failed to check in');

  const handleUndoCheckIn = (appointmentId: string) => {
    if (!confirm('Are you sure you want to undo this check-in?')) return;
    runStatusAction(() => undoCheckInAction({ appointmentId }), 'Failed to undo check-in');
  };

  const handleCheckoutComplete = (appointmentId: string) => {
    startTransition(async () => {
      const res = await updateAppointmentStatusAction({
        appointmentId,
        status: 'COMPLETED',
        statusReason: 'Checked out patient and dispatched Thank You & Post-Care Review Request message.',
      });
      if (!res.success) alert(res.error || 'Failed to complete checkout');
      else {
        setCheckoutAppt(null);
        fetchData();
      }
    });
  };

  const handleResolveNoShowSubmit = (payload: {
    appointmentId: string;
    resolution: 'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'RESCHEDULE';
    reason: string;
    newDate?: string;
    newStartTime?: string;
    newEndTime?: string;
    newDoctorId?: string;
  }) => {
    startTransition(async () => {
      const res = await resolveNoShowAction(payload);
      if (!res.success) alert(res.error || 'Failed to resolve no-show');
      else {
        setResolveAppt(null);
        fetchData();
      }
    });
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleAppt || !rescheduleDate || !rescheduleTime) return;
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
        newDoctorId: rescheduleDoctor || rescheduleAppt.doctorId,
        newServiceId: rescheduleService || rescheduleAppt.serviceId,
      });
      if (!res.success) alert(res.error || 'Failed to reschedule');
      else {
        setRescheduleAppt(null);
        fetchData();
      }
    });
  };

  const handleViewApptDetails = (appointment: AppointmentDto) => {
    setViewAppt(appointment);
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
    checkInAppt,
    setCheckInAppt,
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
    getCheckInStatus,
    handleCheckIn,
    handleUndoCheckIn,
    handleCheckoutComplete,
    handleResolveNoShowSubmit,
    handleRescheduleSubmit,
    handleViewApptDetails,
    isPastEndTime,
  };
}
