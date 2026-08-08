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
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Mail,
  MoreHorizontal,
  Pencil,
  RotateCw,
  UserRound,
  X,
} from 'lucide-react';
import { useToast } from '@/components/feedback/toast-container';
import { resendInquiryNotificationAction } from '@/modules/appointments/actions/booking/resend-inquiry-notification.action';
import { getEmailLogsByInquiryAction } from '@/modules/emails/actions/logs/get-email-logs-by-inquiry.action';
import type { OutboxLogResponseDto } from '@/modules/emails/dtos/logs/outbox-log-response.dto';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const EVENT_NAME_MAP: Record<string, string> = {
  'APPOINTMENT_INQUIRY_RECEIVED': 'Inquiry Request Received',
  'REJECT_INQUIRY': 'Request Rejection',
};

const badgeClassFor = (status: string) =>
  status === 'SENT'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
    : status === 'FAILED'
    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
    : status === 'PENDING'
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';

function formatTimeFull(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

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

const CONVERT_REASONS = [
  'Slot confirmed by clinic',
  'Patient accepted by phone/chat',
  'Emergency case accommodated',
  'Others',
];

const DROP_REASONS = [
  'Patient no longer interested',
  'Duplicate inquiry',
  'Patient unreachable / no reply',
  'Patient requested removal',
  'Others',
];

export function SecretaryPendingRequestsViewV2() {
  const inquiriesView = useSecretaryInquiriesQueue();
  const [detailTab, setDetailTab] = React.useState<'overview' | 'notifications' | 'timeline'>('overview');
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
  const [logPage, setLogPage] = React.useState(1);

  const TABS = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'notifications' as const, label: 'Notifications' },
    { key: 'timeline' as const, label: 'Timeline' },
  ];

  const activeIndex = TABS.findIndex((t) => t.key === detailTab);
  const [tabOffsets, setTabOffsets] = React.useState<{ left: number; width: number }>({ left: 0, width: 0 });

  const tabRef0 = React.useRef<HTMLButtonElement | null>(null);
  const tabRef1 = React.useRef<HTMLButtonElement | null>(null);
  const tabRef2 = React.useRef<HTMLButtonElement | null>(null);

  const tabRefs = React.useMemo(() => [tabRef0, tabRef1, tabRef2], []);

  React.useEffect(() => {
    const currentBtn = tabRefs[activeIndex]?.current;
    if (currentBtn) {
      setTabOffsets({
        left: currentBtn.offsetLeft,
        width: currentBtn.offsetWidth,
      });
    }
  }, [detailTab, activeIndex, tabRefs]);

  const fetchInquiryLogs = React.useCallback(async (inquiryId: string, showLoading = true) => {
    if (showLoading) setLoadingInquiryLogs(true);
    const res = await getEmailLogsByInquiryAction(inquiryId);
    if (res.success && res.data) {
      setInquiryLogs(res.data);
    }
    if (showLoading) setLoadingInquiryLogs(false);
  }, []);

  React.useEffect(() => {
    setLogPage(1);
    if (inquiriesView.selectedInquiryId) {
      fetchInquiryLogs(inquiriesView.selectedInquiryId, true);
    } else {
      setInquiryLogs([]);
    }
  }, [inquiriesView.selectedInquiryId, fetchInquiryLogs]);

  const timelineEntries = React.useMemo(() => {
    return inquiryLogs.map((log) => {
      const fallbackEmail = inquiriesView.guestEmail || '';
      const rawRecipient = (log as any).recipient || log.payload?.to || log.payload?.recipient || log.payload?.email || log.payload?.guestEmail || '';
      const finalRecipient = rawRecipient && rawRecipient !== 'system' ? rawRecipient : (fallbackEmail || 'System Automated Dispatch');

      return {
        id: log.id,
        channel: 'EMAIL' as const,
        eventType: log.eventType,
        status: log.status === 'PROCESSED' ? 'SENT' : log.status === 'FAILED' ? 'FAILED' : 'PENDING',
        rawStatus: log.status,
        recipient: finalRecipient,
        timestamp: log.createdAt,
        retryCount: log.retryCount || 0,
        errorLogs: log.errorLogs || null,
        payload: log.payload,
      };
    });
  }, [inquiryLogs, inquiriesView.guestEmail]);

  const LOGS_PER_PAGE = 7;
  const totalLogPages = Math.ceil(timelineEntries.length / LOGS_PER_PAGE) || 1;
  const startIndex = (logPage - 1) * LOGS_PER_PAGE;
  const paginatedEntries = timelineEntries.slice(startIndex, startIndex + LOGS_PER_PAGE);

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
      fetchInquiryLogs(inquiriesView.selectedInquiry.id, false);
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
      fetchInquiryLogs(inquiriesView.selectedInquiry.id, false);
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
                  onClick={() => { inquiriesView.setDecision(''); inquiriesView.setApprovalReason(''); }}
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
                      value={inquiriesView.approvalReason}
                      onChange={(e) => {
                        inquiriesView.setApprovalReason(e.target.value);
                        if (inquiriesView.stagedInquiryAction === 'DROP') {
                          inquiriesView.setStagedInquiryNote(e.target.value === 'Others' ? '' : e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border appearance-none"
                      required
                    >
                      <option value="">
                        {inquiriesView.stagedInquiryAction === 'CONVERT' ? 'Select approval note...' : 'Select drop reason...'}
                      </option>
                      {(inquiriesView.stagedInquiryAction === 'CONVERT' ? CONVERT_REASONS : DROP_REASONS).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {inquiriesView.approvalReason === 'Others' && (
                    <textarea
                      value={inquiriesView.stagedInquiryAction === 'DROP' ? inquiriesView.stagedInquiryNote : inquiriesView.approvalReason}
                      onChange={(e) => {
                        inquiriesView.setApprovalReason(e.target.value);
                        if (inquiriesView.stagedInquiryAction === 'DROP') inquiriesView.setStagedInquiryNote(e.target.value);
                      }}
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
                onClick={() => { inquiriesView.setDecision(''); inquiriesView.setApprovalReason(''); }}
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

            {/* Sub-Header Tabs matching AppointmentDetailPane */}
            <div className="shrink-0 border-b border-card-border/40 px-5 bg-card">
              <div className="relative flex gap-6">
                {TABS.map((tab, idx) => {
                  const isActive = detailTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      ref={tabRefs[idx]}
                      onClick={() => setDetailTab(tab.key)}
                      className={`py-2.5 text-xs xl:text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
                {/* Sliding underline indicator */}
                <div
                  className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
                  style={{
                    left: `${tabOffsets.left}px`,
                    width: `${tabOffsets.width}px`,
                  }}
                />
              </div>
            </div>

            {/* Tab 1: OVERVIEW */}
            {detailTab === 'overview' && (
              <>
                <div className="flex-1 !overflow-y-auto max-md:px-5 px-5 space-y-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent animate-in fade-in duration-200"
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
                </div>

                {/* Section 3: Master Action Bar */}
                {inquiriesView.selectedInquiry?.status === 'NEW' && (
                  <div className="border-t border-card-border/40 px-5 py-4 shrink-0 bg-card">
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
                          onClick={() => { inquiriesView.setDecision('CONVERT'); inquiriesView.setApprovalReason(''); }}
                        >
                          Approve/Convert
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          disabled={isEditing}
                          className="flex-1 border-red-200 text-red-700 hover:bg-red-50 h-auto py-3 text-sm"
                          onClick={() => { inquiriesView.setDecision('DROP'); inquiriesView.setApprovalReason(''); }}
                        >
                          Reject/Drop
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Tab 2: NOTIFICATIONS */}
            {detailTab === 'notifications' && (
              <div className="flex-1 !overflow-y-auto p-4 space-y-6 text-sm [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent animate-in fade-in duration-200"
                style={{ scrollbarWidth: 'thin' }}
                data-lenis-prevent
              >
                {/* Section 1: Notification Lifecycle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground block">Notification Lifecycle</span>
                    <Label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
                      <span>Manual Resend</span>
                      <Switch
                        checked={allowOverrideResend}
                        onCheckedChange={setAllowOverrideResend}
                        className="scale-75 shadow-none"
                      />
                    </Label>
                  </div>

                  <div className="relative pl-4 space-y-4 pt-1 before:absolute before:left-1.5 before:top-3.5 before:bottom-3.5 before:w-0.5 before:bg-card-border/60">
                    {[
                      { eventType: 'APPOINTMENT_INQUIRY_RECEIVED', label: 'Inquiry Request Received' },
                      { eventType: 'REJECT_INQUIRY', label: 'Request Rejection' },
                    ].map((type) => {
                      const inquiryLog = inquiryLogs.find((l) => l.eventType === type.eventType);
                      const statusLabel = loadingInquiryLogs
                        ? 'LOADING...'
                        : inquiryLog
                          ? (inquiryLog.status === 'PROCESSED' ? 'SENT' : inquiryLog.status === 'FAILED' ? 'FAILED' : 'PENDING')
                          : type.eventType === 'APPOINTMENT_INQUIRY_RECEIVED'
                            ? (inquiriesView.selectedInquiry?.status === 'NEW' ? 'NOT SENT' : 'NOT APPLICABLE')
                            : (inquiriesView.selectedInquiry?.status === 'DROPPED' ? 'NOT SENT' : 'NOT APPLICABLE');

                      const badgeClass = loadingInquiryLogs
                        ? 'bg-muted text-muted-foreground/60 animate-pulse'
                        : badgeClassFor(statusLabel);

                      const isSent = statusLabel === 'SENT';
                      const isFailed = statusLabel === 'FAILED';
                      const isSkipped = statusLabel === 'NOT APPLICABLE';

                      const isSendingThis = resendingEventType === type.eventType;
                      const isAllowed = !loadingInquiryLogs && !resendingEventType && (
                        (Boolean(inquiryLog) && (statusLabel === 'PENDING' || statusLabel === 'FAILED')) ||
                        (type.eventType === 'APPOINTMENT_INQUIRY_RECEIVED' && statusLabel === 'NOT SENT' && inquiriesView.selectedInquiry?.status === 'NEW') ||
                        (type.eventType === 'REJECT_INQUIRY' && statusLabel === 'NOT SENT' && inquiriesView.selectedInquiry?.status === 'DROPPED') ||
                        allowOverrideResend
                      );

                      const triggerAction = type.eventType === 'APPOINTMENT_INQUIRY_RECEIVED'
                        ? handleResendInquiryEmail
                        : handleResendRejectionEmail;

                      return (
                        <div key={type.eventType} className={`relative flex items-start justify-between gap-2 ${isSkipped ? 'opacity-60' : ''}`}>
                          {/* Circle Marker */}
                          <div
                            className={`absolute -left-4 top-1 size-3 rounded-full border-2 bg-background ${
                              isSent
                                ? 'border-emerald-500 bg-emerald-500'
                                : isFailed
                                ? 'border-rose-500 bg-rose-500'
                                : isSkipped
                                ? 'border-muted-foreground/20 bg-muted/40'
                                : 'border-muted-foreground/40'
                            }`}
                          />

                          <div className="space-y-1 min-w-0">
                            <span className={`text-xs font-medium block ${isSkipped ? 'text-muted-foreground' : 'text-foreground'}`}>
                              {type.label}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
                                Email: {statusLabel}
                              </span>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!isAllowed}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground shrink-0 disabled:opacity-40"
                                title="Send notification"
                              >
                                {isSendingThis ? (
                                  <RotateCw className="size-3 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="size-3.5" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-72">
                              <DropdownMenuItem
                                onClick={triggerAction}
                                className="text-xs flex items-center justify-between cursor-pointer"
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <Mail className="size-3 text-muted-foreground shrink-0" />
                                  {statusLabel === 'FAILED' ? 'Retry via Email' : statusLabel === 'SENT' ? 'Resend via Email' : 'Send via Email'}
                                </span>
                                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ml-2 ${badgeClass}`}>
                                  {statusLabel}
                                </span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <hr className="border-card-border/40" />

                {/* Section 2: Delivery Logs Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground block">Delivery Logs</span>
                    {timelineEntries.length > 0 && (
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {startIndex + 1}–{Math.min(startIndex + LOGS_PER_PAGE, timelineEntries.length)} of {timelineEntries.length}
                      </span>
                    )}
                  </div>

                  {loadingInquiryLogs ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl bg-muted/30 border border-card-border p-3 flex gap-3 animate-pulse">
                          <div className="size-10 rounded-lg bg-muted/30 shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3.5 w-40 rounded bg-muted/40" />
                            <div className="h-3 w-60 rounded bg-muted/30" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : timelineEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-card-border/60 rounded-xl">
                      <div className="size-10 rounded-full bg-muted/20 flex items-center justify-center mb-2">
                        <Mail className="size-5 text-muted-foreground/50" />
                      </div>
                      <p className="text-xs font-medium text-foreground">No delivery logs found</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">
                        This appointment request has no recorded notification logs yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div
                        className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
                        style={{ scrollbarWidth: 'thin' }}
                        data-lenis-prevent
                      >
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left text-xs font-semibold text-muted-foreground border-y border-card-border/40">
                              <th className="py-2.5 pr-3 font-semibold">Type</th>
                              <th className="py-2.5 pr-3 font-semibold">To</th>
                              <th className="py-2.5 pr-3 font-semibold">Status</th>
                              <th className="py-2.5 pl-2 text-right font-semibold">Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedEntries.map((entry) => {
                              const statusPill = badgeClassFor(entry.status);
                              const subjectOrType = EVENT_NAME_MAP[entry.eventType] || entry.eventType;

                              return (
                                <tr key={entry.id} className="border-b border-card-border/40 last:border-b-0 hover:bg-muted/20 transition-colors">
                                  <td className="py-2.5 pr-3 text-xs font-medium text-foreground max-w-[130px] truncate" title={subjectOrType}>
                                    <span className="truncate block">{subjectOrType}</span>
                                  </td>
                                  <td className="py-2.5 pr-3 text-xs text-muted-foreground max-w-[120px] truncate" title={entry.recipient}>
                                    <span className="truncate block">{entry.recipient}</span>
                                  </td>
                                  <td className="py-2.5 pr-3 whitespace-nowrap">
                                    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusPill}`}>
                                      {entry.status}
                                    </span>
                                  </td>
                                  <td className="py-2.5 pl-2 text-right text-xs text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                                    {formatTimeFull(entry.timestamp)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {totalLogPages > 1 && (
                        <div className="flex items-center justify-between pt-2 border-t border-card-border/40">
                          <span className="text-[11px] text-muted-foreground">
                            Page {logPage} of {totalLogPages}
                          </span>
                          <div className="flex items-center gap-1.5 ml-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                              disabled={logPage <= 1}
                              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                              title="Newer logs"
                            >
                              <ChevronLeft className="size-3.5" /> Newer
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLogPage((p) => Math.min(totalLogPages, p + 1))}
                              disabled={logPage >= totalLogPages}
                              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                              title="Older logs"
                            >
                              Older <ChevronRight className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: TIMELINE */}
            {detailTab === 'timeline' && (
              <div className="flex-1 !overflow-y-auto min-h-0 py-2 animate-in fade-in duration-200 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
                style={{ scrollbarWidth: 'thin' }}
                data-lenis-prevent
              >
                <InquiryTimeline inquiry={inquiriesView.selectedInquiry} />
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

function InquiryTimeline({ inquiry }: { inquiry: any }) {
  if (!inquiry) return null;

  const entries: {
    id: string;
    status: string;
    label: string;
    time: string;
    reason: string | null;
    actor: string;
  }[] = [];

  // Entry 1: Requested / Created
  const guestName = formatPatientName(inquiry.guestFirstName, inquiry.guestMiddleName, inquiry.guestLastName, inquiry.guestSuffix);
  entries.push({
    id: 'requested',
    status: 'PENDING',
    label: 'Request Submitted',
    time: inquiry.createdAt || inquiry.preferredDate || new Date().toISOString(),
    reason: inquiry.notes || inquiry.stagedInquiryNote || null,
    actor: guestName !== '' ? `${guestName} (Guest)` : 'Patient',
  });

  // Entry 2: Status transition if converted or dropped
  if (inquiry.status === 'CONVERTED') {
    entries.push({
      id: 'converted',
      status: 'APPROVED',
      label: 'Approved & Converted',
      time: inquiry.updatedAt || new Date().toISOString(),
      reason: inquiry.secretaryNotes || 'Inquiry converted to confirmed appointment',
      actor: 'Secretary',
    });
  } else if (inquiry.status === 'DROPPED') {
    entries.push({
      id: 'dropped',
      status: 'REJECTED',
      label: 'Rejected / Dropped',
      time: inquiry.updatedAt || new Date().toISOString(),
      reason: inquiry.secretaryNotes || inquiry.dropReason || 'Inquiry archived/dropped by staff',
      actor: 'Secretary',
    });
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return { dot: '#f59e0b', bg: '#fef3c7' };
      case 'APPROVED': return { dot: '#22c55e', bg: '#dcfce7' };
      case 'REJECTED': return { dot: '#ef4444', bg: '#fee2e2' };
      default: return { dot: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const formatTimelineTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return iso;
    }
  };

  return (
    <div className="py-3 px-4 space-y-2">
      <span className="text-sm font-medium text-foreground block">Request Timeline</span>
      <div className="relative">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border/60" />
        <div className="flex flex-col">
          {entries.map((entry) => {
            const style = getStatusStyle(entry.status);
            return (
              <div key={entry.id} className="relative pl-8 pb-5 last:pb-0">
                <div
                  className="absolute left-[5px] top-[5px] size-3 rounded-full border-2 z-10"
                  style={{ borderColor: style.dot, backgroundColor: style.bg }}
                />
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xs font-semibold" style={{ color: style.dot }}>{entry.label}</span>
                    <span className="text-xs text-muted-foreground">{formatTimelineTime(entry.time)}</span>
                  </div>
                  {entry.reason && (
                    <p className="text-xs text-muted-foreground leading-relaxed italic">&ldquo;{entry.reason}&rdquo;</p>
                  )}
                  <span className="text-[10px] text-muted-foreground/80">- {entry.actor}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
