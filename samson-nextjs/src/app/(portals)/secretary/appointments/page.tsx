// src/app/(portals)/secretary/appointments/page.tsx
'use client';

import React, { useState } from 'react';
import { useSecretary } from '@/modules/staff/hooks/use-secretary.hook';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function AppointmentsDirectoryPage() {
  const { appointments, audits } = useSecretary();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const selectedApp = appointments.find((a) => a.id === selectedAppId);
  const selectedAppAudits = audits.filter((aud) => aud.targetName.includes(selectedAppId || ''));

  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch =
      app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.serviceName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? app.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Appointments Directory</h1>
        <p className="text-xs text-text-muted">
          Search and view all clinic bookings, past records, and status change history ledger logs.
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 border border-card-border bg-card rounded-2xl p-4 shadow-sm">
        <Input
          type="text"
          placeholder="Search by patient, service, doctor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-xs flex-1"
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs sm:w-48"
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'REJECTED', label: 'Rejected' },
            { value: 'CHECKED_IN', label: 'Checked-In' },
            { value: 'TREATMENT_RENDERED', label: 'Treatment Rendered' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
            { value: 'DISPLACED', label: 'Displaced' }
          ]}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        {/* Left: Main Directory Table */}
        <div className="lg:col-span-8 border border-card-border bg-card rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col">
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
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-muted">
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
                      <td className="py-3.5 px-2 font-semibold text-text-primary">{app.patientName}</td>
                      <td className="py-3.5 px-2 text-text-secondary">{app.serviceName}</td>
                      <td className="py-3.5 px-2 text-text-muted">{app.doctorName}</td>
                      <td className="py-3.5 px-2 text-text-muted">
                        {app.date} @ {app.startTime}
                      </td>
                      <td className="py-3.5 px-2">
                        <Badge
                          variant={
                            app.status === 'COMPLETED'
                              ? 'success'
                              : app.status === 'PENDING'
                              ? 'warning'
                              : app.status === 'REJECTED' || app.status === 'CANCELLED'
                              ? 'error'
                              : 'info'
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
        </div>

        {/* Right: Details / Status Ledger History Log Pane */}
        <div className="lg:col-span-4 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-5 overflow-y-auto max-h-[60vh]">
          {selectedApp ? (
            <div className="flex flex-col gap-4">
              <div className="border-b border-card-border pb-3">
                <h3 className="text-base font-extrabold text-text-primary">{selectedApp.patientName}</h3>
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                  {selectedApp.serviceName}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Dentist:</span>
                  <span className="font-semibold text-text-primary">{selectedApp.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Slot Time:</span>
                  <span className="font-semibold text-text-primary">
                    {selectedApp.date} {selectedApp.startTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Source:</span>
                  <span className="font-semibold text-text-primary text-[10px] uppercase">
                    {selectedApp.source}
                  </span>
                </div>
              </div>

              {/* Status History Timeline */}
              <div className="border-t border-card-border/80 pt-4 flex flex-col gap-3">
                <span className="text-xs font-bold text-text-secondary">Status History Logs</span>
                {selectedAppAudits.length === 0 ? (
                  <span className="text-[11px] text-text-muted italic">No state changes recorded yet.</span>
                ) : (
                  <div className="flex flex-col gap-3">
                    {selectedAppAudits.map((aud) => (
                      <div key={aud.id} className="border border-card-border/40 rounded-xl p-2.5 bg-secondary-bg/10 flex flex-col gap-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-bold text-text-primary">{aud.action}</span>
                          <span className="text-text-muted">{new Date(aud.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          "{aud.reason || 'No details provided.'}"
                        </p>
                        <span className="text-[9px] text-text-muted text-right">- {aud.actorName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
