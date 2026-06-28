'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAvailableDaysAction } from '@/modules/appointments/actions/availability/get-available-days.action';
import { getAvailableTimeSlotsAction } from '@/modules/appointments/actions/availability/get-available-time-slots.action';
import { getDoctorScheduleAction } from '@/modules/appointments/actions/availability/get-doctor-schedule.action';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { getPatientDetailsForStaffAction } from '@/modules/patients/actions/profile/get-patient-details-for-staff.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';

export type PendingDecision = 'APPROVED' | 'REJECTED' | 'DISPLACED' | '';

export const PENDING_CLINIC_HOURS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
] as const;

export function useSecretaryPendingRequests() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [doctorSchedule, setDoctorSchedule] = useState<any[]>([]);
  const [stagedStatus, setStagedStatus] = useState<PendingDecision>('');
  const [stagedReason, setStagedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editServices, setEditServices] = useState<{ id: string; name: string }[]>([]);
  const [editServiceId, setEditServiceId] = useState('');
  const [editDoctors, setEditDoctors] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [editDoctorId, setEditDoctorId] = useState('');
  const [editAvailableDates, setEditAvailableDates] = useState<string[]>([]);
  const [editDate, setEditDate] = useState('');
  const [editCurrentMonth, setEditCurrentMonth] = useState(new Date());
  const [editSlots, setEditSlots] = useState<{ startTime: string; endTime: string }[]>([]);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editNote, setEditNote] = useState('');
  const [isLoadingEditDays, setIsLoadingEditDays] = useState(false);
  const [isLoadingEditSlots, setIsLoadingEditSlots] = useState(false);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    const res = await getClinicAppointmentsAction({ status: 'PENDING' });
    if (res.success && res.data) setAppointments(res.data);
    else console.error(res.error);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const selectedAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === selectedAppointmentId),
    [appointments, selectedAppointmentId]
  );

  useEffect(() => {
    if (!selectedAppointment) {
      setPatientDetails(null);
      setDoctorSchedule([]);
      return;
    }

    async function loadDetails() {
      setIsLoadingDetails(true);
      const [patientRes, doctorRes] = await Promise.all([
        getPatientDetailsForStaffAction(selectedAppointment.patientId, selectedAppointment.dependentId || undefined),
        getDoctorScheduleAction(selectedAppointment.doctorId, selectedAppointment.date),
      ]);
      if (patientRes.success && patientRes.data) setPatientDetails(patientRes.data);
      if (doctorRes.success && doctorRes.data) setDoctorSchedule(doctorRes.data);
      setIsLoadingDetails(false);
    }

    loadDetails();
  }, [selectedAppointment]);

  const conflictingAppointment = useMemo(() => {
    if (!selectedAppointment || !patientDetails?.history) return null;
    return patientDetails.history.find((appointment: any) => {
      if (appointment.id === selectedAppointment.id || appointment.date !== selectedAppointment.date) return false;
      if (['CANCELLED', 'REJECTED', 'DISPLACED'].includes(appointment.status)) return false;
      return new Date(selectedAppointment.startTime).getTime() < new Date(appointment.endTime).getTime()
        && new Date(selectedAppointment.endTime).getTime() > new Date(appointment.startTime).getTime();
    });
  }, [selectedAppointment, patientDetails]);

  useEffect(() => {
    if (!isEditing || editServices.length > 0) return;
    getServicesAction('BOOKABLE').then((res) => { if (res.data) setEditServices(res.data); });
  }, [isEditing, editServices.length]);

  useEffect(() => {
    if (!isEditing || !editServiceId) {
      setEditDoctors([]);
      setEditDoctorId('');
      setEditAvailableDates([]);
      return;
    }
    getDoctorsAction({ serviceId: editServiceId, includeHidden: true }).then((res) => {
      if (res.success && res.data) setEditDoctors(res.data);
    });
  }, [isEditing, editServiceId]);

  useEffect(() => {
    if (!isEditing || !editServiceId) {
      setEditAvailableDates([]);
      return;
    }
    let active = true;
    setIsLoadingEditDays(true);
    const month = `${editCurrentMonth.getFullYear()}-${String(editCurrentMonth.getMonth() + 1).padStart(2, '0')}`;
    getAvailableDaysAction({ serviceId: editServiceId, month, doctorId: editDoctorId || undefined }).then((res) => {
      if (!active) return;
      setEditAvailableDates(res.success && res.data ? res.data.availableDates || [] : []);
      setIsLoadingEditDays(false);
    });
    return () => { active = false; };
  }, [isEditing, editServiceId, editDoctorId, editCurrentMonth]);

  useEffect(() => {
    if (!isEditing || !editServiceId || !editDate || !editDoctorId) {
      setEditSlots([]);
      return;
    }
    let active = true;
    setIsLoadingEditSlots(true);
    getAvailableTimeSlotsAction({ serviceId: editServiceId, doctorId: editDoctorId, date: editDate }).then((res) => {
      if (!active) return;
      setEditSlots(res.success && res.data ? res.data.availableSlots || [] : []);
      setIsLoadingEditSlots(false);
    });
    return () => { active = false; };
  }, [isEditing, editServiceId, editDoctorId, editDate]);

  const selectAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setStagedStatus('');
    setStagedReason('');
  };

  const toggleEditing = () => {
    setIsEditing((current) => {
      if (!current && selectedAppointment) {
        setEditServiceId(selectedAppointment.serviceId || '');
        setEditDoctorId(selectedAppointment.doctorId || '');
        setEditDate(selectedAppointment.date || '');
        setEditNote('');
        setEditStartTime('');
        setEditEndTime('');
      }
      return !current;
    });
  };

  const setEditService = (serviceId: string) => {
    setEditServiceId(serviceId);
    setEditDoctorId('');
    setEditDate('');
    setEditStartTime('');
    setEditEndTime('');
  };

  const setEditDoctor = (doctorId: string) => {
    setEditDoctorId(doctorId);
    setEditDate('');
    setEditStartTime('');
    setEditEndTime('');
  };

  const setEditAppointmentDate = (date: string) => {
    setEditDate(date);
    setEditStartTime('');
    setEditEndTime('');
  };

  const setEditSlot = (slot: { startTime: string; endTime: string }) => {
    setEditStartTime(slot.startTime);
    setEditEndTime(slot.endTime);
  };

  const setDecision = (status: Exclude<PendingDecision, ''>) => {
    setStagedStatus(status);
    setStagedReason('');
  };

  const setReason = (reason: string) => {
    setStagedReason(reason);
    setCustomReason('');
  };

  const finishAppointmentReview = async (appointmentId: string) => {
    if (!stagedStatus) return alert('Please select a decision state first!');
    const finalReason = stagedReason === 'CUSTOM' ? customReason : stagedReason;
    if (!finalReason || !finalReason.trim()) return alert('Please select or write a reason/remark!');
    setIsSubmitting(true);

    const payload: any = { appointmentId, status: stagedStatus as any, statusReason: finalReason.trim() };
    if (isEditing && editServiceId && editDoctorId && editDate && editStartTime && editEndTime) {
      payload.newServiceId = editServiceId;
      payload.newDoctorId = editDoctorId;
      payload.newDate = editDate;
      payload.newStartTime = editStartTime;
      payload.newEndTime = editEndTime;
    }

    const res = await updateAppointmentStatusAction(payload);
    if (res.success) {
      alert('Review decision completed successfully.');
      setSelectedAppointmentId(null);
      setStagedStatus('');
      setStagedReason('');
      setCustomReason('');
      setIsEditing(false);
      setEditServiceId('');
      setEditDoctorId('');
      setEditDate('');
      setEditStartTime('');
      setEditEndTime('');
      setEditNote('');
      fetchPending();
    } else {
      alert(res.error || 'Failed to update appointment status');
    }
    setIsSubmitting(false);
  };

  return {
    appointments, selectedAppointment, selectedAppointmentId, patientDetails, doctorSchedule, conflictingAppointment,
    stagedStatus, stagedReason, customReason, isLoading, isSubmitting, isLoadingDetails, isEditing,
    editServices, editServiceId, editDoctors, editDoctorId, editAvailableDates, editDate, editCurrentMonth,
    editSlots, editStartTime, editEndTime, editNote, isLoadingEditDays, isLoadingEditSlots,
    selectAppointment, setDecision, setReason, setCustomReason, toggleEditing, setEditService, setEditDoctor,
    setEditAppointmentDate, setEditSlot, setEditCurrentMonth, setEditNote, finishAppointmentReview,
  };
}
