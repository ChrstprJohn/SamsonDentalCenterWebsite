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

  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedAppointmentId);
  const activeServiceId = changeTreatment ? rescheduleServiceId : (selectedAppointment?.serviceId ?? '');
  const activeDoctorId = changeDoctor ? rescheduleDoctorId : (selectedAppointment?.doctorId ?? '');
  const availableDates = showRescheduleForm && activeServiceId ? scheduler.availableDates : [];
  const availableRescheduleDoctors = changeDoctor && rescheduleDate ? scheduler.availableDoctors as AvailableDoctorItem[] : [];
  const timeslots = rescheduleDate && activeDoctorId ? scheduler.availableSlots as AvailableSlotDto[] : [];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [appRes, docRes] = await Promise.all([getClinicAppointmentsAction({}), getDoctorsAction()]);
      if (appRes.success && appRes.data) setAppointments(appRes.data as AppointmentDto[]);
      if (docRes.success && docRes.data) setDoctors(docRes.data as DoctorFilterItem[]);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
    if (!changeTreatment) return;
    let active = true;
    async function loadServices() {
      setIsLoadingServices(true);
      const res = await getServicesAction();
      if (!active) return;
      setIsLoadingServices(false);
      if (res.data) setServices(res.data as ServiceResponseDto[]);
    }
    loadServices();
    return () => { active = false; };
  }, [changeTreatment]);

  useEffect(() => {
    if (!activeServiceId || !showRescheduleForm) return;
    const month = `${rescheduleMonth.getFullYear()}-${(rescheduleMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    loadAvailableDates({
      serviceId: activeServiceId,
      doctorId: !changeDoctor ? (selectedAppointment?.doctorId ?? undefined) : undefined,
      month,
    });
  }, [activeServiceId, rescheduleMonth, changeDoctor, selectedAppointment?.doctorId, showRescheduleForm, loadAvailableDates]);

  useEffect(() => {
    if (!changeDoctor || !rescheduleDate || !activeServiceId) return;
    setRescheduleDoctorId('');
    setRescheduleStartTime('');
    setRescheduleEndTime('');
    loadDoctorsForDate({ date: rescheduleDate, serviceId: activeServiceId });
  }, [changeDoctor, rescheduleDate, activeServiceId, loadDoctorsForDate]);

  useEffect(() => {
    if (!activeServiceId || !activeDoctorId || !rescheduleDate) return;
    setRescheduleStartTime('');
    setRescheduleEndTime('');
    loadAvailableSlots({ serviceId: activeServiceId, doctorId: activeDoctorId, date: rescheduleDate });
  }, [activeServiceId, activeDoctorId, rescheduleDate, loadAvailableSlots]);

  const formatPatientName = (appointment: AppointmentDto): string => {
    if (appointment.dependent) {
      const holder = appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Unknown';
      return `${appointment.dependent.firstName} ${appointment.dependent.lastName} (Dependent: ${holder})`;
    }
    if (appointment.source === 'STAFF_CREATED' && !appointment.patientId) {
      return `${appointment.patient?.firstName ?? 'Guest'} ${appointment.patient?.lastName ?? ''} (Guest)`;
    }
    return appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Guest Patient';
  };

  const filteredAppointments = useMemo(() => appointments.filter((appointment) => {
    const isUpcoming = appointment.status === 'APPROVED';
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
    setRescheduleServiceId('');
    resetRescheduleSlot();
  };

  const toggleChangeDoctor = () => {
    setChangeDoctor((current) => !current);
    resetRescheduleSlot();
  };

  const resetRescheduleSlot = () => {
    setRescheduleDate('');
    setRescheduleDoctorId('');
    setRescheduleStartTime('');
    setRescheduleEndTime('');
  };

  const selectRescheduleService = (serviceId: string) => {
    setRescheduleServiceId(serviceId);
    resetRescheduleSlot();
  };

  const selectRescheduleDate = (date: string) => {
    setRescheduleDate(date);
    setRescheduleDoctorId('');
    setRescheduleStartTime('');
    setRescheduleEndTime('');
  };

  const selectRescheduleSlot = (slot: AvailableSlotDto) => {
    setRescheduleStartTime(slot.startTime);
    setRescheduleEndTime(slot.endTime);
  };

  const submitReschedule = async () => {
    if (!selectedAppointment) return;
    if (!rescheduleDate || !activeDoctorId || !rescheduleStartTime || !rescheduleEndTime) return alert('Please complete all scheduling fields (date, doctor, timeslot).');
    if (changeTreatment && !rescheduleServiceId) return alert('Please select a treatment service.');
    if (!rescheduleJustification.trim()) return alert('Justification note is required.');
    setIsSubmitting(true);
    try {
      const res = await updateAppointmentStatusAction({
        appointmentId: selectedAppointment.id,
        status: 'APPROVED',
        statusReason: rescheduleJustification.trim(),
        newDate: rescheduleDate,
        newStartTime: rescheduleStartTime,
        newEndTime: rescheduleEndTime,
        newDoctorId: activeDoctorId,
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
    setDateFilter, historyStatusFilter, setHistoryStatusFilter, showRescheduleForm, setShowRescheduleForm,
    rescheduleJustification, setRescheduleJustification, changeTreatment, services, rescheduleServiceId,
    isLoadingServices, changeDoctor, rescheduleDoctorId, setRescheduleDoctorId, availableRescheduleDoctors,
    isLoadingRescheduleDoctors: scheduler.loadingKey === 'doctors', rescheduleMonth, setRescheduleMonth, availableDates,
    isLoadingDays: scheduler.loadingKey === 'dates', rescheduleDate, timeslots, isLoadingSlots: scheduler.loadingKey === 'slots',
    rescheduleStartTime, cancelReasonPreset, setCancelReasonPreset, cancelReasonCustom, setCancelReasonCustom,
    showCancelForm, setShowCancelForm, activeServiceId, activeDoctorId, formatPatientName, toggleChangeTreatment,
    toggleChangeDoctor, selectRescheduleService, selectRescheduleDate, selectRescheduleSlot, submitReschedule, submitCancel,
  };
}
