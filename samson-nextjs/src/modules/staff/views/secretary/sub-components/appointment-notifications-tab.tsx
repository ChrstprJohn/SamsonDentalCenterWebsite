'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import {
  RotateCw,
  Pencil,
  X,
  Check,
  Mail,
  MessageSquare,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';
import { resendNotificationAction } from '@/modules/appointments/actions/status/resend-notification.action';
import { getEmailLogsByAppointmentAction } from '@/modules/emails/actions/logs/get-email-logs-by-appointment.action';
import { getOutboxLogByIdAction } from '@/modules/emails/actions/logs/get-outbox-log-by-id.action';
import { computeNotificationStatus } from '@/modules/notifications/utils/notification-status.util';
import type { OutboxLogResponseDto } from '@/modules/emails/dtos/logs/outbox-log-response.dto';
import { useToast } from '@/components/feedback/toast-container';
import { RenderedEmailFrame } from '@/components/emails/email-renderer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// UI Label Mappings for Event Types
const EVENT_NAME_MAP: Record<string, string> = {
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
  'RESCHEDULE_BOOKING_SMS': 'Rescheduled (SMS)',
  'CANCEL_BOOKING': 'Cancelled (Email)',
  'CANCEL_BOOKING_SMS': 'Cancelled (SMS)',
  'STAFF_REPLIED_TO_CHAT': 'Staff Reply (Email)',
  'APPOINTMENT_COMPLETED_POST_CARE': 'Post-Care Review (Email)',
  'APPOINTMENT_COMPLETED_POST_CARE_SMS': 'Post-Care (SMS)',
  'PATIENT_REGISTERED': 'Registration OTP (Email)',
  'PASSWORD_RESET_REQUESTED': 'Password Reset OTP (Email)',
};

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

function recipientLabel(recipient: string, defaultRecipient?: string): string {
  if (recipient && recipient !== 'system') return recipient;
  if (defaultRecipient) return defaultRecipient;
  return 'System Automated Dispatch';
}

class EmailErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error?.message || 'Could not render preview.' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="font-semibold">Unable to display message preview</p>
          <p className="mt-1 text-[11px] font-mono text-muted-foreground">{this.state.error}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const badgeClassFor = (status: string) =>
  status === 'SENT'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
    : status === 'FAILED'
    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
    : status === 'PENDING'
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';

interface TimelineEntry {
  id: string;
  channel: 'EMAIL' | 'SMS';
  eventType: string;
  status: string;
  rawStatus: string;
  recipient: string;
  timestamp: string;
  retryCount: number;
  errorLogs: string | null;
  payload?: Record<string, any>;
}

function TimelineEntryRow({ entry }: { entry: TimelineEntry }) {
  const statusPill = badgeClassFor(entry.status);
  const subjectOrType = EVENT_NAME_MAP[entry.eventType] || entry.eventType;

  return (
    <tr className="border-b border-card-border/40 last:border-b-0 hover:bg-muted/20 transition-colors">
      <td className="py-2.5 pr-3 text-xs font-medium text-foreground">
        <span>{subjectOrType}</span>
      </td>
      <td className="py-2.5 pr-3 text-xs text-muted-foreground" title={entry.recipient}>
        {entry.recipient}
      </td>
      <td className="py-2.5 pr-3">
        <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusPill}`}>
          {entry.status}
        </span>
      </td>
      <td className="py-2.5 pl-2 text-right text-xs text-muted-foreground font-mono text-[11px]">
        {formatTimeFull(entry.timestamp)}
      </td>
    </tr>
  );
}

interface AppointmentNotificationsTabProps {
  appointment: AppointmentDto;
  view: any;
  compact?: boolean;
}

export function AppointmentNotificationsTab({ appointment, view, compact }: AppointmentNotificationsTabProps) {
  const { addToast } = useToast();
  const [outboxLogs, setOutboxLogs] = useState<OutboxLogResponseDto[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [isTriggeringNotification, setIsTriggeringNotification] = useState<string | null>(null);

  const currentChannel = (appointment.confirmationChannel as any) || (appointment as any).confirmation_channel || 'EMAIL';
  const [draftChannel, setDraftChannel] = useState<'EMAIL' | 'SMS' | 'BOTH' | 'NONE'>(currentChannel);
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [isSavingChannel, setIsSavingChannel] = useState(false);

  const fetchLogs = React.useCallback(async () => {
    setLoadingLogs(true);
    const res = await getEmailLogsByAppointmentAction(appointment.id);
    if (res.success && res.data) {
      setOutboxLogs(res.data);
    }
    setLoadingLogs(false);
  }, [appointment.id]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setDraftChannel(currentChannel);
  }, [currentChannel]);

  const handleSaveChannel = async () => {
    setIsSavingChannel(true);
    const res = await updateConfirmationChannelAction({
      appointmentId: appointment.id,
      confirmationChannel: draftChannel,
    });
    if (res.success) {
      addToast('Notification channel updated.', 'success');
      appointment.confirmationChannel = draftChannel;
      setIsEditingChannel(false);
    } else {
      addToast(res.error || 'Failed to update notification channel.', 'error');
    }
    setIsSavingChannel(false);
  };

  const handleTriggerNotification = async (
    eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H' | 'APPOINTMENT_CHECKOUT' | 'APPOINTMENT_INQUIRY_RECEIVED' | 'CANCEL_BOOKING' | 'RESCHEDULE_BOOKING',
    targetChannel: 'EMAIL' | 'SMS'
  ) => {
    setIsTriggeringNotification(eventType);
    const res = await resendNotificationAction({
      appointmentId: appointment.id,
      eventType,
      targetChannel,
    });
    if (res.success) {
      addToast('Notification sent successfully.', 'success');
      await fetchLogs();
      if (view?.fetchData) {
        view.fetchData();
      }
    } else {
      addToast(res.error || 'Failed to send notification.', 'error');
    }
    setIsTriggeringNotification(null);
  };

  const timelineEntries: TimelineEntry[] = outboxLogs.map((log) => {
    const isSms = log.eventType.endsWith('_SMS') || log.eventType.includes('SMS');
    
    const fallbackEmail =
      (appointment as any)?.patientEmail ||
      (appointment as any)?.email ||
      (appointment as any)?.guestEmail ||
      (appointment as any)?.patient_email ||
      (appointment as any)?.patient?.email ||
      '';

    const fallbackPhone =
      (appointment as any)?.patientPhone ||
      (appointment as any)?.phone ||
      (appointment as any)?.patient_phone ||
      (appointment as any)?.patient?.phone ||
      '';

    const defaultRecipient = isSms ? fallbackPhone : fallbackEmail;

    const rawRecipient =
      (log as any).recipient ||
      log.payload?.to ||
      log.payload?.recipient ||
      log.payload?.email ||
      log.payload?.guestEmail ||
      log.payload?.phone ||
      log.payload?.phoneNumber ||
      '';

    const finalRecipient = recipientLabel(rawRecipient, defaultRecipient);

    return {
      id: log.id,
      channel: isSms ? 'SMS' : 'EMAIL',
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

  const showEmail = currentChannel === 'EMAIL' || currentChannel === 'BOTH';
  const showSms = currentChannel === 'SMS' || currentChannel === 'BOTH';

  const NOTIFICATION_TYPES: {
    eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H' | 'APPOINTMENT_CHECKOUT' | 'APPOINTMENT_INQUIRY_RECEIVED' | 'CANCEL_BOOKING' | 'RESCHEDULE_BOOKING';
    label: string;
    isRose?: boolean;
    emailOnly?: boolean;
  }[] = [
    { eventType: 'APPOINTMENT_BOOKED', label: 'Booking Confirmation' },
    { eventType: 'APPOINTMENT_REMINDER_48H', label: '48-Hour Reminder' },
    { eventType: 'APPOINTMENT_REMINDER_24H', label: '24-Hour Reminder' },
    { eventType: 'APPOINTMENT_CHECKOUT', label: 'Checkout / Thank You' },
    { eventType: 'APPOINTMENT_INQUIRY_RECEIVED', label: 'Inquiry Request Received', emailOnly: true },
    { eventType: 'CANCEL_BOOKING', label: 'Cancellation Notice' },
    { eventType: 'RESCHEDULE_BOOKING', label: 'Reschedule Notice' },
  ];

  const createdAt = (appointment as any).createdAt || (appointment as any).created_at || null;
  const startTime = (appointment as any).startTime || (appointment as any).start_time || appointment.date || null;

  const getStatus = (type: (typeof NOTIFICATION_TYPES)[number], ch: 'EMAIL' | 'SMS') => {
    if (loadingLogs) return { label: 'LOADING...', badgeClass: 'bg-muted text-muted-foreground/60 animate-pulse' };

    if (type.eventType === 'APPOINTMENT_INQUIRY_RECEIVED') {
      const inquiryLog = timelineEntries.find((log) => log.eventType === 'APPOINTMENT_INQUIRY_RECEIVED');
      const isConvertedInquiry = Boolean(
        (appointment as any)?.inquiryId ||
        (appointment as any)?.inquiry_id ||
        (appointment as any)?.appointmentInquiryId ||
        (appointment as any)?.appointment_inquiry_id ||
        inquiryLog
      );
      const status = inquiryLog
        ? (inquiryLog.rawStatus === 'PROCESSED' ? 'SENT' : inquiryLog.rawStatus === 'FAILED' ? 'FAILED' : 'PENDING')
        : isConvertedInquiry
        ? 'SENT'
        : 'NOT APPLICABLE';
      return { label: status, badgeClass: badgeClassFor(status) };
    }

    if (type.eventType === 'CANCEL_BOOKING' || type.eventType === 'RESCHEDULE_BOOKING') {
      const logEventType = ch === 'SMS' ? `${type.eventType}_SMS` : type.eventType;
      const log = timelineEntries.find((e) => (e.eventType === logEventType || e.eventType === type.eventType) && e.channel === ch);
      const status = log?.rawStatus === 'PROCESSED'
        ? 'SENT'
        : log
        ? (log.rawStatus === 'FAILED' ? 'FAILED' : 'PENDING')
        : 'NOT APPLICABLE';
      return { label: status, badgeClass: badgeClassFor(status) };
    }

    const log = timelineEntries.find((e) => {
      if (e.channel !== ch) return false;
      if (type.eventType === 'APPOINTMENT_BOOKED') {
        return ['APPOINTMENT_BOOKED', 'APPOINTMENT_CONVERTED_FROM_INQUIRY', 'APPOINTMENT_CONVERTED_FROM_INQUIRY_PATIENT', 'APPOINTMENT_CONVERTED_FROM_INQUIRY_SMS', 'APPOINTMENT_MANUALLY_BOOKED_PATIENT', 'APPOINTMENT_MANUALLY_BOOKED_GUEST', 'APPOINTMENT_MANUALLY_BOOKED_SMS'].includes(e.eventType);
      }
      if (type.eventType === 'APPOINTMENT_CHECKOUT') {
        return ['APPOINTMENT_CHECKOUT', 'APPOINTMENT_COMPLETED_POST_CARE', 'APPOINTMENT_COMPLETED_POST_CARE_SMS'].includes(e.eventType);
      }
      if (type.eventType === 'APPOINTMENT_REMINDER_48H') {
        return ['APPOINTMENT_REMINDER_48H', 'APPOINTMENT_REMINDER_48H_SMS'].includes(e.eventType);
      }
      if (type.eventType === 'APPOINTMENT_REMINDER_24H') {
        return ['APPOINTMENT_REMINDER_24H', 'APPOINTMENT_REMINDER_24H_SMS'].includes(e.eventType);
      }
      return e.eventType === type.eventType;
    });

    const isChannelEnabled =
      currentChannel === 'BOTH' ||
      (ch === 'EMAIL' && currentChannel === 'EMAIL') ||
      (ch === 'SMS' && currentChannel === 'SMS');

    if (!isChannelEnabled) {
      return { label: 'SKIPPED (Channel Off)', badgeClass: badgeClassFor('SKIPPED') };
    }

    if (log) {
      if (log.rawStatus === 'FAILED') {
        return { label: 'FAILED', badgeClass: badgeClassFor('FAILED') };
      }
      if (log.rawStatus === 'PROCESSED') {
        return { label: 'SENT', badgeClass: badgeClassFor('SENT') };
      }
      if (log.rawStatus === 'PENDING') {
        return { label: 'PENDING', badgeClass: badgeClassFor('PENDING') };
      }
    }

    const st = computeNotificationStatus({
      eventType: type.eventType as any,
      targetChannel: ch,
      isSent: false,
      currentChannel,
      createdAt,
      startTime,
    });
    return st;
  };

  return (
    <div className={`p-4 space-y-6 ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Section 1: Preferred Channel Setting */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground block">Notification Channel</span>
          {!isEditingChannel ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingChannel(true)}
              className="h-7 px-2.5 text-xs gap-1"
            >
              <Pencil className="size-3.5" /> Edit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setDraftChannel(currentChannel); setIsEditingChannel(false); }}
                className="h-7 px-2.5 text-xs gap-1"
              >
                <X className="size-3.5" /> Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveChannel}
                disabled={isSavingChannel || draftChannel === currentChannel}
                className="h-7 px-2.5 text-xs gap-1 bg-slate-900 text-white rounded-md disabled:cursor-not-allowed"
              >
                <Check className="size-3.5" /> {isSavingChannel ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Preferred Dispatch Channel</span>
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
              {currentChannel === 'NONE'
                ? 'Notifications disabled for this appointment.'
                : currentChannel === 'EMAIL'
                ? 'Only email notifications enabled.'
                : currentChannel === 'SMS'
                ? 'Only SMS notifications enabled.'
                : 'Both Email and SMS notifications enabled.'}
            </div>
          )}
        </div>
      </div>

      <hr className="border-card-border/40" />

      {/* Section 2: Notification Status Overview */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground block">Notification Status Overview</span>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-xs font-semibold text-muted-foreground border-y border-card-border/40">
                <th className="py-2.5 pr-3 font-semibold">Type</th>
                {showSms && <th className="py-2.5 pr-3 font-semibold">SMS</th>}
                {showEmail && <th className="py-2.5 pr-3 font-semibold">Email</th>}
                <th className="py-2.5 pl-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {NOTIFICATION_TYPES.map((type) => {
                const hasSmsItem = showSms && !type.emailOnly;
                const hasEmailItem = showEmail;
                const disabled = currentChannel === 'NONE' || isTriggeringNotification !== null || (!hasSmsItem && !hasEmailItem);
                const emailStatus = getStatus(type, 'EMAIL');
                const smsStatus = getStatus(type, 'SMS');

                return (
                  <tr key={type.eventType} className="border-b border-card-border/40 last:border-b-0 hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 pr-3 text-xs font-medium text-foreground">
                      {type.label}
                    </td>
                    {showSms && (
                      <td className="py-2.5 pr-3">
                        {type.emailOnly
                          ? <span className="text-muted-foreground/40">—</span>
                          : <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${smsStatus.badgeClass}`}>{smsStatus.label}</span>}
                      </td>
                    )}
                    {showEmail && (
                      <td className="py-2.5 pr-3">
                        <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${emailStatus.badgeClass}`}>{emailStatus.label}</span>
                      </td>
                    )}
                    <td className="py-2.5 pl-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={disabled} className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" title="Send notification">
                            {isTriggeringNotification === type.eventType ? <RotateCw className="size-3 animate-spin" /> : <MoreHorizontal className="size-3.5" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-72">
                          {hasEmailItem && (
                            <DropdownMenuItem onClick={() => handleTriggerNotification(type.eventType, 'EMAIL')} className="text-xs flex items-center justify-between cursor-pointer">
                              <span className="flex items-center gap-1.5 truncate">
                                <Mail className="size-3 text-muted-foreground shrink-0" />
                                {emailStatus.label === 'FAILED' ? 'Retry via Email' : emailStatus.label === 'SENT' ? 'Resend via Email' : 'Send via Email'}
                              </span>
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ml-2 ${emailStatus.badgeClass}`}>
                                {emailStatus.label}
                              </span>
                            </DropdownMenuItem>
                          )}
                          {hasSmsItem && (
                            <DropdownMenuItem onClick={() => handleTriggerNotification(type.eventType, 'SMS')} className="text-xs flex items-center justify-between cursor-pointer">
                              <span className="flex items-center gap-1.5 truncate">
                                <MessageSquare className="size-3 text-muted-foreground shrink-0" />
                                {smsStatus.label === 'FAILED' ? 'Retry via SMS' : smsStatus.label === 'SENT' ? 'Resend via SMS' : 'Send via SMS'}
                              </span>
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ml-2 ${smsStatus.badgeClass}`}>
                                {smsStatus.label}
                              </span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <hr className="border-card-border/40" />

      {/* Section 3: Delivery Logs Table */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground block">Delivery Logs</span>

        {loadingLogs ? (
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
              This appointment has no recorded notification logs yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                {timelineEntries.map((entry) => (
                  <TimelineEntryRow key={entry.id} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
