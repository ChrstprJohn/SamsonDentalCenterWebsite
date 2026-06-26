// src/app/(portals)/secretary/reschedule-requests/page.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { getPatientDetailsForStaffAction } from '@/modules/patients/actions/profile/get-patient-details-for-staff.action';
import { getDoctorScheduleAction } from '@/modules/appointments/actions/availability/get-doctor-schedule.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';

import { formatShortDate, formatClinicTime } from '@/shared/utils/date.util';

export default function RescheduleRequestsPage() {
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [doctorsList, setDoctorsList] = React.useState<any[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = React.useState<string | null>(null);
  const [patientDetails, setPatientDetails] = React.useState<any>(null);
  const [doctorSchedule, setDoctorSchedule] = React.useState<any[]>([]);
  const [stagedStatus, setStagedStatus] = React.useState<'APPROVED' | 'REJECTED' | ''>('');
  const [stagedReason, setStagedReason] = React.useState('');
  const [customReason, setCustomReason] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false);

  const fetchRequests = React.useCallback(async () => {
    setIsLoading(true);
    const [appRes, docListRes] = await Promise.all([
      getClinicAppointmentsAction({ status: 'RESCHEDULE_REQUESTED' }),
      getDoctorsAction()
    ]);
    
    if (appRes.success && appRes.data) {
      setAppointments(appRes.data);
    } else {
      console.error(appRes.error);
    }

    if (docListRes.success && docListRes.data) {
      setDoctorsList(docListRes.data);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const selectedApp = appointments.find((a) => a.id === selectedAppointmentId);

  // Fetch patient details and proposed doctor schedule when selection changes
  React.useEffect(() => {
    if (!selectedApp) {
      setPatientDetails(null);
      setDoctorSchedule([]);
      return;
    }

    async function loadDetails() {
      setIsLoadingDetails(true);
      const targetDoctorId = selectedApp.proposedDoctorId || selectedApp.doctorId;
      const targetDate = selectedApp.proposedDate || selectedApp.date;

      const [patientRes, doctorRes] = await Promise.all([
        getPatientDetailsForStaffAction(selectedApp.patientId, selectedApp.dependentId || undefined),
        getDoctorScheduleAction(targetDoctorId, targetDate),
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

  const handleFinishReviewDecision = async (appId: string) => {
    if (!stagedStatus) return alert('Please select a decision (Approve or Reject) first!');
    const finalReason = stagedReason === 'CUSTOM' ? customReason : stagedReason;
    if (!finalReason || !finalReason.trim()) {
      return alert('Please select or write a reason/remark!');
    }
    setIsSubmitting(true);
    const res = await updateAppointmentStatusAction({
      appointmentId: appId,
      status: stagedStatus as any,
      statusReason: finalReason.trim(),
    });
    if (res.success) {
      alert('Review decision completed successfully.');
      setSelectedAppointmentId(null);
      setStagedStatus('');
      setStagedReason('');
      setCustomReason('');
      fetchRequests();
    } else {
      alert(res.error || 'Failed to update appointment status');
    }
    setIsSubmitting(false);
  };

  const getDoctorName = (docId: string | null) => {
    if (!docId) return 'No doctor assigned';
    const doc = doctorsList.find((d) => d.id === docId);
    if (!doc) return 'Doctor';
    return `${doc.prefix || 'Dr.'} ${doc.firstName} ${doc.lastName}`;
  };

  const CLINIC_HOURS = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Reschedule Requests</h1>
        <p className="text-xs text-text-muted">
          Review patient-proposed rescheduling times and choose to Approve or Reject changes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        {/* Left Column - Requests Table */}
        <div className="lg:col-span-5 border border-card-border bg-card rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col">
          <div className="text-sm font-bold text-text-primary mb-3">Pending Reschedules ({appointments.length})</div>
          {isLoading ? (
            <div className="py-12 text-center text-text-muted text-xs">Loading reschedule requests...</div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-card-border text-text-muted font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">Patient</th>
                    <th className="py-3 px-2">Service</th>
                    <th className="py-3 px-2">Proposed Time</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-text-muted">
                        No pending reschedule requests.
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
                            setCustomReason('');
                          }}
                          className={`border-b border-card-border/40 hover:bg-secondary-bg/20 cursor-pointer transition-colors ${
                            selectedAppointmentId === app.id ? 'bg-secondary-bg/50' : ''
                          }`}
                        >
                          <td className="py-3.5 px-2 font-semibold text-text-primary">{patientName}</td>
                          <td className="py-3.5 px-2 text-text-secondary">{app.service?.name}</td>
                          <td className="py-3.5 px-2 text-rose-500 font-bold">
                            {app.proposedDate ? `${formatShortDate(app.proposedDate)} | ${formatClinicTime(app.proposedStartTime)}` : 'No proposal'}
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
                {/* Header Info */}
                <div className="flex flex-col gap-4">
                  {/* Patient Profile Card */}
                  <div className="border-b border-card-border pb-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-secondary-bg flex items-center justify-center font-bold text-text-secondary text-sm">
                        {(patientDetails?.profile?.firstName?.[0] || 'P') + (patientDetails?.profile?.lastName?.[0] || '')}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-text-muted font-medium">Account Owner</span>
                        <h3 className="text-sm font-black text-text-primary">
                          {patientDetails?.profile?.firstName} {patientDetails?.profile?.lastName}
                        </h3>
                        <span className="text-[10px] text-text-secondary">
                          {patientDetails?.profile?.email} • {patientDetails?.profile?.phoneNumber}
                        </span>
                      </div>
                    </div>

                    {selectedApp.dependent && (
                      <div className="bg-secondary-bg/20 border border-card-border/60 rounded-2xl p-3 flex flex-col gap-1 mt-3 text-xs">
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

                  {/* Comparison Block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-card-border/60 bg-secondary-bg/5 rounded-2xl p-4 flex flex-col gap-2">
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        📅 Original Appointment
                      </div>
                      <div className="flex flex-col text-xs gap-1">
                        <span className="text-text-secondary">Date: <strong className="text-text-primary">{formatShortDate(selectedApp.date)}</strong></span>
                        <span className="text-text-secondary">Time: <strong className="text-text-primary">{formatClinicTime(selectedApp.startTime)} - {formatClinicTime(selectedApp.endTime)}</strong></span>
                        <span className="text-text-secondary">Dentist: <strong className="text-text-primary">{selectedApp.doctor ? `Dr. ${selectedApp.doctor.firstName} ${selectedApp.doctor.lastName}` : 'No doctor'}</strong></span>
                      </div>
                    </div>

                    <div className="border border-primary/30 bg-primary/5 rounded-2xl p-4 flex flex-col gap-2">
                      <div className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        🆕 Proposed Reschedule
                      </div>
                      <div className="flex flex-col text-xs gap-1">
                        <span className="text-text-secondary">Proposed Date: <strong className="text-primary">{selectedApp.proposedDate ? formatShortDate(selectedApp.proposedDate) : 'Not specified'}</strong></span>
                        <span className="text-text-secondary">Proposed Time: <strong className="text-primary">{selectedApp.proposedStartTime ? `${formatClinicTime(selectedApp.proposedStartTime)} - ${formatClinicTime(selectedApp.proposedEndTime)}` : 'Not specified'}</strong></span>
                        <span className="text-text-secondary">Proposed Dentist: <strong className="text-primary">{getDoctorName(selectedApp.proposedDoctorId)}</strong></span>
                      </div>
                    </div>
                  </div>

                  {selectedApp.statusReason && (
                    <div className="bg-secondary-bg/40 border border-card-border/60 rounded-xl p-3 text-xs text-text-secondary leading-relaxed">
                      <div className="font-bold text-[10px] uppercase text-text-muted mb-1">Patient Reason for Reschedule</div>
                      "{selectedApp.statusReason}"
                    </div>
                  )}

                  {/* Proposed Doctor's Daily Schedule Timeline to prevent double-booking */}
                  <div className="border border-card-border/60 bg-secondary-bg/5 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex justify-between">
                      <span>📅 Dentist Schedule ({getDoctorName(selectedApp.proposedDoctorId || selectedApp.doctorId)})</span>
                      <span className="text-[9px] text-primary font-bold">{selectedApp.proposedDate || selectedApp.date}</span>
                    </div>
                    
                    <div className="relative pl-6 flex flex-col gap-3 max-h-[160px] overflow-y-auto pr-1">
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-card-border/60" />

                      {CLINIC_HOURS.map((hour) => {
                        const matchedApp = doctorSchedule.find((app) => formatClinicTime(app.startTime) === hour);
                        if (matchedApp) {
                          const isCurrentProposal = selectedApp.proposedStartTime && formatClinicTime(selectedApp.proposedStartTime) === hour;
                          const patientLabel = matchedApp.dependent
                            ? `${matchedApp.dependent.firstName} ${matchedApp.dependent.lastName}`
                            : (matchedApp.patient ? `${matchedApp.patient.firstName} ${matchedApp.patient.lastName}` : 'Guest');

                          return (
                            <div key={hour} className="relative flex flex-col">
                              <div className={`absolute left-[-20px] top-[14px] w-2.5 h-2.5 rounded-full border-2 ${
                                isCurrentProposal 
                                  ? 'bg-primary border-white ring-2 ring-primary/35' 
                                  : 'bg-text-secondary border-card'
                              }`} />
                              
                              <div className={`p-2.5 px-3.5 rounded-xl text-[11px] border flex justify-between items-center transition-all ${
                                isCurrentProposal
                                  ? 'bg-primary text-white border-primary font-black shadow-md scale-[1.01]'
                                  : 'bg-secondary-bg/25 border-card-border/40 text-text-secondary opacity-75'
                              }`}>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold">{hour}</span>
                                  <span className={isCurrentProposal ? 'text-white font-bold' : 'text-text-primary font-semibold'}>
                                    {isCurrentProposal ? '👉 PROPOSED SLOT' : patientLabel}
                                  </span>
                                </div>
                                <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                                  isCurrentProposal 
                                    ? 'bg-white/20 text-white' 
                                    : matchedApp.status === 'APPROVED'
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
                                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                                }`}>
                                  {isCurrentProposal ? 'PROPOSED' : matchedApp.status}
                                </span>
                              </div>
                            </div>
                          );
                        } else {
                          const isCurrentProposal = selectedApp.proposedStartTime && formatClinicTime(selectedApp.proposedStartTime) === hour;
                          return (
                            <div key={hour} className="relative flex flex-col">
                              <div className="absolute left-[-20px] top-[14px] w-2.5 h-2.5 rounded-full border-2 bg-emerald-500 border-card" />
                              
                              <div className={`p-2.5 px-3.5 rounded-xl text-[11px] border border-dashed border-card-border/60 bg-card flex justify-between items-center text-text-muted transition-colors hover:bg-secondary-bg/10 ${
                                isCurrentProposal ? 'ring-2 ring-primary/40 border-solid border-primary' : ''
                              }`}>
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

                {/* Inline Decision Form */}
                <div className="border-t border-card-border/80 pt-4 flex flex-col gap-4 mt-auto">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-text-secondary">Decision Action</span>
                    <div className="flex gap-2">
                      {(['APPROVED', 'REJECTED'] as const).map((status) => (
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
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                              : 'border-card-border bg-card text-text-muted hover:text-text-primary'
                          }`}
                        >
                          {status === 'APPROVED' ? 'Approve Reschedule' : 'Reject / Keep Original'}
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
                             { value: '', label: 'Select approval remark...' },
                             { value: 'Doctor schedule cleared', label: 'Doctor schedule cleared' },
                             { value: 'Requested slot available', label: 'Requested slot available' },
                             { value: 'Patient emergency priority', label: 'Patient emergency priority' },
                             { value: 'CUSTOM', label: 'Other / Custom Remark...' },
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
                             { value: '', label: 'Select rejection reason...' },
                             { value: 'Proposed slot double-booked', label: 'Proposed slot double-booked' },
                             { value: 'Doctor unavailable on proposed date', label: 'Doctor unavailable on proposed date' },
                             { value: 'Clinic closed on proposed day', label: 'Clinic closed on proposed day' },
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
                    onClick={() => handleFinishReviewDecision(selectedApp.id)}
                    disabled={
                      isSubmitting || 
                      !stagedStatus || 
                      !stagedReason || 
                      (stagedReason === 'CUSTOM' && !customReason.trim())
                    }
                    variant="primary"
                    className="w-full text-xs font-bold py-3 mt-2"
                  >
                    {isSubmitting ? 'Saving Review...' : 'Confirm Decision'}
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-muted text-center py-12">
              Select a reschedule request from the list to review slot details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
