// src/app/(portals)/secretary/pending/page.tsx
'use client';

import React from 'react';
import { useSecretary } from '@/modules/staff/hooks/use-secretary.hook';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

export default function AppointmentRequestsPage() {
  const {
    appointments,
    selectedAppointmentId,
    setSelectedAppointmentId,
    stagedStatus,
    setStagedStatus,
    stagedReason,
    setStagedReason,
    handleFinishAppointmentReview,
    isSubmitting,
  } = useSecretary();

  const pendingApps = appointments.filter((a) => a.status === 'PENDING');
  const selectedApp = appointments.find((a) => a.id === selectedAppointmentId);

  const doctorSchedule = selectedApp
    ? appointments.filter(
        (app) =>
          app.doctorId === selectedApp.doctorId &&
          app.date === selectedApp.date &&
          app.status !== 'REJECTED' &&
          app.status !== 'CANCELLED'
      )
    : [];

  const CLINIC_HOURS = [
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
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
          <div className="text-sm font-bold text-text-primary mb-3">Pending Requests ({pendingApps.length})</div>
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
                {pendingApps.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-text-muted">
                      No pending requests at this time.
                    </td>
                  </tr>
                ) : (
                  pendingApps.map((app) => (
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
                      <td className="py-3.5 px-2 font-semibold text-text-primary">{app.patientName}</td>
                      <td className="py-3.5 px-2 text-text-secondary">{app.serviceName}</td>
                      <td className="py-3.5 px-2 text-text-muted">
                        {app.date} @ {app.startTime}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Details Pane */}
        <div className="lg:col-span-7 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-5 justify-between">
          {selectedApp ? (
            <div className="flex flex-col gap-5 h-full justify-between">
              {/* Header Info */}
              <div className="flex flex-col gap-4">
                <div className="border-b border-card-border pb-3">
                  <h3 className="text-base font-extrabold text-text-primary">{selectedApp.patientName}</h3>
                  <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider">
                    {selectedApp.serviceName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col">
                    <span className="text-text-muted font-medium">Requested Dentist</span>
                    <span className="text-text-primary font-semibold">{selectedApp.doctorName}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-text-muted font-medium">Desired Slot</span>
                    <span className="text-text-primary font-semibold">
                      {selectedApp.date} {selectedApp.startTime}
                    </span>
                  </div>
                </div>

                {selectedApp.userNote && (
                  <div className="bg-secondary-bg/40 border border-card-border/60 rounded-xl p-3 text-xs text-text-secondary leading-relaxed">
                    <div className="font-bold text-[10px] uppercase text-text-muted mb-1">Patient Note</div>
                    "{selectedApp.userNote}"
                  </div>
                )}

                {/* Reliability Counters */}
                <div className="border border-card-border/40 rounded-xl p-3 bg-secondary-bg/10 flex justify-around text-center text-xs">
                  <div>
                    <span className="block font-bold text-text-primary">1</span>
                    <span className="text-[10px] text-text-muted">Cancellations</span>
                  </div>
                  <div className="border-r border-card-border/50 h-8 self-center" />
                  <div>
                    <span className="block font-bold text-text-primary">0</span>
                    <span className="text-[10px] text-text-muted">No-Shows</span>
                  </div>
                  <div className="border-r border-card-border/50 h-8 self-center" />
                  <div>
                    <span className="block font-bold text-text-primary">2</span>
                    <span className="text-[10px] text-text-muted">Reschedules</span>
                  </div>
                </div>

                {/* Doctor's Daily Schedule Timeline to prevent double-booking */}
                <div className="border border-card-border/60 bg-secondary-bg/5 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex justify-between">
                    <span>📅 Doctor Schedule ({selectedApp.doctorName})</span>
                    <span className="text-[9px] text-primary-start font-bold">{selectedApp.date}</span>
                  </div>
                  
                  {/* Timeline container */}
                  <div className="relative pl-6 flex flex-col gap-3 max-h-[240px] overflow-y-auto pr-1">
                    {/* Vertical Line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-card-border/60" />

                    {CLINIC_HOURS.map((hour) => {
                      const matchedApp = doctorSchedule.find((app) => app.startTime === hour);
                      if (matchedApp) {
                        const isCurrent = matchedApp.id === selectedApp.id;
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
                                  {isCurrent ? '👉 CURRENT REQUEST' : matchedApp.patientName}
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
                      {stagedStatus === 'APPROVED' ? 'Remarks (Optional)' : 'Remarks / Reason (Required)'}
                    </span>
                    {stagedStatus === 'APPROVED' ? (
                      <Select
                        value={stagedReason}
                        onChange={(e) => setStagedReason(e.target.value)}
                        className="text-xs py-2 px-3 rounded-lg border border-card-border"
                        options={[
                          { value: '', label: 'Select approval reason...' },
                          { value: 'Slot is available', label: 'Slot is available' },
                          { value: 'Patient details verified', label: 'Patient details verified' },
                          { value: 'Custom remarks', label: 'Custom remarks' },
                        ]}
                      />
                    ) : (
                      <Textarea
                        value={stagedReason}
                        onChange={(e) => setStagedReason(e.target.value)}
                        placeholder="Enter the justification reason..."
                        rows={2}
                        className="text-xs"
                      />
                    )}
                  </div>
                )}

                <Button
                  onClick={() => handleFinishAppointmentReview(selectedApp.id)}
                  disabled={isSubmitting || !stagedStatus || (stagedStatus !== 'APPROVED' && !stagedReason)}
                  variant="primary"
                  className="w-full text-xs font-bold py-3 mt-2"
                >
                  {isSubmitting ? 'Saving Review...' : 'Finish Review Decision'}
                </Button>
              </div>
            </div>
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
