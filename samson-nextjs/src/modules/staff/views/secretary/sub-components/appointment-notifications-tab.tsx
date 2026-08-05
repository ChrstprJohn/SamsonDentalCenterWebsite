'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import { RotateCw, Pencil, X, Check, Mail, MessageSquare, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';
import { resendNotificationAction } from '@/modules/appointments/actions/status/resend-notification.action';
import { getEmailLogsByAppointmentAction } from '@/modules/emails/actions/logs/get-email-logs-by-appointment.action';
import { computeNotificationStatus } from '@/modules/notifications/utils/notification-status.util';
import type { OutboxLogResponseDto } from '@/modules/emails/dtos/logs/outbox-log-response.dto';
import { useToast } from '@/components/feedback/toast-container';

interface AppointmentNotificationsTabProps {
  appointment: AppointmentDto;
  view: any;
  compact?: boolean;
}

export function AppointmentNotificationsTab({ appointment, view, compact }: AppointmentNotificationsTabProps) {
  const { addToast } = useToast();
  const [resending, setResending] = useState<string | null>(null);
  const [detailResendingId, setDetailResendingId] = useState<string | null>(null);
  const [outboxLogs, setOutboxLogs] = useState<OutboxLogResponseDto[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [allowOverrideResend, setAllowOverrideResend] = useState(false);

  const [channel, setChannel] = useState<'EMAIL' | 'SMS' | 'BOTH' | 'NONE'>(
    (appointment.confirmationChannel as any) || 'EMAIL'
  );
  const [draftChannel, setDraftChannel] = useState<'EMAIL' | 'SMS' | 'BOTH' | 'NONE'>(channel);
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [isSavingChannel, setIsSavingChannel] = useState(false);

  const ch = (appointment.confirmationChannel as any) || (appointment as any).confirmation_channel || 'EMAIL';

  const [commState, setCommState] = useState({
    emailInquirySent: Boolean((appointment as any).inquiryId || (appointment as any).inquiry_id || (appointment as any).appointmentInquiryId || (appointment as any).appointment_inquiry_id),
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
    let cancelled = false;
    setOutboxLogs([]);
    setLoadingLogs(true);
    getEmailLogsByAppointmentAction(appointment.id).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) setOutboxLogs(res.data);
      setLoadingLogs(false);
    });

    return () => {
      cancelled = true;
    };
  }, [appointment.id]);

  useEffect(() => {
    setChannel(ch);
    setDraftChannel(ch);
    setCommState({
      emailInquirySent: Boolean((appointment as any).inquiryId || (appointment as any).inquiry_id || (appointment as any).appointmentInquiryId || (appointment as any).appointment_inquiry_id),
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

  const handleResend = async (
    eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H' | 'APPOINTMENT_CHECKOUT' | 'APPOINTMENT_INQUIRY_RECEIVED' | 'CANCEL_BOOKING' | 'RESCHEDULE_BOOKING',
    targetChannel: 'EMAIL' | 'SMS'
  ) => {
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
      } else if (eventType === 'CANCEL_BOOKING') {
        if (targetChannel === 'EMAIL') (appointment as any).email_cancel_sent = true;
        if (targetChannel === 'SMS') (appointment as any).sms_cancel_sent = true;
      } else if (eventType === 'RESCHEDULE_BOOKING') {
        if (targetChannel === 'EMAIL') (appointment as any).email_reschedule_sent = true;
        if (targetChannel === 'SMS') (appointment as any).sms_reschedule_sent = true;
      }

      setCommState((prev) => {
        const updates: Partial<typeof prev> = {};
        if (eventType === 'APPOINTMENT_INQUIRY_RECEIVED') updates.emailInquirySent = true;
        else if (eventType === 'APPOINTMENT_REMINDER_48H') {
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
        } else if (eventType === 'CANCEL_BOOKING') {
          if (targetChannel === 'EMAIL') updates.emailCancelSent = true;
          if (targetChannel === 'SMS') updates.smsCancelSent = true;
        } else if (eventType === 'RESCHEDULE_BOOKING') {
          if (targetChannel === 'EMAIL') updates.emailRescheduleSent = true;
          if (targetChannel === 'SMS') updates.smsRescheduleSent = true;
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
      addToast(res.error || 'Failed to resend notification.', 'error');
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
    'APPOINTMENT_INQUIRY_RECEIVED': 'Inquiry Received (Email)',
    'APPOINTMENT_BOOKED': 'Booking Confirmation (Email)',
    'APPOINTMENT_CONVERTED_FROM_INQUIRY': 'Inquiry Approved (Email)',
    'APPOINTMENT_CONVERTED_FROM_INQUIRY_PATIENT': 'Inquiry Approved (Email)',
    'APPOINTMENT_CONVERTED_FROM_INQUIRY_SMS': 'Inquiry Approved (SMS)',
    'APPOINTMENT_MANUALLY_BOOKED_PATIENT': 'Manual Booking (Email)',
    'APPOINTMENT_MANUALLY_BOOKED_GUEST': 'Manual Booking (Email)',
    'APPOINTMENT_MANUALLY_BOOKED_SMS': 'Manual Booking (SMS)',
    'APPOINTMENT_REMINDER_24H': '24-Hour Reminder (Email)',
    'APPOINTMENT_REMINDER_48H': '48-Hour Reminder (Email)',
    'APPOINTMENT_REMINDER_24H_SMS': '24-Hour Reminder (SMS)',
    'APPOINTMENT_REMINDER_48H_SMS': '48-Hour Reminder (SMS)',
    'RESCHEDULE_BOOKING': 'Rescheduled (Email)',
    'CANCEL_BOOKING': 'Cancelled (Email)',
    'APPOINTMENT_COMPLETED_POST_CARE': 'Post-Care Review (Email)',
    'APPOINTMENT_COMPLETED_POST_CARE_SMS': 'Post-Care (SMS)',
    'REJECT_INQUIRY': 'Request Rejected (Email)',
    'APPOINTMENT_REJECTED': 'Request Rejected (Email)',
    'STAFF_REPLIED_TO_CHAT': 'Staff Reply (Email)',
    'PATIENT_REGISTERED': 'Registration OTP (Email)',
    'PASSWORD_RESET_REQUESTED': 'Password Reset OTP (Email)',
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

  return (
    <div className="space-y-4">
      {/* Section 1: Notification Channel */}
      <div className="py-3 px-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Notification Channel</span>
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

      <hr className="border-card-border/40 mx-4" />

      {/* Section 2: Notification History */}
      <div className="py-3 px-4 space-y-2">
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
        <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-3'}`}>
          <>
            {(() => {
              const inquiryLog = groupedOutboxLogs.find(
                (log) => log.eventType === 'APPOINTMENT_INQUIRY_RECEIVED' || log.eventType === 'APPOINTMENT_CONVERTED_FROM_INQUIRY'
              );
              const isConvertedInquiry = Boolean(
                (appointment as any).inquiryId ||
                (appointment as any).inquiry_id ||
                (appointment as any).appointmentInquiryId ||
                (appointment as any).appointment_inquiry_id ||
                commState.emailInquirySent ||
                inquiryLog
              );

              const displayStatus = loadingLogs
                ? 'LOADING...'
                : isConvertedInquiry
                  ? (!inquiryLog || inquiryLog.status === 'PROCESSED'
                    ? 'SENT'
                    : inquiryLog.status === 'FAILED'
                      ? 'FAILED'
                      : 'PENDING')
                  : 'NOT APPLICABLE';

              const badgeClass = loadingLogs
                ? 'bg-muted text-muted-foreground/60 animate-pulse'
                : displayStatus === 'SENT'
                  ? 'bg-green-500/10 text-green-500'
                  : displayStatus === 'FAILED'
                    ? 'bg-rose-500/10 text-rose-600'
                    : displayStatus === 'PENDING'
                      ? 'bg-muted text-muted-foreground/60'
                      : 'bg-slate-500/10 text-slate-500 dark:text-slate-400';

              const isSending = (Boolean(inquiryLog) && detailResendingId === inquiryLog?.id) || resending === 'APPOINTMENT_INQUIRY_RECEIVED_EMAIL';
              const btnLabel = loadingLogs
                ? 'Loading...'
                : isSending
                  ? 'Sending...'
                  : displayStatus === 'SENT'
                    ? 'Send New'
                    : displayStatus === 'FAILED'
                      ? 'Retry'
                      : displayStatus === 'PENDING'
                        ? 'Send Now'
                        : 'Force Send';

              const isAllowed = !loadingLogs && !isSending && (
                (Boolean(inquiryLog) && (displayStatus === 'PENDING' || displayStatus === 'FAILED')) ||
                allowOverrideResend
              );

              return (
                <div key="inquiry" className={compact ? 'space-y-1' : 'space-y-2'}>
                  <span className="text-xs text-muted-foreground">Inquiry Request Received</span>
                  <div className="flex flex-col gap-2">
                    <div className={`flex items-center justify-between ${compact ? 'p-2' : 'p-3'} bg-secondary-bg/20 border border-card-border/60 rounded-xl`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className={`${compact ? 'size-3' : 'size-3.5'} text-muted-foreground shrink-0`} />
                        <span className="text-sm text-foreground">Email</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeClass}`}>
                          {displayStatus}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!isAllowed}
                        onClick={() => {
                          if (inquiryLog) {
                            handleDetailResend(inquiryLog.id);
                          } else {
                            handleResend('APPOINTMENT_INQUIRY_RECEIVED', 'EMAIL');
                          }
                        }}
                        className={`${compact ? 'text-[9px] h-6 px-2 gap-0.5' : 'text-[10px] h-7 px-2.5 gap-1'} shrink-0 disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        <RotateCw className={`size-3 ${loadingLogs || isSending ? 'animate-spin' : ''}`} />
                        {btnLabel}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
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

              const getActionProps = (targetChannel: 'SMS' | 'EMAIL', statusObj: typeof smsStatus) => {
                const key = `${entry.eventType}_${targetChannel}`;
                const isSending = resending === key;

                if (isSending) {
                  return { label: 'Sending...', allowed: false };
                }
                if (statusObj.label === 'SENT') {
                  return { label: 'Send New', allowed: allowOverrideResend };
                }
                if (statusObj.label === 'PENDING' && isCheckoutApplicable) {
                  return { label: 'Send Now', allowed: true };
                }
                return { label: 'Force Send', allowed: allowOverrideResend };
              };

              const smsAction = getActionProps('SMS', displaySmsStatus);
              const emailAction = getActionProps('EMAIL', displayEmailStatus);

              return (
                <div key={entry.key} className={compact ? 'space-y-1' : 'space-y-2'}>
                  <span className="text-xs text-muted-foreground">{entry.label}</span>
                  <div className="flex flex-col gap-2">
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
                        disabled={!smsAction.allowed}
                        onClick={() => handleResend(entry.eventType, 'SMS')}
                        className={`${compact ? 'text-[9px] h-6 px-2 gap-0.5' : 'text-[10px] h-7 px-2.5 gap-1'} shrink-0 disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        <RotateCw className={`size-3 ${resending === `${entry.eventType}_SMS` ? 'animate-spin' : ''}`} />
                        {smsAction.label}
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
                        disabled={!emailAction.allowed}
                        onClick={() => handleResend(entry.eventType, 'EMAIL')}
                        className={`${compact ? 'text-[9px] h-6 px-2 gap-0.5' : 'text-[10px] h-7 px-2.5 gap-1'} shrink-0 disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        <RotateCw className={`size-3 ${resending === `${entry.eventType}_EMAIL` ? 'animate-spin' : ''}`} />
                        {emailAction.label}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {(['CANCEL_BOOKING', 'RESCHEDULE_BOOKING'] as const).map((eventType) => {
              const label = eventType === 'CANCEL_BOOKING' ? 'Cancellation' : 'Reschedule';
              const eventOccurred = eventType === 'CANCEL_BOOKING'
                ? appointment.status === 'CANCELLED'
                : Boolean((appointment as any).rescheduleCount || (appointment as any).reschedule_count);

              return (
                <div key={eventType} className={compact ? 'space-y-1' : 'space-y-2'}>
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <div className="flex flex-col gap-2">
                    {(['EMAIL', 'SMS'] as const).map((channelType) => {
                      const logEventType = channelType === 'SMS' ? `${eventType}_SMS` : eventType;
                      const latestLog = groupedOutboxLogs.find((log) => log.eventType === logEventType);
                      const isSent = eventType === 'CANCEL_BOOKING'
                        ? channelType === 'SMS' ? commState.smsCancelSent : commState.emailCancelSent
                        : channelType === 'SMS' ? commState.smsRescheduleSent : commState.emailRescheduleSent;
                      const displayStatus = loadingLogs
                        ? 'LOADING...'
                        : isSent
                          ? 'SENT'
                          : latestLog
                            ? latestLog.status === 'FAILED'
                              ? 'FAILED'
                              : latestLog.status === 'PROCESSED'
                                ? 'SENT'
                                : 'PENDING'
                            : eventOccurred
                              ? 'NOT SENT'
                              : 'NOT APPLICABLE';
                      const statusBadgeClass = loadingLogs
                        ? 'bg-muted text-muted-foreground/60 animate-pulse'
                        : displayStatus === 'SENT'
                          ? 'bg-green-500/10 text-green-500'
                          : displayStatus === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-600'
                            : displayStatus === 'PENDING'
                              ? 'bg-muted text-muted-foreground/60'
                              : 'bg-slate-500/10 text-slate-500 dark:text-slate-400';
                      const Icon = channelType === 'SMS' ? MessageSquare : Mail;

                      const isSending = (Boolean(latestLog) && detailResendingId === latestLog?.id) || resending === `${eventType}_${channelType}`;
                      const btnLabel = loadingLogs
                        ? 'Loading...'
                        : isSending
                          ? 'Sending...'
                          : displayStatus === 'SENT'
                            ? 'Send New'
                            : displayStatus === 'FAILED'
                              ? 'Retry'
                              : displayStatus === 'PENDING' || displayStatus === 'NOT SENT'
                                ? 'Send Now'
                                : 'Force Send';

                      const isAllowed = !loadingLogs && !isSending && (
                        (Boolean(latestLog) && (displayStatus === 'PENDING' || displayStatus === 'FAILED' || displayStatus === 'NOT SENT')) ||
                        allowOverrideResend
                      );

                      return (
                        <div key={logEventType} className={`flex items-center justify-between ${compact ? 'p-2' : 'p-3'} bg-secondary-bg/20 border border-card-border/60 rounded-xl`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className={`${compact ? 'size-3' : 'size-3.5'} text-muted-foreground shrink-0`} />
                            <span className="text-sm text-foreground">{channelType === 'SMS' ? 'SMS' : 'Email'}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusBadgeClass}`}>
                              {displayStatus}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!isAllowed}
                            onClick={() => {
                              if (latestLog) {
                                handleDetailResend(latestLog.id);
                              } else {
                                handleResend(eventType === 'CANCEL_BOOKING' ? 'APPOINTMENT_BOOKED' : 'APPOINTMENT_BOOKED', channelType);
                              }
                            }}
                            className={`${compact ? 'text-[9px] h-6 px-2 gap-0.5' : 'text-[10px] h-7 px-2.5 gap-1'} shrink-0 disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            <RotateCw className={`size-3 ${loadingLogs || isSending ? 'animate-spin' : ''}`} />
                            {btnLabel}
                          </Button>
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

      <hr className="border-card-border/40 mx-4" />

      {/* Section 3: Delivery Log */}
      <div className="py-3 px-4 space-y-2">
        <span className="text-sm font-medium text-foreground block">Delivery Log</span>
        {loadingLogs ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-muted/30 animate-pulse rounded-lg" />)}
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
                <div key={log.eventType} className={`flex items-center gap-2 ${compact ? 'p-2 text-xs' : 'p-3 text-sm'} rounded-xl bg-secondary-bg/20 border border-card-border/60`}>
                  <div className="shrink-0">
                    {isFailed ? <AlertCircle className="size-3.5 text-rose-500" /> : isProcessed ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Clock className="size-3.5 text-amber-500" />}
                  </div>
                  <span className="text-foreground font-medium truncate min-w-0 flex-1">
                    {EVENT_LABELS[log.eventType] || log.eventType}
                  </span>
                  {compact ? (
                    isProcessed ? (
                      <span title="PROCESSED" className="inline-flex items-center justify-center p-0.5 rounded bg-emerald-500/10 text-emerald-600 shrink-0">
                        <Check className="size-3" />
                      </span>
                    ) : (
                      <Badge variant={isFailed ? 'error' : 'warning'} className="text-[9px] px-1.5 py-0.5 shrink-0">
                        {logStatus}
                      </Badge>
                    )
                  ) : (
                    <Badge variant={isFailed ? 'error' : isProcessed ? 'success' : 'warning'} className="text-[10px] px-1.5 py-0.5 shrink-0">
                      {logStatus}
                    </Badge>
                  )}
                  <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-muted-foreground shrink-0`}>
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {compact ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDetailResend(log.id)}
                      className="h-6 w-6 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 shrink-0 disabled:opacity-50"
                      disabled={detailResendingId === log.id}
                      title={detailResendingId === log.id ? 'Sending...' : isProcessed ? 'Send New' : 'Resend'}
                    >
                      <RotateCw className={`size-3 ${detailResendingId === log.id ? 'animate-spin' : ''}`} />
                    </Button>
                  ) : (
                    <button
                      onClick={() => handleDetailResend(log.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 shrink-0 disabled:opacity-50"
                      disabled={detailResendingId === log.id}
                    >
                      {detailResendingId === log.id ? 'Sending...' : isProcessed ? 'Send New' : 'Resend'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
