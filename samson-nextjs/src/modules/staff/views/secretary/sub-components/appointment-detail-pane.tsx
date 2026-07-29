'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AppointmentDirectoryTab } from '@/modules/staff/hooks/secretary/use-secretary-appointments';
import { SharedAppointmentDetail } from '@/modules/appointments/components/sub-components/shared-appointment-detail';
import { AppointmentCancelForm } from './appointment-cancel-form';
import { AppointmentRescheduleForm } from './appointment-reschedule-form';
import { AppointmentStatusHistory } from './appointment-status-history';
import { Send, Calendar, RotateCw, Pencil, X, Check, Mail, MessageSquare, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';
import { resendNotificationAction } from '@/modules/appointments/actions/status/resend-notification.action';
import { getEmailLogsByAppointmentAction } from '@/modules/emails/actions/logs/get-email-logs-by-appointment.action';
import { computeNotificationStatus } from '@/modules/notifications/utils/notification-status.util';
import type { OutboxLogResponseDto } from '@/modules/emails/dtos/logs/outbox-log-response.dto';

interface AppointmentDetailPaneProps {
  view: any;
  compact?: boolean;
}

export function AppointmentDetailPane({ view, compact }: AppointmentDetailPaneProps) {
  const appointment = view.selectedAppointment as AppointmentDto | undefined;
  if (!appointment) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
          <Calendar className="size-6 text-muted-foreground/60" />
        </div>
        <p className="text-xs font-medium text-foreground">No appointment selected</p>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px]">
          Select an appointment from the list to view details.
        </p>
      </div>
    );
  }
  return <AppointmentDetails appointment={appointment} view={view} activeTab={view.activeTab} compact={compact} />;
}

function AppointmentDetails({ appointment, view, activeTab, compact }: { appointment: AppointmentDto; view: any; activeTab: AppointmentDirectoryTab; compact?: boolean }) {
  const [resending, setResending] = useState<string | null>(null);
  const [detailResendingId, setDetailResendingId] = useState<string | null>(null);
  const [outboxLogs, setOutboxLogs] = useState<OutboxLogResponseDto[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingLogs(true);
    getEmailLogsByAppointmentAction(appointment.id).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) setOutboxLogs(res.data);
      setLoadingLogs(false);
    });

    // Status changes enqueue notification delivery in a post-request task.
    // Refresh once after that task has had time to create/process the outbox
    // row so this pane stays in sync with Communication Details.
    const refreshTimers = [750, 1750, 3000].map((delay) => window.setTimeout(() => {
      getEmailLogsByAppointmentAction(appointment.id).then((res) => {
        if (!cancelled && res.success && res.data) setOutboxLogs(res.data);
      });
    }, delay));

    return () => {
      cancelled = true;
      refreshTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [appointment.id, appointment.status, appointment.date, appointment.startTime]);
  const [allowOverrideResend, setAllowOverrideResend] = useState(false);
  const [channel, setChannel] = useState<'EMAIL' | 'SMS' | 'BOTH' | 'NONE'>(
    (appointment.confirmationChannel as any) || 'EMAIL'
  );
  const [draftChannel, setDraftChannel] = useState<'EMAIL' | 'SMS' | 'BOTH' | 'NONE'>(channel);
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [isSavingChannel, setIsSavingChannel] = useState(false);
  const ch = (appointment.confirmationChannel as any) || (appointment as any).confirmation_channel || 'EMAIL';
  const isEmailCh = ch === 'EMAIL' || ch === 'BOTH';
  const isSmsCh = ch === 'SMS' || ch === 'BOTH';

  const [commState, setCommState] = useState({
    emailConfirmationSent: Boolean((appointment as any).emailConfirmationSent || (appointment as any).email_confirmation_sent),
    smsConfirmationSent: Boolean((appointment as any).smsConfirmationSent || (appointment as any).sms_confirmation_sent),
    emailReminder48hSent: Boolean((appointment as any).emailReminder48hSent || (appointment as any).email_reminder_48h_sent),
    smsReminder48hSent: Boolean((appointment as any).smsReminder48hSent || (appointment as any).sms_reminder_48h_sent),
    emailReminder24hSent: Boolean((appointment as any).emailReminder24hSent || (appointment as any).email_reminder_24h_sent),
    smsReminder24hSent: Boolean((appointment as any).smsReminder24hSent || (appointment as any).sms_reminder_24h_sent),
    emailCheckoutSent: Boolean((appointment as any).emailCheckoutSent || (appointment as any).email_checkout_sent),
    smsCheckoutSent: Boolean((appointment as any).smsCheckoutSent || (appointment as any).sms_checkout_sent),
    emailCancelSent: Boolean((appointment as any).emailCancelSent || (appointment as any).email_cancel_sent),
    smsCancelSent: Boolean((appointment as any).smsCancelSent || (appointment as any).sms_cancel_sent),
    emailRescheduleSent: Boolean((appointment as any).emailRescheduleSent || (appointment as any).email_reschedule_sent),
    smsRescheduleSent: Boolean((appointment as any).smsRescheduleSent || (appointment as any).sms_reschedule_sent),
  });

  useEffect(() => {
    setChannel(ch);
    setDraftChannel(ch);
    setCommState({
      emailConfirmationSent: Boolean((appointment as any).emailConfirmationSent || (appointment as any).email_confirmation_sent),
      smsConfirmationSent: Boolean((appointment as any).smsConfirmationSent || (appointment as any).sms_confirmation_sent),
      emailReminder48hSent: Boolean((appointment as any).emailReminder48hSent || (appointment as any).email_reminder_48h_sent),
      smsReminder48hSent: Boolean((appointment as any).smsReminder48hSent || (appointment as any).sms_reminder_48h_sent),
      emailReminder24hSent: Boolean((appointment as any).emailReminder24hSent || (appointment as any).email_reminder_24h_sent),
      smsReminder24hSent: Boolean((appointment as any).smsReminder24hSent || (appointment as any).sms_reminder_24h_sent),
      emailCheckoutSent: Boolean((appointment as any).emailCheckoutSent || (appointment as any).email_checkout_sent),
      smsCheckoutSent: Boolean((appointment as any).smsCheckoutSent || (appointment as any).sms_checkout_sent),
      emailCancelSent: Boolean((appointment as any).emailCancelSent || (appointment as any).email_cancel_sent),
      smsCancelSent: Boolean((appointment as any).smsCancelSent || (appointment as any).sms_cancel_sent),
      emailRescheduleSent: Boolean((appointment as any).emailRescheduleSent || (appointment as any).email_reschedule_sent),
      smsRescheduleSent: Boolean((appointment as any).smsRescheduleSent || (appointment as any).sms_reschedule_sent),
    });
  }, [appointment]);

  const handleResend = async (eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H' | 'APPOINTMENT_CHECKOUT', targetChannel: 'EMAIL' | 'SMS') => {
    const key = `${eventType}_${targetChannel}`;
    setResending(key);
    const res = await resendNotificationAction({ appointmentId: appointment.id, eventType, targetChannel });
    if (res.success) {
      if (eventType === 'APPOINTMENT_REMINDER_48H') {
        if (targetChannel === 'EMAIL') {
          (appointment as any).emailReminder48hSent = true;
          (appointment as any).email_reminder_48h_sent = true;
        }
        if (targetChannel === 'SMS') {
          (appointment as any).smsReminder48hSent = true;
          (appointment as any).sms_reminder_48h_sent = true;
        }
      } else if (eventType === 'APPOINTMENT_REMINDER_24H') {
        if (targetChannel === 'EMAIL') {
          (appointment as any).emailReminder24hSent = true;
          (appointment as any).email_reminder_24h_sent = true;
        }
        if (targetChannel === 'SMS') {
          (appointment as any).smsReminder24hSent = true;
          (appointment as any).sms_reminder_24h_sent = true;
        }
      } else if (eventType === 'APPOINTMENT_BOOKED') {
        if (targetChannel === 'EMAIL') {
          (appointment as any).emailConfirmationSent = true;
          (appointment as any).email_confirmation_sent = true;
        }
        if (targetChannel === 'SMS') {
          (appointment as any).smsConfirmationSent = true;
          (appointment as any).sms_confirmation_sent = true;
        }
      } else if (eventType === 'APPOINTMENT_CHECKOUT') {
        if (targetChannel === 'EMAIL') {
          (appointment as any).emailCheckoutSent = true;
          (appointment as any).email_checkout_sent = true;
        }
        if (targetChannel === 'SMS') {
          (appointment as any).smsCheckoutSent = true;
          (appointment as any).sms_checkout_sent = true;
        }
      }

      setCommState((prev) => {
        const updates: Partial<typeof prev> = {};
        if (eventType === 'APPOINTMENT_REMINDER_48H') {
          if (targetChannel === 'EMAIL') updates.emailReminder48hSent = true;
          if (targetChannel === 'SMS') updates.smsReminder48hSent = true;
        } else if (eventType === 'APPOINTMENT_REMINDER_24H') {
          if (targetChannel === 'EMAIL') updates.emailReminder24hSent = true;
          if (targetChannel === 'SMS') updates.smsReminder24hSent = true;
        } else if (eventType === 'APPOINTMENT_BOOKED') {
          if (targetChannel === 'EMAIL') updates.emailConfirmationSent = true;
          if (targetChannel === 'SMS') updates.smsConfirmationSent = true;
        } else if (eventType === 'APPOINTMENT_CHECKOUT') {
          if (targetChannel === 'EMAIL') updates.emailCheckoutSent = true;
          if (targetChannel === 'SMS') updates.smsCheckoutSent = true;
        }
        return { ...prev, ...updates };
      });

      getEmailLogsByAppointmentAction(appointment.id).then((r) => {
        if (r.success && r.data) setOutboxLogs(r.data);
      });
      if (view?.fetchData) {
        view.fetchData();
      }
    } else {
      alert(res.error || 'Failed to resend notification.');
    }
    setResending(null);
  };

  const handleDetailResend = async (logId: string) => {
    setDetailResendingId(logId);
    const res = await import('@/modules/emails/actions/logs/resend-email.action').then(m => m.resendEmailAction({ id: logId }));
    if (!res?.error) {
      getEmailLogsByAppointmentAction(appointment.id).then((r) => {
        if (r.success && r.data) setOutboxLogs(r.data);
      });
    }
    setDetailResendingId(null);
  };

  // Keep one actionable row per notification event. The outbox can contain
  // several attempts for the same event, but staff only need the latest state
  // and one action for that event.
  const groupedOutboxLogs = Array.from(
    outboxLogs.reduce((groups, log) => {
      const existing = groups.get(log.eventType);
      if (!existing || new Date(log.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
        groups.set(log.eventType, log);
      }
      return groups;
    }, new Map<string, OutboxLogResponseDto>()).values()
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const EVENT_LABELS: Record<string, string> = {
    'APPOINTMENT_BOOKED': 'Booking Confirmation (Email)',
    'APPOINTMENT_CONVERTED_FROM_INQUIRY': 'Inquiry Approved (Email)', // Guest inquiry conversion email
    'APPOINTMENT_CONVERTED_FROM_INQUIRY_PATIENT': 'Inquiry Approved (Email)', // Patient inquiry conversion email
    'APPOINTMENT_CONVERTED_FROM_INQUIRY_SMS': 'Inquiry Approved (SMS)',
    'APPOINTMENT_MANUALLY_BOOKED_PATIENT': 'Manual Booking (Email)', // Patient manual booking email
    'APPOINTMENT_MANUALLY_BOOKED_GUEST': 'Manual Booking (Email)', // Guest manual booking email
    'APPOINTMENT_MANUALLY_BOOKED_SMS': 'Manual Booking (SMS)',
    'APPOINTMENT_REMINDER_24H': '24-Hour Reminder (Email)',
    'APPOINTMENT_REMINDER_48H': '48-Hour Reminder (Email)',
    'APPOINTMENT_REMINDER_24H_SMS': '24-Hour Reminder (SMS)',
    'APPOINTMENT_REMINDER_48H_SMS': '48-Hour Reminder (SMS)',
    'RESCHEDULE_BOOKING': 'Rescheduled (Email)',
    'CANCEL_BOOKING': 'Cancelled (Email)',
    'APPOINTMENT_COMPLETED_POST_CARE': 'Post-Care Review (Email)',
    'APPOINTMENT_COMPLETED_POST_CARE_SMS': 'Post-Care (SMS)',
    'STAFF_REPLIED_TO_CHAT': 'Staff Reply (Email)',
    'PATIENT_REGISTERED': 'Registration OTP (Email)',
    'PASSWORD_RESET_REQUESTED': 'Password Reset OTP (Email)',
  };

  const handleSaveChannel = async () => {
    setIsSavingChannel(true);
    const res = await updateConfirmationChannelAction({
      appointmentId: appointment.id,
      confirmationChannel: draftChannel,
    });
    if (res.success) {
      setChannel(draftChannel);
      appointment.confirmationChannel = draftChannel;
      setIsEditingChannel(false);
    }
    setIsSavingChannel(false);
  };

  const handleCancelChannel = () => {
    setDraftChannel(channel);
    setIsEditingChannel(false);
  };

  const commEntries: {
    key: string;
    label: string;
    eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H' | 'APPOINTMENT_CHECKOUT';
    emailSent: boolean;
    smsSent: boolean;
  }[] = [
    { key: 'confirmation', label: 'Booking Confirmation', eventType: 'APPOINTMENT_BOOKED', emailSent: commState.emailConfirmationSent, smsSent: commState.smsConfirmationSent },
    { key: 'reminder48h', label: '48-Hour Reminder', eventType: 'APPOINTMENT_REMINDER_48H', emailSent: commState.emailReminder48hSent, smsSent: commState.smsReminder48hSent },
    { key: 'reminder24h', label: '24-Hour Reminder', eventType: 'APPOINTMENT_REMINDER_24H', emailSent: commState.emailReminder24hSent, smsSent: commState.smsReminder24hSent },
    { key: 'checkout', label: 'Checkout / Thank You', eventType: 'APPOINTMENT_CHECKOUT', emailSent: commState.emailCheckoutSent, smsSent: commState.smsCheckoutSent },
  ];

  const canModify = ['APPROVED', 'PENDING', 'RESCHEDULE_REQUESTED', 'DISPLACED'].includes(appointment.status);
  const canRescheduleOnly = appointment.status === 'NO_SHOW';
  if (view.showRescheduleForm && (canModify || canRescheduleOnly)) {
    return (
      <div className="flex flex-col flex-1 min-h-0 h-full">
        <div className="flex-1 min-h-0 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
          <AppointmentRescheduleForm appointment={appointment} {...getRescheduleProps(view)} noFooter />
        </div>
        <div className="shrink-0 border-t border-border px-4 py-3">
          <div className="flex gap-2">
            <Button onClick={view.submitReschedule} disabled={view.isSubmitting} className="flex-1 h-[42px] text-sm font-medium bg-primary text-white hover:bg-primary/90 rounded-xl disabled:opacity-50">
              {view.isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
            <Button variant="outline" onClick={() => view.setShowRescheduleForm(false)} className="flex-1 h-[42px] text-sm font-medium">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SharedAppointmentDetail
      appointment={appointment}
      compact={compact}
      extraSections={
        <>
          <hr className={`border-card-border/40 ${compact ? 'mx-4' : 'mx-5'}`} />
          {/* Notification Channel */}
          <div className={`${compact ? 'py-3 px-4' : 'py-4 px-5'}`}>
            <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-3'}`}>
              <span className={`${compact ? 'text-sm' : 'text-base'} font-medium text-foreground`}>Notification Channel</span>
              {!isEditingChannel && !['COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'].includes(appointment.status) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingChannel(true)}
                  className="h-7 px-2.5 text-xs gap-1"
                >
                  <Pencil className="size-3.5" /> Edit
                </Button>
              )}
              {isEditingChannel && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelChannel} className="h-7 px-2.5 text-xs gap-1">
                    <X className="size-3.5" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveChannel} disabled={isSavingChannel || draftChannel === channel} className="h-7 px-2.5 text-xs gap-1 bg-slate-900 text-white rounded-md disabled:cursor-not-allowed">
                    <Check className="size-3.5" /> {isSavingChannel ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>

            {isEditingChannel ? (
              <Select
                value={draftChannel}
                onChange={(e) => setDraftChannel(e.target.value as any)}
                className="text-sm w-full"
                options={[
                  { value: 'EMAIL', label: 'Email' },
                  { value: 'SMS', label: 'SMS' },
                  { value: 'BOTH', label: 'Email & SMS' },
                  { value: 'NONE', label: 'None' },
                ]}
              />
            ) : (
              <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">
                {channel === 'EMAIL' ? 'Email' : channel === 'SMS' ? 'SMS' : channel === 'BOTH' ? 'Email & SMS' : 'None'}
              </div>
            )}
          </div>

          <hr className={`border-card-border/40 ${compact ? 'mx-4' : 'mx-5'}`} />
          {/* Notification History */}
          <div className={`${compact ? 'py-3 px-4 space-y-2' : 'py-4 px-5 space-y-3'}`}>
            <div className="flex items-center justify-between">
              <span className={`${compact ? 'text-sm' : 'text-base'} font-medium text-foreground block`}>Notification History</span>
              <Label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
                <span>Manual Resend</span>
                <Switch
                  checked={allowOverrideResend}
                  onCheckedChange={setAllowOverrideResend}
                  className="scale-75 shadow-none"
                />
              </Label>
            </div>
            <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-3'}`}>
              <>
                {commEntries.map((entry) => {
                const createdAt = (appointment as any).createdAt || (appointment as any).created_at;
                const startTime = (appointment as any).startTime || (appointment as any).start_time || (appointment as any).date;

                const smsStatus = computeNotificationStatus({
                  eventType: entry.eventType,
                  targetChannel: 'SMS',
                  isSent: entry.smsSent,
                  currentChannel: channel,
                  createdAt,
                  startTime,
                });

                const emailStatus = computeNotificationStatus({
                  eventType: entry.eventType,
                  targetChannel: 'EMAIL',
                  isSent: entry.emailSent,
                  currentChannel: channel,
                  createdAt,
                  startTime,
                });

                const isCheckoutApplicable = entry.eventType !== 'APPOINTMENT_CHECKOUT' || appointment.status === 'COMPLETED';
                const displaySmsStatus = isCheckoutApplicable ? smsStatus : { ...smsStatus, label: 'NOT APPLICABLE', badgeClass: 'bg-slate-500/10 text-slate-500 dark:text-slate-400' };
                const displayEmailStatus = isCheckoutApplicable ? emailStatus : { ...emailStatus, label: 'NOT APPLICABLE', badgeClass: 'bg-slate-500/10 text-slate-500 dark:text-slate-400' };
                const isSmsResendAllowed = isCheckoutApplicable && (allowOverrideResend || (entry.smsSent ? false : smsStatus.variant === 'pending'));
                const isEmailResendAllowed = isCheckoutApplicable && (allowOverrideResend || (entry.emailSent ? false : emailStatus.variant === 'pending'));

                return (
                  <div key={entry.key} className={compact ? 'space-y-1' : 'space-y-2'}>
                    <span className="text-xs text-muted-foreground">{entry.label}</span>
                    <div className={!compact ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}>
                      <div className={`flex items-center justify-between ${compact ? 'p-2' : 'p-3'} bg-secondary-bg/20 border border-card-border/60 rounded-xl`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <MessageSquare className={`${compact ? 'size-3' : 'size-3.5'} text-muted-foreground shrink-0`} />
                          <span className="text-sm text-foreground">SMS</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${smsStatus.badgeClass}`}>
                            {displaySmsStatus.label}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!isSmsResendAllowed || resending === `${entry.eventType}_SMS`}
                          onClick={() => handleResend(entry.eventType, 'SMS')}
                          className={`${compact ? 'text-[9px] h-6 px-2 gap-0.5' : 'text-[10px] h-7 px-2.5 gap-1'} shrink-0 disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          <RotateCw className={`size-3 ${resending === `${entry.eventType}_SMS` ? 'animate-spin' : ''}`} />
                          {resending === `${entry.eventType}_SMS` ? 'Sending...' : 'Resend'}
                        </Button>
                      </div>

                      <div className={`flex items-center justify-between ${compact ? 'p-2' : 'p-3'} bg-secondary-bg/20 border border-card-border/60 rounded-xl`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className={`${compact ? 'size-3' : 'size-3.5'} text-muted-foreground shrink-0`} />
                          <span className="text-sm text-foreground">Email</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${emailStatus.badgeClass}`}>
                            {displayEmailStatus.label}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!isEmailResendAllowed || resending === `${entry.eventType}_EMAIL`}
                          onClick={() => handleResend(entry.eventType, 'EMAIL')}
                          className={`${compact ? 'text-[9px] h-6 px-2 gap-0.5' : 'text-[10px] h-7 px-2.5 gap-1'} shrink-0 disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          <RotateCw className={`size-3 ${resending === `${entry.eventType}_EMAIL` ? 'animate-spin' : ''}`} />
                          {resending === `${entry.eventType}_EMAIL` ? 'Sending...' : 'Resend'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
                {(['CANCEL_BOOKING', 'RESCHEDULE_BOOKING'] as const).map((eventType) => {
                  const label = eventType === 'CANCEL_BOOKING' ? 'Cancellation' : 'Reschedule';
                  return (
                    <div key={eventType} className={compact ? 'space-y-1' : 'space-y-2'}>
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <div className={!compact ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}>
                        {(['EMAIL', 'SMS'] as const).map((channelType) => {
                          const logEventType = channelType === 'SMS' ? `${eventType}_SMS` : eventType;
                          const latestLog = groupedOutboxLogs.find((log) => log.eventType === logEventType);
                          const sentFlag = eventType === 'CANCEL_BOOKING'
                            ? channelType === 'SMS' ? commState.smsCancelSent : commState.emailCancelSent
                            : channelType === 'SMS' ? commState.smsRescheduleSent : commState.emailRescheduleSent;
                          const eventOccurred = eventType === 'CANCEL_BOOKING'
                            ? appointment.status === 'CANCELLED'
                            : Boolean((appointment as any).rescheduleCount || (appointment as any).reschedule_count);
                          const displayStatus = sentFlag ? 'SENT' : latestLog ? latestLog.status === 'FAILED' ? 'FAILED' : latestLog.status === 'PROCESSED' ? 'SENT' : 'PENDING' : eventOccurred ? 'NOT SENT' : 'NOT APPLICABLE';
                          const statusBadgeClass = displayStatus === 'SENT'
                            ? 'bg-green-500/10 text-green-500'
                            : displayStatus === 'FAILED'
                              ? 'bg-rose-500/10 text-rose-600'
                              : displayStatus === 'PENDING'
                                ? 'bg-muted text-muted-foreground/60'
                                : 'bg-slate-500/10 text-slate-500 dark:text-slate-400';
                          const Icon = channelType === 'SMS' ? MessageSquare : Mail;
                          return (
                            <div key={logEventType} className="flex items-center justify-between p-3 bg-secondary-bg/20 border border-card-border/60 rounded-xl">
                              <div className="flex items-center gap-2 min-w-0">
                                <Icon className="size-3.5 text-muted-foreground shrink-0" />
                                <span className="text-sm text-foreground">{channelType === 'SMS' ? 'SMS' : 'Email'}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusBadgeClass}`}>
                                  {displayStatus}
                                </span>
                              </div>
                              {latestLog && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={detailResendingId === latestLog.id}
                                  onClick={() => handleDetailResend(latestLog.id)}
                                  className="text-xs h-7 px-2.5 shrink-0 disabled:opacity-40"
                                >
                                  {detailResendingId === latestLog.id ? 'Sending...' : latestLog.status === 'PROCESSED' ? 'Send New' : 'Resend'}
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            </div>
          </div>
          <hr className={`border-card-border/40 ${compact ? 'mx-4' : 'mx-5'}`} />
          {/* Email/SMS Event Log */}
          <div className={`${compact ? 'py-3 px-4 space-y-2' : 'py-4 px-5 space-y-3'}`}>
            <span className={`${compact ? 'text-sm' : 'text-base'} font-medium text-foreground`}>Delivery Log</span>
            {loadingLogs ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-8 bg-muted/30 animate-pulse rounded-lg" />)}
              </div>
            ) : outboxLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No events yet.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {groupedOutboxLogs.map((log) => {
                  const logStatus = log.status;
                  const isFailed = logStatus === 'FAILED';
                  const isProcessed = logStatus === 'PROCESSED';
                  return (
                    <div key={log.eventType} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-secondary-bg/20 border border-card-border/40 text-sm">
                      <div className="shrink-0">
                        {isFailed ? <AlertCircle className="size-3.5 text-rose-500" /> : isProcessed ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Clock className="size-3.5 text-amber-500" />}
                      </div>
                      <span className="text-foreground font-medium truncate min-w-0 flex-1">
                        {EVENT_LABELS[log.eventType] || log.eventType}
                      </span>
                      <Badge variant={isFailed ? 'error' : isProcessed ? 'success' : 'warning'} className="text-[10px] px-1.5 py-0.5 shrink-0">
                        {logStatus}
                      </Badge>
                      <span className="text-xs text-muted-foreground shrink-0">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={() => handleDetailResend(log.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 shrink-0 disabled:opacity-50"
                        disabled={detailResendingId === log.id}
                      >
                        {detailResendingId === log.id ? 'Sending...' : isProcessed ? 'Send New' : 'Resend'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <hr className={`border-card-border/40 ${compact ? 'mx-4' : 'mx-5'}`} />
          <div className={`${compact ? 'px-4 pb-4 pt-1' : 'px-5 pb-6 pt-2'}`}>
            <AppointmentStatusHistory appointment={appointment} activeTab={activeTab} compact={compact} />
          </div>
        </>
      }
      actionsBar={(() => {
        const canCancelOnly = appointment.status === 'CHECKED_IN';
        if (!canModify && !canRescheduleOnly && !canCancelOnly) return undefined;

        if (!view.showRescheduleForm && !view.showCancelForm) {
          return (
            <div className="flex gap-2">
              {(canModify || canRescheduleOnly) && (
                <Button variant="outline" className={`${canModify ? 'flex-1' : 'w-full'} h-[42px]`} onClick={() => view.setShowRescheduleForm(true)}>
                  Reschedule
                </Button>
              )}
              {(canModify || canCancelOnly) && (
                <Button variant="outline" className={`${canModify ? 'flex-1' : 'w-full'} h-[42px] border-destructive/50 text-destructive hover:bg-destructive/10`} onClick={() => view.setShowCancelForm(true)}>
                  Cancel
                </Button>
              )}
            </div>
          );
        }

        return (
          <div className="space-y-3">
            {view.showRescheduleForm && (canModify || canRescheduleOnly) && (
              <>
                <AppointmentRescheduleForm appointment={appointment} {...getRescheduleProps(view)} noFooter />
                <div className="flex gap-2">
                  <Button onClick={view.handleRescheduleSubmit} disabled={view.isPending} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40">
                    {view.isPending ? 'Saving...' : 'Confirm'}
                  </Button>
                  <Button variant="outline" onClick={() => view.setShowRescheduleForm(false)} className="flex-1 h-[42px] text-sm font-medium rounded-xl">
                    Cancel
                  </Button>
                </div>
              </>
            )}
            {view.showCancelForm && (canModify || canCancelOnly) && (
              <AppointmentCancelForm
                reasonPreset={view.cancelReasonPreset}
                appointmentId={appointment.id}
                setReasonPreset={view.setCancelReasonPreset}
                reasonCustom={view.cancelReasonCustom}
                setReasonCustom={view.setCancelReasonCustom}
                confirmationChannel={view.confirmationChannel}
                onConfirmationChannelChange={view.setConfirmationChannel}
                isSubmitting={view.isSubmitting}
                onSubmit={view.submitCancel}
                onBack={() => view.setShowCancelForm(false)}
              />
            )}
          </div>
        );
      })()}
    />
  );
}

function getRescheduleProps(view: any) {
  return {
    changeTreatment: view.changeTreatment,
    services: view.services,
    serviceId: view.rescheduleServiceId,
    isLoadingServices: view.isLoadingServices,
    changeDoctor: view.changeDoctor,
    doctorId: view.rescheduleDoctorId,
    doctors: view.availableRescheduleDoctors,
    isLoadingDoctors: view.isLoadingRescheduleDoctors,
    month: view.rescheduleMonth,
    availableDates: view.availableDates,
    isLoadingDays: view.isLoadingDays,
    date: view.rescheduleDate,
    activeServiceId: view.activeServiceId,
    activeDoctorId: view.activeDoctorId,
    slots: view.timeslots,
    isLoadingSlots: view.isLoadingSlots,
    startTime: view.rescheduleStartTime,
    endTime: view.rescheduleEndTime,
    confirmationChannel: view.confirmationChannel,
    onConfirmationChannelChange: view.setConfirmationChannel,
    justification: view.rescheduleJustification,
    isSubmitting: view.isSubmitting,
    onToggleTreatment: view.toggleChangeTreatment,
    onServiceSelect: view.selectRescheduleService,
    onToggleDoctor: view.toggleChangeDoctor,
    onDoctorSelect: view.setRescheduleDoctorId,
    onMonthChange: view.setRescheduleMonth,
    onDateSelect: view.selectRescheduleDate,
    onStartTimeChange: view.setRescheduleStartTime,
    onEndTimeChange: view.setRescheduleEndTime,
    onJustificationChange: view.setRescheduleJustification,
    onSubmit: view.submitReschedule,
    onBack: () => view.setShowRescheduleForm(false),
  };
}
