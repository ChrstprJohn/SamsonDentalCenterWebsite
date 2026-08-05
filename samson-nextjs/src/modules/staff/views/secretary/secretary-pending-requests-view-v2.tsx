'use client';

import React from 'react';
import { useSecretaryInquiriesQueue } from '../../hooks/secretary/use-secretary-inquiries-queue';
import { PendingRequestListV2 } from './sub-components/pending-request-list-v2';
import { CoordinationHub } from './sub-components/coordination-hub';
import { InquiryToast } from './sub-components/inquiry-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ClipboardList,
  Mail,
  Pencil,
  RotateCw,
  UserRound,
  X,
} from 'lucide-react';
import { useToast } from '@/components/feedback/toast-container';
import { resendInquiryNotificationAction } from '@/modules/appointments/actions/booking/resend-inquiry-notification.action';
import { getEmailLogsByInquiryAction } from '@/modules/emails/actions/logs/get-email-logs-by-inquiry.action';
import type { OutboxLogResponseDto } from '@/modules/emails/dtos/logs/outbox-log-response.dto';

function getServiceName(services: { id: string; name: string }[], serviceId: string): string {
  if (!serviceId) return 'No service selected';
  return services.find((s) => s.id === serviceId)?.name || 'Unknown service';
}

function formatPatientName(firstName?: string | null, middleName?: string | null, lastName?: string | null, suffix?: string | null): string {
  const initial = middleName ? ` ${middleName.charAt(0).toUpperCase()}.` : '';
  return `${firstName || ''}${initial} ${lastName || ''}`.trim() + (suffix ? `, ${suffix}` : '');
}

function formatTime(time: string): string {
  if (!time) return '-';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
}

const COMMON_REASONS = [
  'Patient request accepted',
  'Appointment confirmed',
  'Rescheduled from previous date',
  'Emergency case accommodated',
  'Others',
];

export function SecretaryPendingRequestsViewV2() {
  const inquiriesView = useSecretaryInquiriesQueue();
  const [approvalReason, setApprovalReason] = React.useState('');
  const [mobileView, setMobileView] = React.useState<'list' | 'detail' | 'quickLogs'>('list');
  const [isEditingPatient, setIsEditingPatient] = React.useState(false);
  const [patientSnapshot, setPatientSnapshot] = React.useState<Record<string, string>>({});
  const [isEditingSchedule, setIsEditingSchedule] = React.useState(false);
  const [scheduleSnapshot, setScheduleSnapshot] = React.useState<Record<string, string>>({});
  const { addToast } = useToast();
  const [assignedDoctorName, setAssignedDoctorName] = React.useState('');
  const [resendingEventType, setResendingEventType] = React.useState<string | null>(null);
  const [inquiryLogs, setInquiryLogs] = React.useState<OutboxLogResponseDto[]>([]);
  const [loadingInquiryLogs, setLoadingInquiryLogs] = React.useState(false);
  const [allowOverrideResend, setAllowOverrideResend] = React.useState(false);

  const fetchInquiryLogs = React.useCallback(async (inquiryId: string) => {
    setLoadingInquiryLogs(true);
    const res = await getEmailLogsByInquiryAction(inquiryId);
    if (res.success && res.data) {
      setInquiryLogs(res.data);
    }
    setLoadingInquiryLogs(false);
  }, []);

  React.useEffect(() => {
    if (inquiriesView.selectedInquiryId) {
      fetchInquiryLogs(inquiriesView.selectedInquiryId);
    } else {
      setInquiryLogs([]);
    }
  }, [inquiriesView.selectedInquiryId, fetchInquiryLogs]);

  const handleResendInquiryEmail = async () => {
    if (!inquiriesView.selectedInquiry?.id) return;
    setResendingEventType('APPOINTMENT_INQUIRY_RECEIVED');
    const res = await resendInquiryNotificationAction({
      inquiryId: inquiriesView.selectedInquiry.id,
      eventType: 'APPOINTMENT_INQUIRY_RECEIVED',
    });
    if (!res.success) {
      addToast(res.error || 'Failed to resend inquiry email.', 'error');
    } else {
      addToast('Inquiry confirmation email sent successfully.', 'success');
      fetchInquiryLogs(inquiriesView.selectedInquiry.id);
    }
    setResendingEventType(null);
  };

  const handleResendRejectionEmail = async () => {
    if (!inquiriesView.selectedInquiry?.id) return;
    setResendingEventType('REJECT_INQUIRY');
    const res = await resendInquiryNotificationAction({
      inquiryId: inquiriesView.selectedInquiry.id,
      eventType: 'REJECT_INQUIRY',
    });
    if (!res.success) {
      addToast(res.error || 'Failed to resend rejection email.', 'error');
    } else {
      addToast('Rejection email sent successfully.', 'success');
      fetchInquiryLogs(inquiriesView.selectedInquiry.id);
    }
    setResendingEventType(null);
  };

  const colMobile = (view: 'list' | 'detail' | 'quickLogs') =>
    mobileView === view ? 'flex' : 'hidden';

  const isEditing = isEditingSchedule || isEditingPatient;
  const isReady = !!inquiriesView.selectedInquiry?.assignedDoctorId && !!inquiriesView.selectedInquiry?.assignedEndTime;
  const hasSelection = !!inquiriesView.selectedInquiry;

  const startEditPatient = () => {
    setPatientSnapshot({
      firstName: inquiriesView.guestFirstName,
      middleName: inquiriesView.guestMiddleName,
      lastName: inquiriesView.guestLastName,
      suffix: inquiriesView.guestSuffix,
      phone: inquiriesView.guestPhone,
      email: inquiriesView.guestEmail,
    });
    setIsEditingPatient(true);
  };

  const cancelEditPatient = () => {
    inquiriesView.setGuestFirstName(patientSnapshot.firstName || '');
    inquiriesView.setGuestMiddleName(patientSnapshot.middleName || '');
    inquiriesView.setGuestLastName(patientSnapshot.lastName || '');
    inquiriesView.setGuestSuffix(patientSnapshot.suffix || '');
    inquiriesView.setGuestPhone(patientSnapshot.phone || '');
    inquiriesView.setGuestEmail(patientSnapshot.email || '');
    setIsEditingPatient(false);
  };

  const saveEditPatient = async () => {
    await inquiriesView.saveInquiryChanges('patient');
    setIsEditingPatient(false);
  };

  const startEditSchedule = () => {
    setScheduleSnapshot({
      service: inquiriesView.stagedInquiryService,
      date: inquiriesView.stagedInquiryDate,
      time: inquiriesView.stagedInquiryTime,
    });
    setIsEditingSchedule(true);
  };

  const cancelEditSchedule = () => {
    inquiriesView.selectService(scheduleSnapshot.service || '');
    inquiriesView.selectDate(scheduleSnapshot.date || '');
    inquiriesView.setStagedInquiryTime(scheduleSnapshot.time || '');
    setIsEditingSchedule(false);
  };

  const saveEditSchedule = async () => {
    await inquiriesView.saveInquiryChanges('schedule');
    setIsEditingSchedule(false);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className={`xl:w-[400px] lg:w-[380px] flex-1 lg:flex-none flex-col border-r border-card-border/40 bg-sidebar h-full overflow-hidden ${colMobile('list')} lg:flex`}>
        <PendingRequestListV2
          inquiries={inquiriesView.inquiries}
          selectedInquiryId={inquiriesView.selectedInquiryId}
          isLoadingInquiries={inquiriesView.isLoadingInquiries}
          isRefreshingInquiries={inquiriesView.isRefreshingInquiries}
          inquiriesError={inquiriesView.inquiriesError}
          onRetry={() => void inquiriesView.loadInquiries({ force: true })}
          searchTerm={inquiriesView.searchTerm}
          onSearchChange={inquiriesView.setSearchTerm}
          hasMore={inquiriesView.hasMore}
          isLoadingMore={inquiriesView.isLoadingMore}
          loadMoreError={inquiriesView.loadMoreError}
          onLoadMore={inquiriesView.loadMore}
          onSelectInquiry={(inq) => { inquiriesView.selectInquiry(inq); setIsEditingPatient(false); setIsEditingSchedule(false); setAssignedDoctorName(''); setMobileView(inq ? 'detail' : 'list'); }}
          activeTab={inquiriesView.activeTab}
          setActiveTab={inquiriesView.setActiveTab}
          tabCounts={inquiriesView.tabCounts}
          onRefresh={() => void inquiriesView.loadInquiries({ force: true })}
          lastRefreshedAt={inquiriesView.lastRefreshedAt}
        />
      </div>

      {hasSelection ? (
        <>
      <div className={`flex-1 flex-col min-w-0 border-r border-card-border/40 ${colMobile('detail')} xl:flex`}>

        {/* ── FULL-PANEL TAKEOVER: Decision Mode ── */}
        {inquiriesView.stagedInquiryAction ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-card-border/40 shrink-0 h-14 flex items-center">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <button
                  onClick={() => { inquiriesView.setDecision(''); setApprovalReason(''); }}
                  className="p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <div className={`flex-1 text-base font-medium truncate ${
                  inquiriesView.stagedInquiryAction === 'CONVERT' ? 'text-foreground' : 'text-destructive'
                }`}>
                  {inquiriesView.stagedInquiryAction === 'CONVERT' ? 'Approve & Convert' : 'Reject / Drop'}
                </div>
              </div>
            </div>

            {/* Body */}
            <div
              className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
              style={{ scrollbarWidth: 'thin' }}
              data-lenis-prevent
            >
              {/* Summary card */}
              <div className={`rounded-2xl border p-4 flex flex-col gap-3 ${
                inquiriesView.stagedInquiryAction === 'CONVERT'
                  ? 'bg-muted/30 border-card-border/60'
                  : 'bg-destructive/5 border-destructive/20'
              }`}>
                <span className="text-sm font-medium text-foreground">Request Summary</span>
                <hr className="border-card-border/40 -mx-4" />
                <div className="flex items-center gap-3">
                  <div className="size-10 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border border-border/60 overflow-hidden">
                    <UserRound className="size-8 text-muted-foreground/70 translate-y-0.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {formatPatientName(inquiriesView.guestFirstName, inquiriesView.guestMiddleName, inquiriesView.guestLastName, inquiriesView.guestSuffix)}
                    </p>
                    <p className="text-xs text-muted-foreground">Guest</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Service</span>
                    <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{getServiceName(inquiriesView.services, inquiriesView.stagedInquiryService)}</div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Date</span>
                    <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">
                      {inquiriesView.stagedInquiryDate
                        ? new Date(inquiriesView.stagedInquiryDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '-'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Time</span>
                    <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">
                      {formatTime(inquiriesView.stagedInquiryTime)}{inquiriesView.stagedInquiryEndTime ? ` – ${formatTime(inquiriesView.stagedInquiryEndTime)}` : ''}
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Dentist</span>
                    <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">
                      {assignedDoctorName || inquiriesView.availableDoctors.find(d => d.doctorId === inquiriesView.stagedInquiryDoctor)?.doctorName || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {inquiriesView.inlineError && (
                <div className="text-xs font-bold text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                  Error: {inquiriesView.inlineError}
                </div>
              )}

              {/* Decision form */}
              <form
                id="decision-form"
                onSubmit={(e) => { e.preventDefault(); if (inquiriesView.selectedInquiry?.id) inquiriesView.submitReview(inquiriesView.selectedInquiry.id); }}
                className="flex flex-col gap-3"
              >
                {inquiriesView.stagedInquiryAction === 'CONVERT' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground">Notification Channel <span className="text-destructive">*</span></span>
                    <span className="text-xs text-muted-foreground">Which channel should be used to notify the patient?</span>
                    <div className="relative mt-1">
                      <select
                        value={inquiriesView.confirmationChannel || ''}
                        onChange={(e) => inquiriesView.setConfirmationChannel?.(e.target.value as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE')}
                        className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border appearance-none"
                        required
                      >
                        <option value="">Select notification channel...</option>
                        <option value="EMAIL">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="BOTH">Both (Email & SMS)</option>
                        <option value="NONE">None</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-foreground">
                    {inquiriesView.stagedInquiryAction === 'CONVERT' ? 'Approval Note' : 'Drop Reason'}
                    {' '}<span className="text-destructive">*</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {inquiriesView.stagedInquiryAction === 'CONVERT'
                      ? 'Add a note for this approval before confirming.'
                      : 'Provide a reason for dropping this request.'}
                  </span>
                  <div className="relative mt-1">
                    <select
                      value={approvalReason}
                      onChange={(e) => {
                        setApprovalReason(e.target.value);
                        if (e.target.value !== 'Others') {
                          inquiriesView.setStagedInquiryNote(e.target.value);
                        } else {
                          inquiriesView.setStagedInquiryNote('');
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border appearance-none"
                      required
                    >
                      <option value="">
                        {inquiriesView.stagedInquiryAction === 'CONVERT' ? 'Select approval note...' : 'Select drop reason...'}
                      </option>
                      {COMMON_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {approvalReason === 'Others' && (
                    <textarea
                      value={inquiriesView.stagedInquiryNote}
                      onChange={(e) => inquiriesView.setStagedInquiryNote(e.target.value)}
                      placeholder="Enter custom reason..."
                      rows={3}
                      className="w-full text-sm border border-card-border rounded-xl px-4 py-2.5 bg-card focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border resize-none mt-1"
                    />
                  )}
                </div>
              </form>
            </div>

            {/* Sticky footer */}
            <div className="border-t border-card-border/40 px-5 py-4 shrink-0 flex gap-3">
              <Button
                type="submit"
                form="decision-form"
                disabled={!inquiriesView.canSubmit || inquiriesView.isSubmitting}
                className={`flex-1 h-[44px] text-sm font-semibold rounded-xl disabled:opacity-50 ${
                  inquiriesView.stagedInquiryAction === 'CONVERT'
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-destructive text-white hover:bg-destructive/90'
                }`}
              >
                {inquiriesView.isSubmitting
                  ? 'Saving...'
                  : `Confirm ${inquiriesView.stagedInquiryAction === 'CONVERT' ? 'Approval' : 'Rejection'}`}
              </Button>
              <Button
                type="button"
                onClick={() => { inquiriesView.setDecision(''); setApprovalReason(''); }}
                className="flex-1 h-[44px] text-sm font-medium border border-card-border text-foreground bg-transparent hover:bg-muted rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          /* ── NORMAL VIEW: Request Details ── */
          <>
            <div className="p-4 border-b border-card-border/40 shrink-0 h-14 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <button
                  onClick={() => {
                    inquiriesView.selectInquiry(null);
                    setMobileView('list');
                  }}
                  className="p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <div className="flex-1 text-base font-medium text-foreground text-left truncate">
                  Request Details
                </div>
              </div>
              <button onClick={() => setMobileView('quickLogs')} className="xl:hidden p-1 -mr-1 text-muted-foreground hover:text-foreground shrink-0 flex flex-col items-center gap-0.5">
                <ClipboardList className="size-5" />
                <span className="text-[10px] leading-none">Notes</span>
              </button>
            </div>
            <div className="flex-1 !overflow-y-auto max-md:px-5 px-5 space-y-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
              style={{ scrollbarWidth: 'thin' }}
              data-lenis-prevent
            >
                  <div className="flex flex-col items-center pt-4 pb-3">
                    <div className="size-12 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border-2 border-border/60 overflow-hidden mb-3">
                      <UserRound className="size-10 text-muted-foreground/70 translate-y-0.5" />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">
                      {isEditingPatient
                        ? formatPatientName(patientSnapshot.firstName, patientSnapshot.middleName, patientSnapshot.lastName, patientSnapshot.suffix)
                        : formatPatientName(inquiriesView.guestFirstName, inquiriesView.guestMiddleName, inquiriesView.guestLastName, inquiriesView.guestSuffix)
                      }
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Guest</p>
                  </div>

                  <hr className="border-card-border/40" />

                  {inquiriesView.inlineError && (
                    <div className="text-xs font-bold text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 my-3">
                      Error: {inquiriesView.inlineError}
                    </div>
                  )}

                  {/* Section: Current Status */}
                  <div className="flex flex-col gap-2 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Current Status</span>
                      <Badge variant={inquiriesView.selectedInquiry?.status === 'NEW' ? 'warning' : inquiriesView.selectedInquiry?.status === 'CONVERTED' ? 'success' : 'error'} className="text-xs px-3 py-1">
                        {inquiriesView.selectedInquiry?.status === 'NEW' ? 'NEW / PENDING' : inquiriesView.selectedInquiry?.status === 'CONVERTED' ? 'CONVERTED / APPROVED' : 'DROPPED / REJECTED'}
                      </Badge>
                    </div>

                  <hr className="border-card-border/40" />

                  {/* Section: Notification History */}
                  <div className="py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground block">Notification History</span>
                      <Label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
                        <span>Manual Resend</span>
                        <Switch
                          checked={allowOverrideResend}
                          onCheckedChange={setAllowOverrideResend}
                          className="scale-75 shadow-none"
                        />
                      </Label>
                    </div>

                    {/* Entry 1: Inquiry Request Received */}
                    {(() => {
                      const inquiryLog = inquiryLogs.find((l) => l.eventType === 'APPOINTMENT_INQUIRY_RECEIVED');
                      const statusLabel = loadingInquiryLogs
                        ? 'LOADING...'
                        : inquiryLog
                          ? (inquiryLog.status === 'PROCESSED' ? 'SENT' : inquiryLog.status === 'FAILED' ? 'FAILED' : 'PENDING')
                          : (inquiriesView.selectedInquiry?.status === 'NEW' ? 'NOT SENT' : 'NOT APPLICABLE');

                      const badgeClass = loadingInquiryLogs
                        ? 'bg-muted text-muted-foreground/60 animate-pulse'
                        : statusLabel === 'SENT'
                          ? 'bg-green-500/10 text-green-500'
                          : statusLabel === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-600'
                            : statusLabel === 'PENDING'
                              ? 'bg-muted text-muted-foreground/60'
                              : 'bg-slate-500/10 text-slate-500 dark:text-slate-400';

                      const isSendingThis = resendingEventType === 'APPOINTMENT_INQUIRY_RECEIVED';
                      const btnLabel = loadingInquiryLogs
                        ? 'Loading...'
                        : isSendingThis
                          ? 'Sending...'
                          : statusLabel === 'SENT'
                            ? 'Send New'
                            : statusLabel === 'FAILED'
                              ? 'Retry'
                              : statusLabel === 'PENDING'
                                ? 'Send Now'
                                : statusLabel === 'NOT SENT' && inquiriesView.selectedInquiry?.status === 'NEW'
                                  ? 'Send Email'
                                  : 'Force Send';

                      const isAllowed = !loadingInquiryLogs && !resendingEventType && (
                        (Boolean(inquiryLog) && (statusLabel === 'PENDING' || statusLabel === 'FAILED')) ||
                        (statusLabel === 'NOT SENT' && inquiriesView.selectedInquiry?.status === 'NEW') ||
                        allowOverrideResend
                      );

                      return (
                        <div className="space-y-1.5">
                          <span className="text-xs text-muted-foreground">Inquiry Request Received</span>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary-bg/20 border border-card-border/60">
                              <div className="flex items-center gap-2 min-w-0">
                                <Mail className="size-3.5 text-muted-foreground shrink-0" />
                                <span className="text-sm text-foreground">Email</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${badgeClass}`}>
                                  {statusLabel}
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!isAllowed}
                                onClick={handleResendInquiryEmail}
                                className="text-[10px] h-7 px-2.5 gap-1 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <RotateCw className={`size-3 ${loadingInquiryLogs || isSendingThis ? 'animate-spin' : ''}`} />
                                {btnLabel}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Entry 2: Request Rejection */}
                    {(() => {
                      const rejectionLog = inquiryLogs.find((l) => l.eventType === 'REJECT_INQUIRY');
                      const statusLabel = loadingInquiryLogs
                        ? 'LOADING...'
                        : rejectionLog
                          ? (rejectionLog.status === 'PROCESSED' ? 'SENT' : rejectionLog.status === 'FAILED' ? 'FAILED' : 'PENDING')
                          : (inquiriesView.selectedInquiry?.status === 'DROPPED' ? 'NOT SENT' : 'NOT APPLICABLE');

                      const badgeClass = loadingInquiryLogs
                        ? 'bg-muted text-muted-foreground/60 animate-pulse'
                        : statusLabel === 'SENT'
                          ? 'bg-green-500/10 text-green-500'
                          : statusLabel === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-600'
                            : statusLabel === 'PENDING'
                              ? 'bg-muted text-muted-foreground/60'
                              : 'bg-slate-500/10 text-slate-500 dark:text-slate-400';

                      const isSendingThis = resendingEventType === 'REJECT_INQUIRY';
                      const btnLabel = loadingInquiryLogs
                        ? 'Loading...'
                        : isSendingThis
                          ? 'Sending...'
                          : statusLabel === 'SENT'
                            ? 'Send New'
                            : statusLabel === 'FAILED'
                              ? 'Retry'
                              : statusLabel === 'PENDING'
                                ? 'Send Now'
                                : statusLabel === 'NOT SENT' && inquiriesView.selectedInquiry?.status === 'DROPPED'
                                  ? 'Send Rejection'
                                  : 'Force Send';

                      const isAllowed = !loadingInquiryLogs && !resendingEventType && (
                        (Boolean(rejectionLog) && (statusLabel === 'PENDING' || statusLabel === 'FAILED')) ||
                        (statusLabel === 'NOT SENT' && inquiriesView.selectedInquiry?.status === 'DROPPED') ||
                        allowOverrideResend
                      );

                      return (
                        <div className="space-y-1.5">
                          <span className="text-xs text-muted-foreground">Request Rejection</span>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary-bg/20 border border-card-border/60">
                              <div className="flex items-center gap-2 min-w-0">
                                <Mail className="size-3.5 text-muted-foreground shrink-0" />
                                <span className="text-sm text-foreground">Email</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${badgeClass}`}>
                                  {statusLabel}
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!isAllowed}
                                onClick={handleResendRejectionEmail}
                                className="text-[10px] h-7 px-2.5 gap-1 shrink-0 border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <RotateCw className={`size-3 ${loadingInquiryLogs || isSendingThis ? 'animate-spin' : ''}`} />
                                {btnLabel}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  </div>

                  <hr className="border-card-border/40" />

                  {/* Section 1: Patient Information */}
                  <div className="py-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-foreground">
                        Guest Information
                      </span>
                      {inquiriesView.selectedInquiry?.status === 'NEW' && (!isEditingPatient ? (
                        <Button variant="outline" size="sm" onClick={startEditPatient} className="h-7 px-2.5 text-xs gap-1">
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={cancelEditPatient} className="h-7 px-2.5 text-xs gap-1">
                            <X className="size-3.5" />
                            Cancel
                          </Button>
                          <Button size="sm" onClick={saveEditPatient} className="h-7 px-2.5 text-xs gap-1 bg-slate-900 text-white rounded-md">
                            <Check className="size-3.5" />
                            Save
                          </Button>
                        </div>
                      ))}
                    </div>

                    {!isEditingPatient ? (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">First Name</span>
                            <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{inquiriesView.guestFirstName || '-'}</div>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Last Name</span>
                            <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{inquiriesView.guestLastName || '-'}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Middle Name</span>
                            <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{inquiriesView.guestMiddleName || '-'}</div>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Suffix</span>
                            <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{inquiriesView.guestSuffix || '-'}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">First Name</span>
                            <input value={inquiriesView.guestFirstName} onChange={(e) => inquiriesView.setGuestFirstName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Last Name</span>
                            <input value={inquiriesView.guestLastName} onChange={(e) => inquiriesView.setGuestLastName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Middle Name</span>
                            <input value={inquiriesView.guestMiddleName} onChange={(e) => inquiriesView.setGuestMiddleName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Suffix</span>
                            <input value={inquiriesView.guestSuffix} onChange={(e) => inquiriesView.setGuestSuffix(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 1b: Guest Contact */}
                  <div className="py-4 space-y-3">
                    <span className="text-sm font-medium text-foreground block">Guest Contact</span>

                    {!isEditingPatient ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Email</span>
                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{inquiriesView.guestEmail || '-'}</div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Phone</span>
                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{inquiriesView.guestPhone || '-'}</div>
                      </div>
                      {inquiriesView.stagedInquiryNote && (
                        <div className="col-span-full flex flex-col gap-0.5">
                          <span className="text-xs text-muted-foreground">Note</span>
                          <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default italic">&ldquo;{inquiriesView.stagedInquiryNote}&rdquo;</div>
                        </div>
                      )}
                    </div>
                    ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Email</span>
                        <input type="email" value={inquiriesView.guestEmail} onChange={(e) => inquiriesView.setGuestEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Phone</span>
                        <input value={inquiriesView.guestPhone} onChange={(e) => inquiriesView.setGuestPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                      </div>
                      <div className="col-span-full flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Note</span>
                        <textarea value={inquiriesView.stagedInquiryNote || ''} onChange={(e) => inquiriesView.setStagedInquiryNote(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border resize-none" rows={2} />
                      </div>
                    </div>
                    )}
                  </div>

                  <hr className="border-card-border/40" />

                  {/* Section 2: Appointment Details */}
                  <div className="py-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-foreground">
                        Service &amp; Schedule
                      </span>
                      {inquiriesView.selectedInquiry?.status === 'NEW' && (isEditingSchedule ? (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={cancelEditSchedule} className="h-7 px-2.5 text-xs gap-1">
                            <X className="size-3.5" />
                            Cancel
                          </Button>
                          <Button size="sm" onClick={saveEditSchedule} className="h-7 px-2.5 text-xs gap-1 bg-slate-900 text-white rounded-md">
                            <Check className="size-3.5" />
                            Save
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={startEditSchedule} className="h-7 px-2.5 text-xs gap-1">
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                      ))}
                    </div>

                    {isEditingSchedule ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Service <span className="text-destructive">*</span></span>
                            <div className="relative">
                              <select value={inquiriesView.stagedInquiryService} onChange={(e) => inquiriesView.selectService(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border appearance-none">
                                <option value="">Select service...</option>
                                {inquiriesView.services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Date <span className="text-destructive">*</span></span>
                            <DatePicker value={inquiriesView.stagedInquiryDate} onChange={(v) => inquiriesView.selectDate(v)} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Start Time <span className="text-destructive">*</span></span>
                              {inquiriesView.stagedInquiryTime.includes(':') && <span className="text-xs text-muted-foreground/60">Prefered time {formatTime(inquiriesView.stagedInquiryTime)}</span>}
                            </div>
                            <input type="time" value={inquiriesView.stagedInquiryTime} onChange={(e) => inquiriesView.setStagedInquiryTime(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">End Time <span className="text-destructive">*</span></span>
                            <div className="relative">
                              <input type="time" value={inquiriesView.stagedInquiryEndTime} onChange={(e) => inquiriesView.setStagedInquiryEndTime(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                              {inquiriesView.stagedInquiryEndTime && (
                                <button type="button" onClick={() => inquiriesView.setStagedInquiryEndTime('')} className="absolute right-10 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center text-muted-foreground hover:text-foreground z-10">
                                  <X className="size-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Assign Dentist <span className="text-destructive">*</span></span>
                            <div className="relative">
                              <select value={inquiriesView.stagedInquiryDoctor} onChange={(e) => { inquiriesView.selectDoctor(e.target.value); setAssignedDoctorName(e.target.options[e.target.selectedIndex].text); }} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border appearance-none">
                                <option value="">Not assigned</option>
                                {inquiriesView.availableDoctors.map((d) => <option key={d.doctorId} value={d.doctorId}>{d.doctorName}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Service <span className="text-destructive">*</span></span>
                            <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{getServiceName(inquiriesView.services, inquiriesView.stagedInquiryService)}</div>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Date <span className="text-destructive">*</span></span>
                            <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{inquiriesView.stagedInquiryDate ? new Date(inquiriesView.stagedInquiryDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Start Time <span className="text-destructive">*</span></span>
                              {inquiriesView.stagedInquiryTime.includes(':') && <span className="text-xs text-muted-foreground/60">Prefered time {formatTime(inquiriesView.stagedInquiryTime)}</span>}
                            </div>
                            <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{formatTime(inquiriesView.stagedInquiryTime)}</div>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">End Time <span className="text-destructive">*</span></span>
                            <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{formatTime(inquiriesView.stagedInquiryEndTime)}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Assign Dentist <span className="text-destructive">*</span></span>
                            <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{assignedDoctorName || inquiriesView.availableDoctors.find(d => d.doctorId === inquiriesView.stagedInquiryDoctor)?.doctorName || '-'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <hr className="border-card-border/40" />

            </div>

            {/* Section 3: Master Action Bar */}
            {inquiriesView.selectedInquiry?.status === 'NEW' && (
              <div className="border-t border-card-border/40 px-5 py-4 shrink-0">
                <div className="flex flex-col gap-3">
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">Press Save to apply changes before approving or rejecting</p>
                  )}
                  {!isEditing && !isReady && (
                    <p className="text-xs text-muted-foreground">Fill the required fields to enable approval</p>
                  )}
                  <div className="flex gap-3">
                    <Button
                      variant="default"
                      size="default"
                      disabled={isEditing || !isReady}
                      className="flex-1 py-3 text-sm font-semibold shadow-sm !from-slate-900 !to-slate-900 !text-white hover:!from-slate-800 hover:!to-slate-800 disabled:!from-slate-400 disabled:!to-slate-400"
                      onClick={() => { inquiriesView.setDecision('CONVERT'); setApprovalReason(''); }}
                    >
                      Approve/Convert
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      disabled={isEditing}
                      className="flex-1 border-red-200 text-red-700 hover:bg-red-50 h-auto py-3 text-sm"
                      onClick={() => { inquiriesView.setDecision('DROP'); setApprovalReason(''); }}
                    >
                      Reject/Drop
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
        {hasSelection && (
          <div className={`flex-1 xl:w-[320px] xl:flex-none flex-col h-full overflow-hidden ${colMobile('quickLogs')} xl:flex`}>
            <CoordinationHub inquiryId={inquiriesView.selectedInquiryId} hideActions={!inquiriesView.selectedInquiry || inquiriesView.selectedInquiry.status !== 'NEW'} onBack={() => setMobileView('detail')} />
          </div>
        )}
      </>
    ) : (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 max-lg:hidden p-6 text-center">
        <div className="size-14 rounded-full bg-muted/30 flex items-center justify-center mb-3">
          <ClipboardList className="size-7 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-foreground">No Request Selected</p>
        <p className="text-xs text-muted-foreground max-w-xs mt-1">Select an inquiry from the left list to view details and process the request.</p>
      </div>
    )}
      <InquiryToast toast={inquiriesView.toast} />
    </div>
  );
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const date = value ? new Date(value + 'T00:00:00') : new Date();
  const [month, setMonth] = React.useState(date.getMonth());
  const [day, setDay] = React.useState(date.getDate());
  const [year, setYear] = React.useState(date.getFullYear());

  const emit = (m: number, d: number, y: number) => {
    const str = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onChange(str);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <select value={month} onChange={(e) => { const m = parseInt(e.target.value); setMonth(m); emit(m, day, year); }} className="w-full appearance-none px-2.5 py-2.5 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border">
          {MONTHS.map((name, i) => <option key={name} value={i}>{name}</option>)}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      </div>
      <div className="relative w-16">
        <select value={Math.min(day, daysInMonth)} onChange={(e) => { const d = parseInt(e.target.value); setDay(d); emit(month, d, year); }} className="w-full appearance-none px-2 py-2.5 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      </div>
      <div className="relative w-20">
        <select value={year} onChange={(e) => { const y = parseInt(e.target.value); setYear(y); emit(month, day, y); }} className="w-full appearance-none px-2 py-2.5 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border">
          {Array.from({ length: 5 }, (_, i) => year - 1 + i).map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
