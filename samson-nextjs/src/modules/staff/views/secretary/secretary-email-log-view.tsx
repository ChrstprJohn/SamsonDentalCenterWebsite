// src/app/(portals)/secretary/emails/page.tsx
'use client';

import React from 'react';
import { useSecretaryEmailLog } from '@/modules/staff/hooks/secretary/use-secretary-email-log';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const EVENT_NAME_MAP: Record<string, string> = {
  'APPOINTMENT_BOOKED': 'Booking Confirmation (Patient)',
  'APPOINTMENT_CONVERTED_FROM_INQUIRY': 'Inquiry Approved Confirmation',
  'APPOINTMENT_MANUALLY_BOOKED_PATIENT': 'Manual Booking (Patient)',
  'APPOINTMENT_MANUALLY_BOOKED_GUEST': 'Manual Booking (Guest)',
  'APPOINTMENT_REMINDER_24H': '24-Hour Reminder',
  'APPOINTMENT_REMINDER_48H': '48-Hour Reminder',
  'RESCHEDULE_BOOKING': 'Appointment Rescheduled',
  'CANCEL_BOOKING': 'Appointment Cancelled',
  'STAFF_REPLIED_TO_CHAT': 'Staff Reply Notification',
  'APPOINTMENT_MANUALLY_BOOKED_SMS': 'Manual Booking SMS',
  'PATIENT_REGISTERED': 'Patient Registration OTP',
  'PASSWORD_RESET_REQUESTED': 'Password Reset OTP',
};

export function SecretaryEmailLogView() {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedEmailId,
    setSelectedEmailId,
    selectedEmail,
    filteredEmails,
    handleResend,
    handleRetryAllFailed,
    refreshLogs,
    resendingId,
    isRetryingAll,
    isLoading,
    onlyAppointments,
    setOnlyAppointments,
  } = useSecretaryEmailLog();

  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SENT':
      case 'PROCESSED':
        return 'success';
      case 'FAILED':
      case 'ERROR':
        return 'error';
      case 'PENDING':
      case 'PROCESSING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getEventLabel = (type: string) => EVENT_NAME_MAP[type] || type;

  return (
    <div className="flex flex-col gap-8 h-full p-6 md:p-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Appointment Email Logs</h1>
          <p className="text-xs text-text-muted">
            Live audit record and delivery status of all appointment notifications and reminder emails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refreshLogs}
            disabled={isLoading}
            className="text-xs font-semibold"
          >
            {isLoading ? 'Refreshing...' : '🔄 Refresh Logs'}
          </Button>
          <Button
            size="sm"
            onClick={handleRetryAllFailed}
            disabled={isRetryingAll}
            className="text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isRetryingAll ? 'Retrying Failed...' : '⚡ Retry All Failed'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-card-border bg-card rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
          <Input
            type="text"
            placeholder="Filter logs by recipient email or notification type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs flex-1"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:w-48"
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'SENT', label: 'Sent' },
              { value: 'FAILED', label: 'Failed' },
              { value: 'PENDING', label: 'Pending' },
            ]}
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={onlyAppointments}
            onChange={(e) => setOnlyAppointments(e.target.checked)}
            className="rounded text-primary focus:ring-primary h-4 w-4"
          />
          Appointment Emails Only
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        {/* Left Table */}
        <div className="lg:col-span-8 border border-card-border bg-card rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-card-border text-text-muted font-semibold uppercase tracking-wider">
                  <th className="py-3 px-2">Recipient</th>
                  <th className="py-3 px-2">Notification Event</th>
                  <th className="py-3 px-2">Retries</th>
                  <th className="py-3 px-2">Date & Time</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-text-muted">
                      No matching email logs found.
                    </td>
                  </tr>
                ) : (
                  filteredEmails.map((eml) => (
                    <tr
                      key={eml.id}
                      onClick={() => setSelectedEmailId(eml.id)}
                      className={`border-b border-card-border/40 hover:bg-secondary-bg/20 cursor-pointer transition-colors ${
                        selectedEmailId === eml.id ? 'bg-secondary-bg/50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-2 font-semibold text-text-primary">{eml.recipient}</td>
                      <td className="py-3.5 px-2 font-medium text-text-secondary">
                        {getEventLabel(eml.type)}
                      </td>
                      <td className="py-3.5 px-2 text-text-muted">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          eml.retryCount && eml.retryCount >= 3 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {eml.retryCount ?? 0}/3
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-text-muted">
                        {new Date(eml.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-2">
                        <Badge variant={getStatusVariant(eml.status)}>{eml.status}</Badge>
                      </td>
                      <td className="py-3.5 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                        {eml.status.toUpperCase() === 'FAILED' && (
                          <Button
                            size="sm"
                            className="text-[10px] px-2.5 py-1"
                            onClick={() => handleResend(eml.id)}
                            disabled={resendingId === eml.id}
                          >
                            {resendingId === eml.id ? 'Resending...' : 'Resend'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Details HTML Body View */}
        <div className="lg:col-span-4 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-4">
          {selectedEmail ? (
            <div className="flex flex-col gap-4">
              <div className="border-b border-card-border pb-3">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  Log Details
                </span>
                <h3 className="text-sm font-extrabold text-text-primary mt-1">{selectedEmail.recipient}</h3>
                <span className="text-[10px] text-text-muted">{new Date(selectedEmail.timestamp).toLocaleString()}</span>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <span className="text-text-muted font-medium">Event Type:</span>
                <span className="text-text-primary font-semibold">{getEventLabel(selectedEmail.type)}</span>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <span className="text-text-muted font-medium">Retry Progress:</span>
                <span className="text-text-primary font-semibold">{selectedEmail.retryCount ?? 0} of 3 attempts</span>
              </div>

              {selectedEmail.errorLogs && (
                <div className="flex flex-col gap-1.5 border-t border-card-border/50 pt-3">
                  <span className="text-xs font-bold text-rose-400">Failure Error Log</span>
                  <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3 text-xs font-mono text-rose-300 leading-relaxed whitespace-pre-wrap">
                    {selectedEmail.errorLogs}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5 border-t border-card-border/50 pt-3">
                <span className="text-xs font-bold text-text-secondary">Payload Data</span>
                <div className="bg-secondary-bg/30 border border-card-border/40 rounded-xl p-4 text-xs font-mono text-text-secondary leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedEmail.content || 'Content not logged.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-muted text-center py-12">
              Select an email entry from the table to inspect delivery headers, error logs, and payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

