// src/app/(portals)/secretary/appointments/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { getAvailableDaysAction } from '@/modules/appointments/actions/availability/get-available-days.action';
import { getAvailableDoctorsForDateAction } from '@/modules/appointments/actions/availability/get-available-doctors-for-date.action';
import { getAvailableTimeSlotsAction } from '@/modules/appointments/actions/availability/get-available-time-slots.action';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatShortDate, formatClinicTime } from '@/shared/utils/date.util';
import { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { AvailableSlotDto } from '@/modules/appointments/dtos/availability/get-available-time-slots.dto';

// ─── Local Types ─────────────────────────────────────────────────────────────
type DoctorFilterItem = { id: string; firstName: string; lastName: string };
type AvailableDoctorItem = { doctorId: string; doctorName: string };

export default function AppointmentsDirectoryPage() {
  // Core data
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [doctors, setDoctors] = useState<DoctorFilterItem[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('');

  // ── Reschedule Form ────────────────────────────────────────────────────────
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [rescheduleJustification, setRescheduleJustification] = useState('');

  // Lock 1 — Treatment
  const [changeTreatment, setChangeTreatment] = useState(false);
  const [services, setServices] = useState<ServiceResponseDto[]>([]);
  const [rescheduleServiceId, setRescheduleServiceId] = useState('');
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // Lock 2 — Doctor (pre-locked to the appointment's current doctor)
  const [changeDoctor, setChangeDoctor] = useState(false);
  const [rescheduleDoctorId, setRescheduleDoctorId] = useState('');         // used only when changeDoctor=true
  const [availableRescheduleDoctors, setAvailableRescheduleDoctors] = useState<AvailableDoctorItem[]>([]);
  const [isLoadingRescheduleDoctors, setIsLoadingRescheduleDoctors] = useState(false);

  // Calendar
  const [rescheduleMonth, setRescheduleMonth] = useState<Date>(new Date());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoadingDays, setIsLoadingDays] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');

  // Timeslots
  const [timeslots, setTimeslots] = useState<AvailableSlotDto[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [rescheduleStartTime, setRescheduleStartTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');

  // Cancel Form
  const [cancelReasonPreset, setCancelReasonPreset] = useState('');
  const [cancelReasonCustom, setCancelReasonCustom] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  // ── Derived: active ids considering lock state ─────────────────────────────
  const selectedApp = appointments.find((a) => a.id === selectedAppId);

  // Service: use new selection if treatment unlocked, else original
  const activeServiceId = changeTreatment ? rescheduleServiceId : (selectedApp?.serviceId ?? '');
  // Doctor: use chosen doctor if change-doctor unlocked, else original appointment doctor
  const activeDoctorId = changeDoctor ? rescheduleDoctorId : (selectedApp?.doctorId ?? '');

  // ── Initial data load ──────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [appRes, docRes] = await Promise.all([
        getClinicAppointmentsAction({}),
        getDoctorsAction(),
      ]);
      if (appRes.success && appRes.data) setAppointments(appRes.data as AppointmentDto[]);
      if (docRes.success && docRes.data) setDoctors(docRes.data as DoctorFilterItem[]);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Reset all form state when selected appointment changes ─────────────────
  useEffect(() => {
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
    setAvailableDates([]);
    setAvailableRescheduleDoctors([]);
    setTimeslots([]);
    setCancelReasonPreset('');
    setCancelReasonCustom('');
  }, [selectedAppId]);

  // ── Load services when "Change Treatment" is unlocked ─────────────────────
  useEffect(() => {
    if (!changeTreatment) return;
    let active = true;
    async function load() {
      setIsLoadingServices(true);
      const res = await getServicesAction();
      if (active) {
        setIsLoadingServices(false);
        if (res.data) setServices(res.data as ServiceResponseDto[]);
      }
    }
    load();
    return () => { active = false; };
  }, [changeTreatment]);

  // ── Calendar: load available days ─────────────────────────────────────────
  // API call matrix (see 6-APPOINTMENTS.md §2.5):
  //  Doctor locked  → pass doctorId to filter calendar to only that doctor's days
  //  Doctor unlocked → no doctorId → show any available day
  useEffect(() => {
    if (!activeServiceId || !showRescheduleForm) { setAvailableDates([]); return; }
    let active = true;
    async function load() {
      setIsLoadingDays(true);
      const monthStr = `${rescheduleMonth.getFullYear()}-${(rescheduleMonth.getMonth() + 1).toString().padStart(2, '0')}`;
      const res = await getAvailableDaysAction({
        serviceId: activeServiceId,
        // Pass locked doctor's ID to narrow calendar to only their available days
        doctorId: !changeDoctor ? (selectedApp?.doctorId ?? undefined) : undefined,
        month: monthStr,
      });
      if (active) {
        setIsLoadingDays(false);
        setAvailableDates(res.success && res.data ? res.data.availableDates || [] : []);
      }
    }
    load();
    return () => { active = false; };
  }, [activeServiceId, rescheduleMonth, changeDoctor, selectedApp?.doctorId, showRescheduleForm]);

  // ── Doctor cards: only shown + fetched when "Change Doctor" is unlocked ────
  useEffect(() => {
    if (!changeDoctor || !rescheduleDate || !activeServiceId) {
      setAvailableRescheduleDoctors([]);
      return;
    }
    let active = true;
    async function load() {
      setIsLoadingRescheduleDoctors(true);
      const res = await getAvailableDoctorsForDateAction({ date: rescheduleDate, serviceId: activeServiceId });
      if (active) {
        setIsLoadingRescheduleDoctors(false);
        setAvailableRescheduleDoctors(res.success && res.data ? (res.data as AvailableDoctorItem[]) : []);
        // Reset downstream when date changes and doctor not yet picked
        setRescheduleDoctorId('');
        setTimeslots([]);
        setRescheduleStartTime('');
        setRescheduleEndTime('');
      }
    }
    load();
    return () => { active = false; };
  }, [changeDoctor, rescheduleDate, activeServiceId]);

  // ── Timeslots: load when date + active doctor known ────────────────────────
  // When doctor is LOCKED: activeDoctorId = selectedApp.doctorId → loads immediately after date
  // When doctor is UNLOCKED: activeDoctorId = rescheduleDoctorId → loads after user picks doctor
  useEffect(() => {
    if (!activeServiceId || !activeDoctorId || !rescheduleDate) { setTimeslots([]); return; }
    let active = true;
    async function load() {
      setIsLoadingSlots(true);
      const res = await getAvailableTimeSlotsAction({
        serviceId: activeServiceId,
        doctorId: activeDoctorId,
        date: rescheduleDate,
      });
      if (active) {
        setIsLoadingSlots(false);
        setTimeslots(res.success && res.data ? (res.data.availableSlots as AvailableSlotDto[]) || [] : []);
        setRescheduleStartTime('');
        setRescheduleEndTime('');
      }
    }
    load();
    return () => { active = false; };
  }, [activeServiceId, activeDoctorId, rescheduleDate]);

  // ── Calendar helpers ───────────────────────────────────────────────────────
  const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const toDateStr = (y: number, m: number, day: number) =>
    `${y}-${(m + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  // ── Toggle helpers (with proper reset cascade per §2.5) ────────────────────
  const toggleChangeTreatment = () => {
    setChangeTreatment((prev) => {
      const next = !prev;
      // Always reset downstream on any toggle
      setRescheduleServiceId('');
      setRescheduleDate('');
      setRescheduleDoctorId('');
      setRescheduleStartTime('');
      setRescheduleEndTime('');
      setAvailableDates([]);
      setAvailableRescheduleDoctors([]);
      setTimeslots([]);
      return next;
    });
  };

  const toggleChangeDoctor = () => {
    setChangeDoctor((prev) => {
      const next = !prev;
      // Reset date + slot downstream; doctor restores via activeDoctorId derivation when re-locked
      setRescheduleDate('');
      setRescheduleDoctorId('');
      setRescheduleStartTime('');
      setRescheduleEndTime('');
      setAvailableDates([]);
      setAvailableRescheduleDoctors([]);
      setTimeslots([]);
      return next;
    });
  };

  // ── Submit: Reschedule ─────────────────────────────────────────────────────
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    if (!rescheduleDate || !activeDoctorId || !rescheduleStartTime || !rescheduleEndTime) {
      return alert('Please complete all scheduling fields (date, doctor, timeslot).');
    }
    if (changeTreatment && !rescheduleServiceId) return alert('Please select a treatment service.');
    if (!rescheduleJustification.trim()) return alert('Justification note is required.');

    setIsSubmitting(true);
    try {
      const res = await updateAppointmentStatusAction({
        appointmentId: selectedApp.id,
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

  // ── Submit: Cancel ─────────────────────────────────────────────────────────
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    const finalReason = cancelReasonPreset === 'CUSTOM' ? cancelReasonCustom : cancelReasonPreset;
    if (!finalReason?.trim()) return alert('Please select or write a cancellation reason.');
    setIsSubmitting(true);
    try {
      const res = await updateAppointmentStatusAction({
        appointmentId: selectedApp.id,
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

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatPatientName = (app: AppointmentDto): string => {
    if (app.dependent) {
      const holder = app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'Unknown';
      return `${app.dependent.firstName} ${app.dependent.lastName} (Dependent: ${holder})`;
    }
    if (app.source === 'STAFF_CREATED' && !app.patientId) {
      return `${app.patient?.firstName ?? 'Guest'} ${app.patient?.lastName ?? ''} (Guest)`;
    }
    return app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'Guest Patient';
  };

  const filteredAppointments = appointments.filter((app) => {
    const isUpcoming = app.status === 'APPROVED';
    const isHistory = ['COMPLETED', 'CANCELLED', 'REJECTED', 'DISPLACED', 'NO_SHOW'].includes(app.status);
    if (activeTab === 'upcoming' && !isUpcoming) return false;
    if (activeTab === 'history' && !isHistory) return false;
    const pName = formatPatientName(app).toLowerCase();
    const docName = app.doctor ? `${app.doctor.firstName} ${app.doctor.lastName}`.toLowerCase() : '';
    const sName = app.service?.name?.toLowerCase() ?? '';
    if (searchTerm && !pName.includes(searchTerm.toLowerCase()) && !docName.includes(searchTerm.toLowerCase()) && !sName.includes(searchTerm.toLowerCase())) return false;
    if (doctorFilter && app.doctorId !== doctorFilter) return false;
    if (dateFilter && app.date !== dateFilter) return false;
    if (activeTab === 'history' && historyStatusFilter && app.status !== historyStatusFilter) return false;
    return true;
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Appointments Directory</h1>
        <p className="text-xs text-text-muted">
          Search and manage all clinic bookings, past records, and status change history ledger logs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-card-border/80">
        {(['upcoming', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelectedAppId(null); }}
            className={`py-2.5 px-6 text-xs font-semibold border-b-2 transition-all capitalize ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tab === 'upcoming' ? 'Upcoming (APPROVED)' : 'History Logs (Closed)'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 border border-card-border bg-card rounded-2xl p-4 shadow-sm">
        <div className="sm:col-span-1">
          <label className="text-[10px] uppercase font-bold text-text-muted mb-1 block">Search Patient / Service</label>
          <Input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="text-xs w-full" />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-text-muted mb-1 block">Date Filter</label>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="w-full text-xs bg-card border border-card-border/80 rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-text-muted mb-1 block">Doctor Filter</label>
          <Select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="text-xs w-full"
            options={[{ value: '', label: 'All Doctors' }, ...doctors.map((d) => ({ value: d.id, label: `Dr. ${d.firstName} ${d.lastName}` }))]} />
        </div>
        {activeTab === 'history' && (
          <div>
            <label className="text-[10px] uppercase font-bold text-text-muted mb-1 block">Status Filter</label>
            <Select value={historyStatusFilter} onChange={(e) => setHistoryStatusFilter(e.target.value)} className="text-xs w-full"
              options={[
                { value: '', label: 'All History' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'DISPLACED', label: 'Displaced' },
                { value: 'NO_SHOW', label: 'No Show' },
              ]} />
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        {/* Table */}
        <div className="lg:col-span-7 border border-card-border bg-card rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col min-h-[40vh]">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-xs text-text-muted">Loading appointments...</div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-card-border text-text-muted font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">Patient</th>
                    <th className="py-3 px-2">Service</th>
                    <th className="py-3 px-2">Doctor</th>
                    <th className="py-3 px-2">Date & Time</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-text-muted">No matching appointments found.</td></tr>
                  ) : (
                    filteredAppointments.map((app) => (
                      <tr key={app.id} onClick={() => setSelectedAppId(app.id)}
                        className={`border-b border-card-border/40 hover:bg-secondary-bg/20 cursor-pointer transition-colors ${selectedAppId === app.id ? 'bg-secondary-bg/50' : ''}`}>
                        <td className="py-3.5 px-2 font-semibold text-text-primary">{formatPatientName(app)}</td>
                        <td className="py-3.5 px-2 text-text-secondary">{app.service?.name || '—'}</td>
                        <td className="py-3.5 px-2 text-text-muted flex items-center gap-1.5">
                          <span>{app.doctor ? `Dr. ${app.doctor.lastName}` : '—'}</span>
                          {app.doctor && (
                            <span title={app.doctorAssignmentSource === 'SYSTEM' ? 'System Assigned' : "Patient's Choice"} className="text-xs">
                              {app.doctorAssignmentSource === 'SYSTEM' ? '🤖' : '👤'}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-2 text-text-muted text-[11px]">
                          {formatShortDate(app.date)} | {formatClinicTime(app.startTime)} – {formatClinicTime(app.endTime)}
                        </td>
                        <td className="py-3.5 px-2">
                          <Badge variant={
                            app.status === 'COMPLETED' ? 'success' :
                            app.status === 'APPROVED' ? 'info' :
                            app.status === 'NO_SHOW' || app.status === 'DISPLACED' ? 'warning' : 'error'
                          }>{app.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail / Action Pane */}
        <div className="lg:col-span-5 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
          {selectedApp ? (
            <div className="flex flex-col gap-4">
              {/* Summary */}
              <div className="border-b border-card-border pb-3">
                <h3 className="text-base font-extrabold text-text-primary">{formatPatientName(selectedApp)}</h3>
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">{selectedApp.service?.name || 'Selected Treatment'}</span>
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Dentist:</span>
                  <span className="font-semibold text-text-primary flex items-center gap-1.5">
                    {selectedApp.doctor ? `Dr. ${selectedApp.doctor.firstName} ${selectedApp.doctor.lastName}` : '—'}
                    {selectedApp.doctor && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary-bg/50 border border-card-border/60 flex items-center gap-1" title={selectedApp.doctorAssignmentSource === 'SYSTEM' ? 'System Auto-Assigned' : 'Requested by Patient'}>
                        {selectedApp.doctorAssignmentSource === 'SYSTEM' ? '🤖 System' : '👤 Patient'}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Scheduled:</span>
                  <span className="font-semibold text-text-primary">
                    {formatShortDate(selectedApp.date)} | {formatClinicTime(selectedApp.startTime)} – {formatClinicTime(selectedApp.endTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Source:</span>
                  <span className="font-semibold text-text-primary text-[10px] uppercase">{selectedApp.source || 'SELF_BOOKED'}</span>
                </div>
                {selectedApp.userNote && (
                  <div className="mt-1 bg-secondary-bg/25 p-2 rounded-lg border border-card-border/60">
                    <span className="text-[10px] uppercase font-bold text-text-muted block mb-0.5">Patient Remarks:</span>
                    <span className="text-[11px] text-text-secondary italic">&quot;{selectedApp.userNote}&quot;</span>
                  </div>
                )}
              </div>

              {/* Actions (upcoming tab only, no form open) */}
              {activeTab === 'upcoming' && !showRescheduleForm && !showCancelForm && (
                <div className="flex gap-2 border-t border-card-border/60 pt-3">
                  <Button onClick={() => setShowRescheduleForm(true)} className="text-xs py-1.5 flex-1 bg-primary text-white">
                    Reschedule
                  </Button>
                  <Button onClick={() => setShowCancelForm(true)} variant="danger" className="text-xs py-1.5 flex-1 border border-red-500 text-red-500 hover:bg-red-500/10">
                    Cancel Slot
                  </Button>
                </div>
              )}

              {/* ═══ DYNAMIC RESCHEDULE FORM — Dual-Lock UX ═══ */}
              {showRescheduleForm && (
                <form onSubmit={handleRescheduleSubmit} className="flex flex-col gap-4 border-t border-card-border/60 pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-text-primary">Reschedule Appointment</h4>
                    {selectedApp.doctor && (
                      <span className="text-[10px] text-text-muted font-medium flex items-center gap-1 bg-secondary-bg/30 px-2 py-0.5 rounded-md border border-card-border/40" title={selectedApp.doctorAssignmentSource === 'SYSTEM' ? 'System Auto-Assigned' : 'Requested by Patient'}>
                        Original Doctor: {selectedApp.doctorAssignmentSource === 'SYSTEM' ? '🤖 System' : '👤 Patient'}
                      </span>
                    )}
                  </div>

                  {/* Lock 1 — Treatment */}
                  <div className="flex items-center justify-between bg-secondary-bg/20 rounded-xl px-3 py-2 border border-card-border/60">
                    <span className="text-[11px] text-text-secondary font-semibold">
                      {changeTreatment
                        ? '🔓 Treatment unlocked — select new service'
                        : `🔒 ${selectedApp.service?.name ?? 'Current Service'}`}
                    </span>
                    <button type="button" onClick={toggleChangeTreatment}
                      className="text-[10px] font-bold text-primary underline ml-2 shrink-0">
                      {changeTreatment ? 'Keep Original' : 'Change Treatment'}
                    </button>
                  </div>

                  {/* Service chips (only when treatment unlocked) */}
                  {changeTreatment && (
                    <div>
                      <label className="text-[10px] text-text-muted mb-1.5 block font-bold uppercase">Select New Treatment</label>
                      {isLoadingServices ? (
                        <span className="text-xs text-text-muted">Loading services...</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {services.map((s) => (
                            <button key={s.id} type="button"
                              onClick={() => { setRescheduleServiceId(s.id); setRescheduleDate(''); setRescheduleDoctorId(''); setRescheduleStartTime(''); setRescheduleEndTime(''); }}
                              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                                rescheduleServiceId === s.id
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-card border-card-border/80 text-text-secondary hover:border-primary/60'
                              }`}>
                              {s.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lock 2 — Doctor */}
                  <div className="flex items-center justify-between bg-secondary-bg/20 rounded-xl px-3 py-2 border border-card-border/60">
                    <span className="text-[11px] text-text-secondary font-semibold">
                      {changeDoctor
                        ? '🔓 Doctor unlocked — pick after selecting date'
                        : `🔒 Dr. ${selectedApp.doctor?.firstName ?? ''} ${selectedApp.doctor?.lastName ?? ''}`}
                    </span>
                    <button type="button" onClick={toggleChangeDoctor}
                      className="text-[10px] font-bold text-primary underline ml-2 shrink-0">
                      {changeDoctor ? 'Keep Original Doctor' : 'Change Doctor'}
                    </button>
                  </div>

                  {/* Calendar — visible once service is known */}
                  {activeServiceId && (
                    <div>
                      <label className="text-[10px] text-text-muted mb-1.5 block font-bold uppercase">Select New Date</label>
                      <div className="flex items-center justify-between mb-2">
                        <button type="button"
                          onClick={() => setRescheduleMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                          className="text-text-muted hover:text-text-primary px-2 text-sm">‹</button>
                        <span className="text-xs font-semibold text-text-primary">
                          {rescheduleMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button type="button"
                          onClick={() => setRescheduleMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                          className="text-text-muted hover:text-text-primary px-2 text-sm">›</button>
                      </div>
                      {isLoadingDays ? (
                        <span className="text-xs text-text-muted">Loading available days...</span>
                      ) : (
                        <div className="grid grid-cols-7 gap-0.5 text-center">
                          {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
                            <span key={d} className="text-[9px] text-text-muted font-bold py-0.5">{d}</span>
                          ))}
                          {Array.from({ length: getFirstDayOfMonth(rescheduleMonth) }).map((_, i) => (
                            <span key={`e-${i}`} />
                          ))}
                          {Array.from({ length: getDaysInMonth(rescheduleMonth) }, (_, i) => i + 1).map((day) => {
                            const dateStr = toDateStr(rescheduleMonth.getFullYear(), rescheduleMonth.getMonth(), day);
                            const isAvail = availableDates.includes(dateStr);
                            const isSelected = rescheduleDate === dateStr;
                            return (
                              <button key={day} type="button" disabled={!isAvail}
                                onClick={() => { setRescheduleDate(dateStr); setRescheduleDoctorId(''); setRescheduleStartTime(''); setRescheduleEndTime(''); }}
                                className={`rounded-lg py-1 text-[11px] font-semibold transition-all ${
                                  isSelected ? 'bg-primary text-white' :
                                  isAvail ? 'hover:bg-primary/20 text-text-primary' :
                                  'text-text-muted/30 cursor-not-allowed'
                                }`}>
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Doctor cards — only shown when "Change Doctor" is unlocked AND date picked */}
                  {changeDoctor && rescheduleDate && (
                    <div>
                      <label className="text-[10px] text-text-muted mb-1.5 block font-bold uppercase">Select New Dentist</label>
                      {isLoadingRescheduleDoctors ? (
                        <span className="text-xs text-text-muted">Loading doctors...</span>
                      ) : availableRescheduleDoctors.length === 0 ? (
                        <span className="text-xs text-text-muted italic">No doctors available for selected date.</span>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {availableRescheduleDoctors.map((doc) => (
                            <button key={doc.doctorId} type="button"
                              onClick={() => setRescheduleDoctorId(doc.doctorId)}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                                rescheduleDoctorId === doc.doctorId
                                  ? 'border-primary bg-primary/10'
                                  : 'border-card-border hover:border-primary/60'
                              }`}>
                              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                {doc.doctorName?.charAt(0) ?? 'D'}
                              </div>
                              <span className="text-xs font-semibold text-text-primary">{doc.doctorName}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timeslot grid — visible when date + activeDoctorId both known */}
                  {rescheduleDate && activeDoctorId && (
                    <div>
                      <label className="text-[10px] text-text-muted mb-1.5 block font-bold uppercase">Select Time Slot</label>
                      {isLoadingSlots ? (
                        <span className="text-xs text-text-muted">Loading timeslots...</span>
                      ) : timeslots.length === 0 ? (
                        <span className="text-xs text-text-muted italic">No slots available for this date.</span>
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5">
                          {timeslots.map((slot) => {
                            const isSelected = rescheduleStartTime === slot.startTime;
                            return (
                              <button key={slot.startTime} type="button"
                                onClick={() => { setRescheduleStartTime(slot.startTime); setRescheduleEndTime(slot.endTime); }}
                                className={`py-2 rounded-xl text-[11px] font-semibold border transition-all ${
                                  isSelected ? 'bg-primary text-white border-primary' : 'border-card-border hover:border-primary/60 text-text-primary'
                                }`}>
                                {formatClinicTime(slot.startTime)} – {formatClinicTime(slot.endTime)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Justification — always required */}
                  <div>
                    <label className="text-[10px] text-text-muted mb-0.5 block font-bold uppercase">
                      Justification Reason <span className="text-red-400">*</span>
                    </label>
                    <Textarea
                      placeholder="Why is this being rescheduled?"
                      value={rescheduleJustification}
                      onChange={(e) => setRescheduleJustification(e.target.value)}
                      className="text-xs w-full min-h-[60px]"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit"
                      disabled={isSubmitting || !rescheduleDate || !activeDoctorId || !rescheduleStartTime || !rescheduleJustification.trim()}
                      className="text-xs py-1.5 flex-1 bg-primary text-white">
                      {isSubmitting ? 'Saving...' : 'Confirm Reschedule'}
                    </Button>
                    <Button type="button" onClick={() => setShowRescheduleForm(false)}
                      className="text-xs py-1.5 flex-1 border border-card-border text-text-primary bg-transparent">
                      Back
                    </Button>
                  </div>
                </form>
              )}

              {/* ═══ Cancel Form ═══ */}
              {showCancelForm && (
                <form onSubmit={handleCancelSubmit} className="flex flex-col gap-3 border-t border-card-border/60 pt-3">
                  <h4 className="text-xs font-bold text-red-500">Cancel Appointment Slot</h4>
                  <div>
                    <label className="text-[10px] text-text-muted mb-0.5 block">Select Reason</label>
                    <Select value={cancelReasonPreset} onChange={(e) => setCancelReasonPreset(e.target.value)} className="text-xs w-full"
                      options={[
                        { value: '', label: 'Select cancellation reason...' },
                        { value: 'Patient requested reschedule / cancellation', label: 'Patient requested' },
                        { value: 'Assigned dentist unavailable today', label: 'Dentist unavailable' },
                        { value: 'Unexpected clinic emergency / closure', label: 'Clinic emergency/holiday' },
                        { value: 'CUSTOM', label: 'Other (write below)' },
                      ]} />
                  </div>
                  {cancelReasonPreset === 'CUSTOM' && (
                    <div>
                      <label className="text-[10px] text-text-muted mb-0.5 block">Details</label>
                      <Textarea placeholder="Write custom cancellation reason..." value={cancelReasonCustom}
                        onChange={(e) => setCancelReasonCustom(e.target.value)} className="text-xs w-full min-h-[60px]" required />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}
                      className="text-xs py-1.5 flex-1 bg-red-500 text-white hover:bg-red-600">
                      {isSubmitting ? 'Processing...' : 'Cancel Appointment'}
                    </Button>
                    <Button type="button" onClick={() => setShowCancelForm(false)}
                      className="text-xs py-1.5 flex-1 border border-card-border text-text-primary bg-transparent">
                      Back
                    </Button>
                  </div>
                </form>
              )}

              {/* Status History Timeline */}
              <div className="border-t border-card-border/80 pt-4 flex flex-col gap-3">
                <span className="text-xs font-bold text-text-secondary">Immutable Status History Logs</span>
                {!selectedApp.statusHistory || selectedApp.statusHistory.length === 0 ? (
                  <span className="text-[11px] text-text-muted italic">No state changes recorded yet.</span>
                ) : (
                  <div className="flex flex-col gap-3">
                    {selectedApp.statusHistory.map((h) => (
                      <div key={h.id} className="border border-card-border/40 rounded-xl p-2.5 bg-secondary-bg/10 flex flex-col gap-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-bold text-text-primary">
                            {h.previousStatus ? `${h.previousStatus} ➔ ` : ''}{h.newStatus}
                          </span>
                          <span className="text-text-muted">{new Date(h.createdAt).toLocaleDateString()}</span>
                        </div>
                        {h.reason && <p className="text-[11px] text-text-secondary leading-relaxed">&quot;{h.reason}&quot;</p>}
                        <span className="text-[9px] text-text-muted text-right">— {h.actorRole}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invoice (COMPLETED only) */}
              {activeTab === 'history' && selectedApp.status === 'COMPLETED' && (
                <div className="border-t border-card-border/80 pt-4 flex flex-col gap-2">
                  <span className="text-xs font-bold text-text-secondary">Invoice Receipt</span>
                  <div className="border border-green-500/25 bg-green-500/5 rounded-xl p-3 text-xs flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Payment status:</span>
                      <span className="font-bold text-green-500 uppercase">Paid & Finalized</span>
                    </div>
                    <a href="/secretary/invoices" className="text-primary hover:underline font-semibold mt-1 inline-block text-[11px]">
                      View Invoice Directory ➔
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-muted text-center py-12">
              Select an appointment from the table to inspect details and history logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
