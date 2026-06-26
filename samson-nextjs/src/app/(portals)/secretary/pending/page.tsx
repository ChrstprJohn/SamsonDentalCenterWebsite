// src/app/(portals)/secretary/pending/page.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { getPatientDetailsForStaffAction } from '@/modules/patients/actions/profile/get-patient-details-for-staff.action';
import { getDoctorScheduleAction } from '@/modules/appointments/actions/availability/get-doctor-schedule.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { getAvailableDaysAction } from '@/modules/appointments/actions/availability/get-available-days.action';
import { getAvailableTimeSlotsAction } from '@/modules/appointments/actions/availability/get-available-time-slots.action';

import { formatShortDate, formatClinicTime } from '@/shared/utils/date.util';


export default function AppointmentRequestsPage() {
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = React.useState<string | null>(null);
  const [patientDetails, setPatientDetails] = React.useState<any>(null);
  const [doctorSchedule, setDoctorSchedule] = React.useState<any[]>([]);
  const [stagedStatus, setStagedStatus] = React.useState<'APPROVED' | 'REJECTED' | 'DISPLACED' | ''>('');
  const [stagedReason, setStagedReason] = React.useState('');
  const [customReason, setCustomReason] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = React.useState(false);
  const [editServices, setEditServices] = React.useState<{ id: string; name: string }[]>([]);
  const [editServiceId, setEditServiceId] = React.useState('');
  const [editDoctors, setEditDoctors] = React.useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [editDoctorId, setEditDoctorId] = React.useState('');
  const [editAvailableDates, setEditAvailableDates] = React.useState<string[]>([]);
  const [editDate, setEditDate] = React.useState('');
  const [editCurrentMonth, setEditCurrentMonth] = React.useState(new Date());
  const [editSlots, setEditSlots] = React.useState<{ startTime: string; endTime: string }[]>([]);
  const [editStartTime, setEditStartTime] = React.useState('');
  const [editEndTime, setEditEndTime] = React.useState('');
  const [editNote, setEditNote] = React.useState('');
  const [isLoadingEditDays, setIsLoadingEditDays] = React.useState(false);
  const [isLoadingEditSlots, setIsLoadingEditSlots] = React.useState(false);

  const fetchPending = React.useCallback(async () => {
    setIsLoading(true);
    const res = await getClinicAppointmentsAction({ status: 'PENDING' });
    if (res.success && res.data) {
      setAppointments(res.data);
    } else {
      console.error(res.error);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const selectedApp = appointments.find((a) => a.id === selectedAppointmentId);

  // Fetch patient details and doctor schedule when selection changes
  React.useEffect(() => {
    if (!selectedApp) {
      setPatientDetails(null);
      setDoctorSchedule([]);
      return;
    }

    async function loadDetails() {
      setIsLoadingDetails(true);
      const [patientRes, doctorRes] = await Promise.all([
        getPatientDetailsForStaffAction(selectedApp.patientId, selectedApp.dependentId || undefined),
        getDoctorScheduleAction(selectedApp.doctorId, selectedApp.date),
      ]);

      if (patientRes.success && patientRes.data) {
        setPatientDetails(patientRes.data);
      }
      if (doctorRes.success && doctorRes.data) {
        setDoctorSchedule(doctorRes.data);
      }
      setIsLoadingDetails(false);
    }

    loadDetails();
  }, [selectedAppointmentId, selectedApp]);

  // Check for patient booking conflicts/overlaps on the same date
  const conflictingApp = React.useMemo(() => {
    if (!selectedApp || !patientDetails?.history) return null;
    return patientDetails.history.find((appt: any) => {
      if (appt.id === selectedApp.id) return false;
      if (appt.date !== selectedApp.date) return false;
      
      // Check if status is active
      const isInactive = ['CANCELLED', 'REJECTED', 'DISPLACED'].includes(appt.status);
      if (isInactive) return false;

      const sA = new Date(selectedApp.startTime).getTime();
      const eA = new Date(selectedApp.endTime).getTime();
      const sB = new Date(appt.startTime).getTime();
      const eB = new Date(appt.endTime).getTime();

      return sA < eB && eA > sB;
    });
  }, [selectedApp, patientDetails]);

  // Load services once when edit mode opens
  React.useEffect(() => {
    if (!isEditing || editServices.length > 0) return;
    getServicesAction().then((r) => { if (r.data) setEditServices(r.data); });
  }, [isEditing, editServices.length]);

  // Load doctors when service selected in edit mode
  React.useEffect(() => {
    if (!isEditing || !editServiceId) { setEditDoctors([]); setEditDoctorId(''); setEditAvailableDates([]); return; }
    getDoctorsAction({ serviceId: editServiceId }).then((r) => {
      if (r.success && r.data) setEditDoctors(r.data);
    });
  }, [isEditing, editServiceId]);

  // Load available days when doctor/month changes in edit mode
  React.useEffect(() => {
    if (!isEditing || !editServiceId) { setEditAvailableDates([]); return; }
    let active = true;
    setIsLoadingEditDays(true);
    const month = `${editCurrentMonth.getFullYear()}-${String(editCurrentMonth.getMonth() + 1).padStart(2, '0')}`;
    getAvailableDaysAction({ serviceId: editServiceId, month, doctorId: editDoctorId || undefined }).then((r) => {
      if (active) {
        setEditAvailableDates(r.success && r.data ? r.data.availableDates || [] : []);
        setIsLoadingEditDays(false);
      }
    });
    return () => { active = false; };
  }, [isEditing, editServiceId, editDoctorId, editCurrentMonth]);

  // Load time slots when date selected in edit mode
  React.useEffect(() => {
    if (!isEditing || !editServiceId || !editDate || !editDoctorId) { setEditSlots([]); return; }
    let active = true;
    setIsLoadingEditSlots(true);
    getAvailableTimeSlotsAction({ serviceId: editServiceId, doctorId: editDoctorId, date: editDate }).then((r) => {
      if (active) {
        setEditSlots(r.success && r.data ? r.data.availableSlots || [] : []);
        setIsLoadingEditSlots(false);
      }
    });
    return () => { active = false; };
  }, [isEditing, editServiceId, editDoctorId, editDate]);

  const handleFinishAppointmentReview = async (appId: string) => {
    if (!stagedStatus) return alert('Please select a decision state first!');
    const finalReason = stagedReason === 'CUSTOM' ? customReason : stagedReason;
    if (!finalReason || !finalReason.trim()) {
      return alert('Please select or write a reason/remark!');
    }
    setIsSubmitting(true);

    const payload: any = {
      appointmentId: appId,
      status: stagedStatus as any,
      statusReason: finalReason.trim(),
    };

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

  const CLINIC_HOURS = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Appointment Requests</h1>
        <p className="text-xs text-text-muted">
          Review patient self-bookings and choose to Approve, Reject, or Displace requests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        {/* Left Column - Requests Table */}
        <div className="lg:col-span-5 border border-card-border bg-card rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col">
          <div className="text-sm font-bold text-text-primary mb-3">Pending Requests ({appointments.length})</div>
          {isLoading ? (
            <div className="py-12 text-center text-text-muted text-xs">Loading pending requests...</div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-card-border text-text-muted font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">Patient</th>
                    <th className="py-3 px-2">Service</th>
                    <th className="py-3 px-2">Requested Time</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-text-muted">
                        No pending requests at this time.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((app) => {
                      const patientName = app.dependent
                        ? `${app.dependent.firstName} ${app.dependent.lastName}`
                        : (app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'Guest');
                      return (
                        <tr
                          key={app.id}
                          onClick={() => {
                            setSelectedAppointmentId(app.id);
                            setStagedStatus('');
                            setStagedReason('');
                          }}
                          className={`border-b border-card-border/40 hover:bg-secondary-bg/20 cursor-pointer transition-colors ${
                            selectedAppointmentId === app.id ? 'bg-secondary-bg/50' : ''
                          }`}
                        >
                          <td className="py-3.5 px-2 font-semibold text-text-primary">{patientName}</td>
                          <td className="py-3.5 px-2 text-text-secondary">{app.service?.name}</td>
                          <td className="py-3.5 px-2 text-text-muted">
                            {formatShortDate(app.date)} | {formatClinicTime(app.startTime)} - {formatClinicTime(app.endTime)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column - Details Pane */}
        <div className="lg:col-span-7 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-5 justify-between">
          {selectedApp ? (
            isLoadingDetails ? (
              <div className="h-full flex items-center justify-center text-xs text-text-muted">
                Loading request details...
              </div>
            ) : (
              <div className="flex flex-col gap-5 h-full justify-between animate-in fade-in duration-200">
                {conflictingApp && (
                  <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-rose-600 dark:text-rose-450">
                    <span className="text-base select-none">⚠️</span>
                    <div>
                      <strong className="font-black uppercase tracking-wider block mb-0.5">Booking Conflict Detected</strong>
                      This patient already has an active appointment for <span className="font-bold underline">{conflictingApp.service?.name || 'treatment'}</span> scheduled at the same time: <span className="font-bold">{formatClinicTime(conflictingApp.startTime)} - {formatClinicTime(conflictingApp.endTime)}</span>.
                    </div>
                  </div>
                )}
                {/* Header Info */}
                <div className="flex flex-col gap-4">
                  {/* Account Owner & Patient Profile Card */}
                  <div className="border-b border-card-border pb-4">
                    <div className="flex gap-4 items-center mb-3">
                      {patientDetails?.profile.avatarUrl ? (
                        <img
                          src={patientDetails.profile.avatarUrl}
                          alt="Avatar"
                          className="w-12 h-12 rounded-full border border-card-border object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-secondary-bg flex items-center justify-center font-bold text-text-secondary text-sm">
                          {(patientDetails?.profile.firstName?.[0] || 'P') + (patientDetails?.profile.lastName?.[0] || '')}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs text-text-muted font-medium">Account Owner</span>
                        <h3 className="text-sm font-black text-text-primary">
                          {patientDetails?.profile.firstName} {patientDetails?.profile.lastName}
                        </h3>
                        <span className="text-[10px] text-text-secondary">
                          {patientDetails?.profile.email} • {patientDetails?.profile.phoneNumber}
                        </span>
                      </div>
                    </div>

                    {selectedApp.dependent && (
                      <div className="bg-secondary-bg/20 border border-card-border/60 rounded-2xl p-3 flex flex-col gap-1 mt-2 text-xs">
                        <span className="text-[10px] uppercase font-bold text-text-muted">Actual Patient (Dependent)</span>
                        <div className="font-semibold text-text-primary">
                          {selectedApp.dependent.firstName} {selectedApp.dependent.lastName}
                        </div>
                        <div className="text-[10px] text-text-secondary uppercase">
                          Relationship: {selectedApp.dependent.relationship}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-b border-card-border pb-3">
                    <div className="flex flex-col">
                      <span className="text-text-muted font-medium">Requested Service</span>
                      <span className="text-text-primary font-semibold">{selectedApp.service?.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-text-muted font-medium">Requested Dentist</span>
                      <span className="text-text-primary font-semibold">
                        {selectedApp.doctor ? `${selectedApp.doctor.prefix || 'Dr.'} ${selectedApp.doctor.firstName} ${selectedApp.doctor.lastName}` : 'No doctor assigned'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-text-muted font-medium">Desired Date & Time</span>
                      <span className="text-text-primary font-semibold">
                        {formatShortDate(selectedApp.date)} | {formatClinicTime(selectedApp.startTime)} - {formatClinicTime(selectedApp.endTime)}
                      </span>
                    </div>
                    {(selectedApp.dependent?.dateOfBirth || patientDetails?.profile.dateOfBirth) && (
                      <div className="flex flex-col">
                        <span className="text-text-muted font-medium">Patient Date of Birth</span>
                        <span className="text-text-primary font-semibold">
                          {formatShortDate(selectedApp.dependent ? selectedApp.dependent.dateOfBirth : patientDetails.profile.dateOfBirth)}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedApp.userNote && (
                    <div className="bg-secondary-bg/40 border border-card-border/60 rounded-xl p-3 text-xs text-text-secondary leading-relaxed">
                      <div className="font-bold text-[10px] uppercase text-text-muted mb-1">Appointment Request Note</div>
                      "{selectedApp.userNote}"
                    </div>
                  )}

                  {/* Reliability Counters */}
                  <div className="border border-card-border/40 rounded-xl p-3 bg-secondary-bg/10 flex justify-around text-center text-xs">
                    <div>
                      <span className="block font-bold text-text-primary">{patientDetails?.reliability.completedCount || 0}</span>
                      <span className="text-[10px] text-text-muted">Completed</span>
                    </div>
                    <div className="border-r border-card-border/50 h-8 self-center" />
                    <div>
                      <span className="block font-bold text-text-primary">{patientDetails?.reliability.cancelCount || 0}</span>
                      <span className="text-[10px] text-text-muted">Cancellations</span>
                    </div>
                    <div className="border-r border-card-border/50 h-8 self-center" />
                    <div>
                      <span className="block font-bold text-text-primary">{patientDetails?.reliability.noShowCount || 0}</span>
                      <span className="text-[10px] text-text-muted">No-Shows</span>
                    </div>
                    <div className="border-r border-card-border/50 h-8 self-center" />
                    <div>
                      <span className="block font-bold text-text-primary">{patientDetails?.reliability.rescheduleCount || 0}</span>
                      <span className="text-[10px] text-text-muted">Reschedules</span>
                    </div>
                  </div>

                  {/* Patient History (5 Latest) */}
                  <div className="border border-card-border/45 bg-secondary-bg/5 rounded-2xl p-4 flex flex-col gap-2.5">
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      📜 Patient Past History (Latest 5)
                    </div>
                    <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                      {patientDetails?.history && patientDetails.history.length > 0 ? (
                        patientDetails.history.map((h: any) => (
                          <div key={h.id} className="flex justify-between items-center text-xs p-2 rounded-lg border border-card-border/40 bg-card">
                            <div className="flex flex-col">
                              <span className="font-semibold text-text-primary">{formatShortDate(h.date)} | {formatClinicTime(h.startTime)} - {formatClinicTime(h.endTime)}</span>
                              <span className="text-[10px] text-text-secondary">{h.service?.name}</span>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                              h.status === 'COMPLETED'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : h.status === 'CANCELLED' || h.status === 'REJECTED'
                                ? 'bg-rose-500/10 text-rose-500'
                                : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {h.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-text-muted text-center py-4">No past history found.</span>
                      )}
                    </div>
                  </div>

                  {/* Doctor's Daily Schedule Timeline to prevent double-booking */}
                  <div className="border border-card-border/60 bg-secondary-bg/5 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex justify-between">
                      <span>📅 Doctor Schedule ({selectedApp.doctor ? `${selectedApp.doctor.prefix || 'Dr.'} ${selectedApp.doctor.firstName} ${selectedApp.doctor.lastName}` : 'Doctor'})</span>
                      <span className="text-[9px] text-primary-start font-bold">{selectedApp.date}</span>
                    </div>
                    
                    {/* Timeline container */}
                    <div className="relative pl-6 flex flex-col gap-3 max-h-[180px] overflow-y-auto pr-1">
                      {/* Vertical Line */}
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-card-border/60" />

                      {CLINIC_HOURS.map((hour) => {
                        const matchedApp = doctorSchedule.find((app) => formatClinicTime(app.startTime) === hour);
                        if (matchedApp) {
                          const isCurrent = matchedApp.id === selectedApp.id;
                          const patientLabel = matchedApp.dependent
                            ? `${matchedApp.dependent.firstName} ${matchedApp.dependent.lastName}`
                            : (matchedApp.patient ? `${matchedApp.patient.firstName} ${matchedApp.patient.lastName}` : 'Guest');

                          return (
                            <div 
                              key={hour} 
                              className="relative flex flex-col"
                            >
                              {/* Dot */}
                              <div className={`absolute left-[-20px] top-[14px] w-2.5 h-2.5 rounded-full border-2 ${
                                isCurrent 
                                  ? 'bg-primary-start border-white ring-2 ring-primary-start/35' 
                                  : 'bg-text-secondary border-card'
                              }`} />
                              
                              <div className={`p-2.5 px-3.5 rounded-xl text-[11px] border flex justify-between items-center transition-all ${
                                isCurrent
                                  ? 'bg-primary-start text-white border-primary-start font-black shadow-md scale-[1.01]'
                                  : 'bg-secondary-bg/25 border-card-border/40 text-text-secondary opacity-75'
                              }`}>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold">{hour}</span>
                                  <span className={isCurrent ? 'text-white font-bold' : 'text-text-primary font-semibold'}>
                                    {isCurrent ? '👉 CURRENT REQUEST' : patientLabel}
                                  </span>
                                </div>
                                <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                                  isCurrent 
                                    ? 'bg-white/20 text-white' 
                                    : matchedApp.status === 'APPROVED'
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
                                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                                }`}>
                                  {isCurrent ? 'REQUESTED' : matchedApp.status}
                                </span>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div 
                              key={hour} 
                              className="relative flex flex-col"
                            >
                              {/* Dot */}
                              <div className="absolute left-[-20px] top-[14px] w-2.5 h-2.5 rounded-full border-2 bg-emerald-500 border-card" />
                              
                              <div className="p-2.5 px-3.5 rounded-xl text-[11px] border border-dashed border-card-border/60 bg-card flex justify-between items-center text-text-muted transition-colors hover:bg-secondary-bg/10">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold">{hour}</span>
                                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                    🟢 Free / Available
                                  </span>
                                </div>
                                <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                  OPEN
                                </span>
                              </div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>

                {/* Edit Details Toggle + Panel */}
                <div className="border border-card-border/60 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing((v) => !v);
                      if (!isEditing) {
                        setEditServiceId(selectedApp.serviceId || '');
                        setEditDoctorId(selectedApp.doctorId || '');
                        setEditDate(selectedApp.date || '');
                        setEditNote('');
                        setEditStartTime('');
                        setEditEndTime('');
                      }
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-text-secondary bg-secondary-bg/20 hover:bg-secondary-bg/40 transition-colors"
                  >
                    <span>✏️ Edit Appointment Details Before Deciding</span>
                    <span className="text-[10px] text-primary-start">{isEditing ? '▲ Collapse' : '▼ Expand'}</span>
                  </button>

                  {isEditing && (
                    <div className="p-4 flex flex-col gap-4 bg-card border-t border-card-border/60">
                      {/* Step 1: Service Pills */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">1. Select Service</span>
                        <div className="flex flex-wrap gap-1.5">
                          {editServices.map((svc) => (
                            <button
                              key={svc.id}
                              type="button"
                              onClick={() => {
                                setEditServiceId(svc.id);
                                setEditDoctorId('');
                                setEditDate('');
                                setEditStartTime('');
                                setEditEndTime('');
                              }}
                              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                                editServiceId === svc.id
                                  ? 'bg-primary-start text-white border-primary-start'
                                  : 'bg-card border-card-border text-text-secondary hover:border-primary-start/50'
                              }`}
                            >
                              {svc.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step 2: Doctor */}
                      {editServiceId && (
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">2. Select Doctor</span>
                          <div className="flex flex-wrap gap-1.5">
                            {editDoctors.map((doc) => (
                              <button
                                key={doc.id}
                                type="button"
                                onClick={() => {
                                  setEditDoctorId(doc.id);
                                  setEditDate('');
                                  setEditStartTime('');
                                  setEditEndTime('');
                                }}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                                  editDoctorId === doc.id
                                    ? 'bg-primary-start text-white border-primary-start'
                                    : 'bg-card border-card-border text-text-secondary hover:border-primary-start/50'
                                }`}
                              >
                                Dr. {doc.firstName} {doc.lastName}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 3: Date */}
                      {editDoctorId && (
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">
                            3. Select Date {isLoadingEditDays && <span className="text-primary-start ml-1">Loading...</span>}
                          </span>
                          <div className="flex gap-2 items-center mb-1">
                            <button type="button" onClick={() => setEditCurrentMonth((m) => { const d = new Date(m); d.setMonth(d.getMonth() - 1); return d; })} className="text-xs text-text-muted hover:text-text-primary px-1">‹</button>
                            <span className="text-xs font-bold text-text-primary">
                              {editCurrentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <button type="button" onClick={() => setEditCurrentMonth((m) => { const d = new Date(m); d.setMonth(d.getMonth() + 1); return d; })} className="text-xs text-text-muted hover:text-text-primary px-1">›</button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {editAvailableDates.length === 0 && !isLoadingEditDays && (
                              <span className="text-[11px] text-text-muted">No available dates this month.</span>
                            )}
                            {editAvailableDates.map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => { setEditDate(d); setEditStartTime(''); setEditEndTime(''); }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                                  editDate === d
                                    ? 'bg-primary-start text-white border-primary-start'
                                    : 'bg-card border-card-border text-text-secondary hover:border-primary-start/50'
                                }`}
                              >
                                {formatShortDate(d)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 4: Time Slots */}
                      {editDate && (
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">
                            4. Select Time Slot {isLoadingEditSlots && <span className="text-primary-start ml-1">Loading...</span>}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {editSlots.length === 0 && !isLoadingEditSlots && (
                              <span className="text-[11px] text-text-muted">No available slots on this date.</span>
                            )}
                            {editSlots.map((slot) => (
                              <button
                                key={slot.startTime}
                                type="button"
                                onClick={() => { setEditStartTime(slot.startTime); setEditEndTime(slot.endTime); }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                                  editStartTime === slot.startTime
                                    ? 'bg-primary-start text-white border-primary-start'
                                    : 'bg-card border-card-border text-text-secondary hover:border-primary-start/50'
                                }`}
                              >
                                {formatClinicTime(slot.startTime)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 5: Secretary Note */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">5. Secretary Note (Optional)</span>
                        <textarea
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          placeholder="Add an internal note or message for the patient..."
                          rows={2}
                          className="text-xs border border-card-border rounded-xl px-3 py-2 bg-secondary-bg/20 text-text-primary resize-none focus:outline-none focus:border-primary-start/60"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Inline Staged Action Form */}
                <div className="border-t border-card-border/80 pt-4 flex flex-col gap-4 mt-auto">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-text-secondary">Staged Decision Action</span>
                    <div className="flex gap-2">
                      {(['APPROVED', 'REJECTED', 'DISPLACED'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setStagedStatus(status);
                            setStagedReason('');
                          }}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                            stagedStatus === status
                              ? status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                : status === 'REJECTED'
                                ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                              : 'border-card-border bg-card text-text-muted hover:text-text-primary'
                          }`}
                        >
                          {status === 'APPROVED' ? 'Approve' : status === 'REJECTED' ? 'Reject' : 'Displace'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {stagedStatus && (
                    <div className="flex flex-col gap-2 transition-all">
                      <span className="text-xs font-bold text-text-secondary">
                        Remarks / Reason (Required)
                      </span>
                      {stagedStatus === 'APPROVED' ? (
                        <Select
                           value={stagedReason}
                           onChange={(e) => {
                             setStagedReason(e.target.value);
                             setCustomReason('');
                           }}
                           className="text-xs py-2 px-3 rounded-lg border border-card-border"
                           options={[
                             { value: '', label: 'Select approval reason...' },
                             { value: 'Roster schedule cleared', label: 'Roster schedule cleared' },
                             { value: 'Treatment room available', label: 'Treatment room available' },
                             { value: 'Staff slots balanced', label: 'Staff slots balanced' },
                             { value: 'Family batched reservation finalized', label: 'Family batched reservation finalized' },
                             { value: 'CUSTOM', label: 'Other / Custom Remark...' },
                           ]}
                        />
                      ) : stagedStatus === 'REJECTED' ? (
                        <Select
                           value={stagedReason}
                           onChange={(e) => {
                             setStagedReason(e.target.value);
                             setCustomReason('');
                           }}
                           className="text-xs py-2 px-3 rounded-lg border border-card-border"
                           options={[
                             { value: '', label: 'Select rejection reason...' },
                             { value: 'Doctor unavailable on requested slot', label: 'Doctor unavailable on requested slot' },
                             { value: 'Clinic closed on requested date', label: 'Clinic closed on requested date' },
                             { value: 'Selected service requires pre-consultation', label: 'Selected service requires pre-consultation' },
                             { value: 'Double-booking conflict on slot', label: 'Double-booking conflict on slot' },
                             { value: 'CUSTOM', label: 'Other / Custom Reason...' },
                           ]}
                        />
                      ) : (
                        <Select
                           value={stagedReason}
                           onChange={(e) => {
                             setStagedReason(e.target.value);
                             setCustomReason('');
                           }}
                           className="text-xs py-2 px-3 rounded-lg border border-card-border"
                           options={[
                             { value: '', label: 'Select displacement reason...' },
                             { value: 'Doctor emergency leave', label: 'Doctor emergency leave' },
                             { value: 'Clinic power outage / maintenance', label: 'Clinic power outage / maintenance' },
                             { value: 'Overbooked schedule adjustments', label: 'Overbooked schedule adjustments' },
                             { value: 'Priority emergency treatment took precedence', label: 'Priority emergency treatment took precedence' },
                             { value: 'CUSTOM', label: 'Other / Custom Reason...' },
                           ]}
                        />
                      )}

                      {stagedReason === 'CUSTOM' && (
                        <Textarea
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          placeholder="Enter your custom justification reason..."
                          rows={2}
                          className="text-xs mt-1"
                        />
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => handleFinishAppointmentReview(selectedApp.id)}
                    disabled={
                      isSubmitting || 
                      !stagedStatus || 
                      !stagedReason || 
                      (stagedReason === 'CUSTOM' && !customReason.trim())
                    }
                    variant="primary"
                    className="w-full text-xs font-bold py-3 mt-2"
                  >
                    {isSubmitting ? 'Saving Review...' : 'Finish Review Decision'}
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-muted text-center py-12">
              Select a pending appointment request from the table to start reviewing details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
