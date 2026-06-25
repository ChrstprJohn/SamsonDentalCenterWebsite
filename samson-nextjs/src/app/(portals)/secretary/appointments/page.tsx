// src/app/(portals)/secretary/appointments/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatShortDate, formatClinicTime } from '@/shared/utils/date.util';

export default function AppointmentsDirectoryPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab State: 'upcoming' (APPROVED) vs 'history' (COMPLETED, CANCELLED, REJECTED, DISPLACED, NO_SHOW)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('');

  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');
  const [rescheduleDoctorId, setRescheduleDoctorId] = useState('');
  const [rescheduleJustification, setRescheduleJustification] = useState('');
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);

  // Cancellation Form State
  const [cancelReasonPreset, setCancelReasonPreset] = useState('');
  const [cancelReasonCustom, setCancelReasonCustom] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  // Fetch appointments and doctors
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [appRes, docRes] = await Promise.all([
        getClinicAppointmentsAction({}),
        getDoctorsAction(),
      ]);

      if (appRes.success && appRes.data) {
        setAppointments(appRes.data);
      } else {
        console.error(appRes.error);
      }

      if (docRes.success && docRes.data) {
        setDoctors(docRes.data);
      } else {
        console.error(docRes.error);
      }
    } catch (err) {
      console.error('Failed to load appointments/doctors:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedApp = appointments.find((a) => a.id === selectedAppId);

  // Reset forms when selected appointment changes
  useEffect(() => {
    setShowRescheduleForm(false);
    setShowCancelForm(false);
    setRescheduleDate('');
    setRescheduleStartTime('');
    setRescheduleEndTime('');
    setRescheduleDoctorId('');
    setRescheduleJustification('');
    setCancelReasonPreset('');
    setCancelReasonCustom('');
  }, [selectedAppId]);

  // Handle Reschedule Submit
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (!rescheduleDate || !rescheduleStartTime || !rescheduleEndTime || !rescheduleDoctorId || !rescheduleJustification.trim()) {
      return alert('All fields and justification are required to reschedule!');
    }

    setIsSubmitting(true);
    try {
      // Construct ISO timestamps
      const newStartTimeIso = new Date(`${rescheduleDate}T${rescheduleStartTime}:00`).toISOString();
      const newEndTimeIso = new Date(`${rescheduleDate}T${rescheduleEndTime}:00`).toISOString();

      const res = await updateAppointmentStatusAction({
        appointmentId: selectedApp.id,
        status: 'APPROVED',
        statusReason: rescheduleJustification.trim(),
        newDate: rescheduleDate,
        newStartTime: newStartTimeIso,
        newEndTime: newEndTimeIso,
        newDoctorId: rescheduleDoctorId,
      });

      if (res.success) {
        alert('Appointment rescheduled successfully.');
        setShowRescheduleForm(false);
        fetchData();
      } else {
        alert(res.error || 'Failed to reschedule.');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during rescheduling.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Cancel Submit
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const finalReason = cancelReasonPreset === 'CUSTOM' ? cancelReasonCustom : cancelReasonPreset;
    if (!finalReason || !finalReason.trim()) {
      return alert('Please select or write a cancellation reason!');
    }

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
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format patient name according to requirements
  const formatPatientName = (app: any) => {
    if (app.dependent) {
      const holderName = app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'Unknown';
      return `${app.dependent.firstName} ${app.dependent.lastName} (Dependent: ${holderName})`;
    }
    if (app.source === 'STAFF_CREATED' && !app.patientId) {
      return `${app.patient?.firstName || 'Guest'} ${app.patient?.lastName || ''} (Guest)`;
    }
    return app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'Guest Patient';
  };

  // Filter logic based on current Tab and Filter parameters
  const filteredAppointments = appointments.filter((app) => {
    // 1. Tab restriction:
    // Tab 1 (Upcoming): Only APPROVED
    // Tab 2 (History): COMPLETED, CANCELLED, REJECTED, DISPLACED, NO_SHOW
    const isUpcoming = app.status === 'APPROVED';
    const isHistory = ['COMPLETED', 'CANCELLED', 'REJECTED', 'DISPLACED', 'NO_SHOW'].includes(app.status);

    if (activeTab === 'upcoming' && !isUpcoming) return false;
    if (activeTab === 'history' && !isHistory) return false;

    // 2. Search filter:
    const pName = formatPatientName(app).toLowerCase();
    const docName = app.doctor ? `${app.doctor.firstName} ${app.doctor.lastName}`.toLowerCase() : '';
    const sName = app.service?.name ? app.service.name.toLowerCase() : '';
    const matchesSearch =
      pName.includes(searchTerm.toLowerCase()) ||
      docName.includes(searchTerm.toLowerCase()) ||
      sName.includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // 3. Doctor filter:
    if (doctorFilter && app.doctorId !== doctorFilter) return false;

    // 4. Date filter:
    if (dateFilter && app.date !== dateFilter) return false;

    // 5. History status sub-filter:
    if (activeTab === 'history' && historyStatusFilter && app.status !== historyStatusFilter) return false;

    return true;
  });

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Appointments Directory</h1>
        <p className="text-xs text-text-muted">
          Search and manage all clinic bookings, past records, and status change history ledger logs.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-card-border/80">
        <button
          onClick={() => {
            setActiveTab('upcoming');
            setSelectedAppId(null);
          }}
          className={`py-2.5 px-6 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'upcoming'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Upcoming (APPROVED)
        </button>
        <button
          onClick={() => {
            setActiveTab('history');
            setSelectedAppId(null);
          }}
          className={`py-2.5 px-6 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          History Logs (Closed)
        </button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 border border-card-border bg-card rounded-2xl p-4 shadow-sm">
        <div className="sm:col-span-1">
          <label className="text-[10px] uppercase font-bold text-text-muted mb-1 block">Search Patient / Service</label>
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs w-full"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-text-muted mb-1 block">Date Filter</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full text-xs bg-card border border-card-border/80 rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-text-muted mb-1 block">Doctor Filter</label>
          <Select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="text-xs w-full"
            options={[
              { value: '', label: 'All Doctors' },
              ...doctors.map((doc) => ({
                value: doc.id,
                label: `${doc.prefix || 'Dr.'} ${doc.firstName} ${doc.lastName}`,
              })),
            ]}
          />
        </div>

        {activeTab === 'history' && (
          <div>
            <label className="text-[10px] uppercase font-bold text-text-muted mb-1 block">Status Filter</label>
            <Select
              value={historyStatusFilter}
              onChange={(e) => setHistoryStatusFilter(e.target.value)}
              className="text-xs w-full"
              options={[
                { value: '', label: 'All History' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'DISPLACED', label: 'Displaced' },
                { value: 'NO_SHOW', label: 'No Show' },
              ]}
            />
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        {/* Left: Main Directory Table */}
        <div className="lg:col-span-8 border border-card-border bg-card rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col min-h-[40vh]">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-xs text-text-muted">
              Loading appointments...
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-card-border text-text-muted font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">Patient</th>
                    <th className="py-3 px-2">Service</th>
                    <th className="py-3 px-2">Doctor</th>
                    <th className="py-3 px-2">Date & Time</th>
                    <th className="py-3 px-2">Source</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-text-muted">
                        No matching appointments found.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((app) => (
                      <tr
                        key={app.id}
                        onClick={() => setSelectedAppId(app.id)}
                        className={`border-b border-card-border/40 hover:bg-secondary-bg/20 cursor-pointer transition-colors ${
                          selectedAppId === app.id ? 'bg-secondary-bg/50' : ''
                        }`}
                      >
                        <td className="py-3.5 px-2 font-semibold text-text-primary">
                          {formatPatientName(app)}
                        </td>
                        <td className="py-3.5 px-2 text-text-secondary">
                          {app.service?.name || 'Clinic Service'}
                        </td>
                        <td className="py-3.5 px-2 text-text-muted">
                          {app.doctor ? `Dr. ${app.doctor.lastName}` : 'Not assigned'}
                        </td>
                        <td className="py-3.5 px-2 text-text-muted">
                          {formatShortDate(app.date)} | {formatClinicTime(app.startTime)} – {formatClinicTime(app.endTime)}
                        </td>
                        <td className="py-3.5 px-2 text-text-muted capitalize text-[10px]">
                          {app.source ? app.source.toLowerCase().replace('_', ' ') : 'self booked'}
                        </td>
                        <td className="py-3.5 px-2">
                          <Badge
                            variant={
                              app.status === 'COMPLETED'
                                ? 'success'
                                : app.status === 'APPROVED'
                                ? 'info'
                                : app.status === 'NO_SHOW' || app.status === 'DISPLACED'
                                ? 'warning'
                                : 'error'
                            }
                          >
                            {app.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Details / History Log Pane */}
        <div className="lg:col-span-4 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
          {selectedApp ? (
            <div className="flex flex-col gap-4">
              <div className="border-b border-card-border pb-3">
                <h3 className="text-base font-extrabold text-text-primary">{formatPatientName(selectedApp)}</h3>
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                  {selectedApp.service?.name || 'Selected Treatment'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Dentist:</span>
                  <span className="font-semibold text-text-primary">
                    {selectedApp.doctor ? `Dr. ${selectedApp.doctor.firstName} ${selectedApp.doctor.lastName}` : 'Not assigned'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Scheduled time:</span>
                  <span className="font-semibold text-text-primary">
                    {formatShortDate(selectedApp.date)} | {formatClinicTime(selectedApp.startTime)} – {formatClinicTime(selectedApp.endTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Origin Source:</span>
                  <span className="font-semibold text-text-primary text-[10px] uppercase">
                    {selectedApp.source || 'SELF_BOOKED'}
                  </span>
                </div>
                {selectedApp.userNote && (
                  <div className="flex flex-col gap-0.5 mt-2 bg-secondary-bg/25 p-2 rounded-lg border border-card-border/60">
                    <span className="text-[10px] uppercase font-bold text-text-muted">Patient Remarks:</span>
                    <span className="text-[11px] text-text-secondary italic">"{selectedApp.userNote}"</span>
                  </div>
                )}
              </div>

              {/* Action Buttons (Tab 1 only) */}
              {activeTab === 'upcoming' && !showRescheduleForm && !showCancelForm && (
                <div className="flex gap-2 border-t border-card-border/60 pt-3">
                  <Button
                    onClick={() => setShowRescheduleForm(true)}
                    className="text-xs py-1.5 flex-1 bg-primary text-white"
                  >
                    Reschedule
                  </Button>
                  <Button
                    onClick={() => setShowCancelForm(true)}
                    variant="danger"
                    className="text-xs py-1.5 flex-1 border border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    Cancel Slot
                  </Button>
                </div>
              )}

              {/* Reschedule Form */}
              {showRescheduleForm && (
                <form onSubmit={handleRescheduleSubmit} className="flex flex-col gap-3 border-t border-card-border/60 pt-3">
                  <h4 className="text-xs font-bold text-text-primary">Reschedule Appointment</h4>
                  
                  <div>
                    <label className="text-[10px] text-text-muted mb-0.5 block">New Date</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      required
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full text-xs bg-card border border-card-border/80 rounded-xl px-3 py-2 text-text-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-text-muted mb-0.5 block">Start Time</label>
                      <input
                        type="time"
                        value={rescheduleStartTime}
                        required
                        onChange={(e) => setRescheduleStartTime(e.target.value)}
                        className="w-full text-xs bg-card border border-card-border/80 rounded-xl px-3 py-2 text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted mb-0.5 block">End Time</label>
                      <input
                        type="time"
                        value={rescheduleEndTime}
                        required
                        onChange={(e) => setRescheduleEndTime(e.target.value)}
                        className="w-full text-xs bg-card border border-card-border/80 rounded-xl px-3 py-2 text-text-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-text-muted mb-0.5 block">Assign Dentist</label>
                    <Select
                      value={rescheduleDoctorId}
                      onChange={(e) => setRescheduleDoctorId(e.target.value)}
                      className="text-xs w-full"
                      options={[
                        { value: '', label: 'Select doctor...' },
                        ...doctors.map((doc) => ({
                          value: doc.id,
                          label: `Dr. ${doc.firstName} ${doc.lastName}`,
                        })),
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-text-muted mb-0.5 block">Justification Reason</label>
                    <Textarea
                      placeholder="Why is this being rescheduled?"
                      value={rescheduleJustification}
                      onChange={(e) => setRescheduleJustification(e.target.value)}
                      className="text-xs w-full min-h-[60px]"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-xs py-1.5 flex-1 bg-primary text-white"
                    >
                      {isSubmitting ? 'Saving...' : 'Confirm'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowRescheduleForm(false)}
                      className="text-xs py-1.5 flex-1 border border-card-border text-text-primary bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* Cancel Form */}
              {showCancelForm && (
                <form onSubmit={handleCancelSubmit} className="flex flex-col gap-3 border-t border-card-border/60 pt-3">
                  <h4 className="text-xs font-bold text-red-500">Cancel Appointment Slot</h4>
                  
                  <div>
                    <label className="text-[10px] text-text-muted mb-0.5 block">Select Reason</label>
                    <Select
                      value={cancelReasonPreset}
                      onChange={(e) => setCancelReasonPreset(e.target.value)}
                      className="text-xs w-full"
                      options={[
                        { value: '', label: 'Select cancellation reason...' },
                        { value: 'Patient requested reschedule / cancellation', label: 'Patient requested' },
                        { value: 'Assigned dentist unavailable today', label: 'Dentist unavailable' },
                        { value: 'Unexpected clinic emergency / closure', label: 'Clinic emergency/holiday' },
                        { value: 'CUSTOM', label: 'Other (write below)' },
                      ]}
                    />
                  </div>

                  {cancelReasonPreset === 'CUSTOM' && (
                    <div>
                      <label className="text-[10px] text-text-muted mb-0.5 block">Details</label>
                      <Textarea
                        placeholder="Write custom cancellation reason..."
                        value={cancelReasonCustom}
                        onChange={(e) => setCancelReasonCustom(e.target.value)}
                        className="text-xs w-full min-h-[60px]"
                        required
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-xs py-1.5 flex-1 bg-red-500 text-white hover:bg-red-600"
                    >
                      {isSubmitting ? 'Processing...' : 'Cancel Appointment'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowCancelForm(false)}
                      className="text-xs py-1.5 flex-1 border border-card-border text-text-primary bg-transparent"
                    >
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
                    {selectedApp.statusHistory.map((h: any) => (
                      <div key={h.id} className="border border-card-border/40 rounded-xl p-2.5 bg-secondary-bg/10 flex flex-col gap-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-bold text-text-primary">
                            {h.previousStatus ? `${h.previousStatus} ➔ ` : ''}{h.newStatus}
                          </span>
                          <span className="text-text-muted">{new Date(h.createdAt).toLocaleDateString()}</span>
                        </div>
                        {h.reason && (
                          <p className="text-[11px] text-text-secondary leading-relaxed">
                            "{h.reason}"
                          </p>
                        )}
                        <span className="text-[9px] text-text-muted text-right">- {h.actorRole}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invoice receipt (COMPLETED status only) */}
              {activeTab === 'history' && selectedApp.status === 'COMPLETED' && (
                <div className="border-t border-card-border/80 pt-4 flex flex-col gap-2">
                  <span className="text-xs font-bold text-text-secondary">Invoice receipt</span>
                  <div className="border border-green-500/25 bg-green-500/5 rounded-xl p-3 text-xs flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Payment status:</span>
                      <span className="font-bold text-green-500 uppercase">Paid & Finalized</span>
                    </div>
                    <a
                      href="/secretary/invoices"
                      className="text-primary hover:underline font-semibold mt-1 inline-block text-[11px]"
                    >
                      View Invoice Directory Details ➔
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
