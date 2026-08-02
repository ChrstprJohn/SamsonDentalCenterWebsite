'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { resolveNoShowAction } from '@/modules/appointments/actions/status/resolve-no-show.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import type { AppointmentDto } from '@/modules/appointments/dtos/exports';
import { getTodayLocalDateStr } from '@/shared/utils/date.util';

export type PastFollowUpTab = 'missed-checkouts' | 'no-show-follow-ups';

export function usePastAppointmentFollowUps() {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [activeTab, setActiveTab] = useState<PastFollowUpTab>('missed-checkouts');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolveAppt, setResolveAppt] = useState<AppointmentDto | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [rescheduleDoctor, setRescheduleDoctor] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');
  const [rescheduleJustification, setRescheduleJustification] = useState('');
  const today = getTodayLocalDateStr();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [apptRes, docRes, svcRes] = await Promise.all([
        getClinicAppointmentsAction({}),
        getDoctorsAction({ includeHidden: true }),
        getServicesAction('BOOKABLE'),
      ]);
      if (!apptRes.success) throw new Error(apptRes.error || 'Could not load past appointment follow-ups.');
      setAppointments((apptRes.data || []) as AppointmentDto[]);
      if (docRes.success) setDoctorsList(docRes.data || []);
      if ((svcRes as any).data) setServicesList((svcRes as any).data || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load past appointment follow-ups.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => { void fetchData(); }, 0);
    return () => window.clearTimeout(timeout);
  }, [fetchData]);

  const missedCheckouts = useMemo(
    () => appointments.filter((appointment) => appointment.date < today && appointment.status === 'CHECKED_IN'),
    [appointments, today]
  );
  const unresolvedNoShows = useMemo(
    () => appointments.filter((appointment) =>
      appointment.date < today && appointment.status === 'NO_SHOW' && !appointment.noShowResolvedAt
    ),
    [appointments, today]
  );

  const list = activeTab === 'missed-checkouts' ? missedCheckouts : unresolvedNoShows;
  const selectedAppointment = list.find((appointment) => appointment.id === selectedAppointmentId) || null;

  const selectTab = (tab: PastFollowUpTab) => {
    setActiveTab(tab);
    setSelectedAppointmentId(null);
  };

  const completeMissedCheckout = (appointmentId: string) => {
    setActionError(null);
    startTransition(async () => {
      const result = await updateAppointmentStatusAction({
        appointmentId,
        status: 'COMPLETED',
        statusReason: 'Late checkout — past appointment follow-up',
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
        alert(result.error || 'Could not resolve the no-show.');
        return;
      }
      setResolveAppt(null);
      setSelectedAppointmentId(null);
      await fetchData();
    });
  };

  return {
    activeTab, selectTab, missedCheckouts, unresolvedNoShows, list, selectedAppointment, actionError, setActionError,
    selectedAppointmentId, setSelectedAppointmentId, isLoading, error, isPending, fetchData,
    resolveAppt, setResolveAppt, completeMissedCheckout, handleResolveNoShowSubmit,
    todayStr: today, doctorsList, servicesList,
    rescheduleDoctor, setRescheduleDoctor, rescheduleDate, setRescheduleDate,
    rescheduleTime, setRescheduleTime, rescheduleEndTime, setRescheduleEndTime,
    rescheduleJustification, setRescheduleJustification,
  };
}
