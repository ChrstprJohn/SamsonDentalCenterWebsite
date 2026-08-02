'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AvailableSlotDto } from '@/modules/appointments/dtos/availability/get-available-time-slots.dto';
import { useBookingScheduler } from '@/modules/appointments/hooks/shared/use-booking-scheduler';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';

export type AppointmentDirectoryTab = 'upcoming' | 'history';
export type DoctorFilterItem = { id: string; firstName: string; lastName: string };
export type AvailableDoctorItem = { doctorId: string; doctorName: string };

export function useSecretaryAppointments() {
  const scheduler = useBookingScheduler();
  const { loadAvailableDates, loadDoctorsForDate, loadAvailableSlots } = scheduler;
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [doctors, setDoctors] = useState<DoctorFilterItem[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedAppointmentId);
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


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [appRes, docRes] = await Promise.all([getClinicAppointmentsAction({}), getDoctorsAction({ includeHidden: true })]);
      if (appRes.success && appRes.data) setAppointments(appRes.data as AppointmentDto[]);
      if (docRes.success && docRes.data) setDoctors(docRes.data as DoctorFilterItem[]);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openRescheduleForm = useCallback(() => {
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
      setRescheduleJustification('Patient requested reschedule');
    }
    setShowRescheduleForm(true);
    setShowCancelForm(false);
  }, [selectedAppointment]);

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

  useEffect(() => {
    let active = true;
    async function loadServices() {
      setIsLoadingServices(true);
      const res = await getServicesAction('BOOKABLE');
      if (!active) return;
      setIsLoadingServices(false);
      if (res?.data) setServices(res.data as ServiceResponseDto[]);
    }
    loadServices();
    return () => { active = false; };
  }, []);


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

  const filteredAppointments = useMemo(() => appointments.filter((appointment) => {
    // A checked-in visit is still active and must remain discoverable in the
    // directory even after the today-only Kanban has moved on.
    const isUpcoming = ['APPROVED', 'CHECKED_IN'].includes(appointment.status);
    const isHistory = ['COMPLETED', 'CANCELLED', 'REJECTED', 'DISPLACED', 'NO_SHOW'].includes(appointment.status);
    if (activeTab === 'upcoming' && !isUpcoming) return false;
    if (activeTab === 'history' && !isHistory) return false;
    const patientName = formatPatientName(appointment).toLowerCase();
    const doctorName = appointment.doctor ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`.toLowerCase() : '';
    const serviceName = appointment.service?.name?.toLowerCase() ?? '';
    if (searchTerm && !patientName.includes(searchTerm.toLowerCase()) && !doctorName.includes(searchTerm.toLowerCase()) && !serviceName.includes(searchTerm.toLowerCase())) return false;
    if (doctorFilter && appointment.doctorId !== doctorFilter) return false;
    if (dateFilter && appointment.date !== dateFilter) return false;
    if (activeTab === 'history' && historyStatusFilter && appointment.status !== historyStatusFilter) return false;
    return true;
  }), [appointments, activeTab, searchTerm, doctorFilter, dateFilter, historyStatusFilter]);

  const selectTab = (tab: AppointmentDirectoryTab) => {
    setActiveTab(tab);
    setSelectedAppointmentId(null);
  };

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
    if (!rescheduleDate || !targetDoctorId || !rescheduleStartTime || !rescheduleEndTime) return alert('Please complete all scheduling fields (date, doctor, timeslot).');
    if (changeTreatment && !rescheduleServiceId) return alert('Please select a treatment service.');
    if (!rescheduleJustification.trim()) return alert('Justification note is required.');
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
        alert('Appointment rescheduled successfully.');
        setShowRescheduleForm(false);
        fetchData();
      } else {
        alert(res.error || 'Failed to reschedule.');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitCancel = async () => {
    if (!selectedAppointment) return;
    const finalReason = cancelReasonPreset === 'CUSTOM' ? cancelReasonCustom : cancelReasonPreset;
    if (!finalReason?.trim()) return alert('Please select or write a cancellation reason.');
    setIsSubmitting(true);
    try {
      const res = await updateAppointmentStatusAction({
        appointmentId: selectedAppointment.id,
        status: 'CANCELLED',
        statusReason: finalReason.trim(),
        confirmationChannel,
      });
      if (res.success) {
        alert('Appointment cancelled successfully.');
        setShowCancelForm(false);
        fetchData();
      } else {
        alert(res.error || 'Failed to cancel.');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    appointments, filteredAppointments, doctors, selectedAppointment, selectedAppointmentId, setSelectedAppointmentId,
    isLoading, isSubmitting, activeTab, selectTab, searchTerm, setSearchTerm, doctorFilter, setDoctorFilter, dateFilter,
    setDateFilter, historyStatusFilter, setHistoryStatusFilter, showRescheduleForm, setShowRescheduleForm: handleSetShowRescheduleForm,
    rescheduleJustification, setRescheduleJustification, changeTreatment, services, rescheduleServiceId,
    isLoadingServices, changeDoctor, rescheduleDoctorId, setRescheduleDoctorId, availableRescheduleDoctors,
    isLoadingRescheduleDoctors: scheduler.loadingKey === 'doctors', rescheduleMonth, setRescheduleMonth, availableDates,
    isLoadingDays: scheduler.loadingKey === 'dates', rescheduleDate, timeslots, isLoadingSlots: scheduler.loadingKey === 'slots',
    rescheduleStartTime, setRescheduleStartTime, rescheduleEndTime, setRescheduleEndTime, cancelReasonPreset, setCancelReasonPreset, cancelReasonCustom, setCancelReasonCustom,
    showCancelForm, setShowCancelForm, confirmationChannel, setConfirmationChannel, activeServiceId, activeDoctorId, formatPatientName, toggleChangeTreatment,
    toggleChangeDoctor, selectRescheduleService, selectRescheduleDate, selectRescheduleSlot, submitReschedule, submitCancel, fetchData,
  };
}

