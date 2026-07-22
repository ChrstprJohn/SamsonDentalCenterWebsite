'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AppointmentDirectoryTab } from '@/modules/staff/hooks/secretary/use-secretary-appointments';
import { SharedAppointmentDetail } from '@/modules/appointments/components/sub-components/shared-appointment-detail';
import { AppointmentCancelForm } from './appointment-cancel-form';
import { AppointmentRescheduleForm } from './appointment-reschedule-form';
import { AppointmentStatusHistory } from './appointment-status-history';
import { Send, Calendar, RotateCw, Pencil, X, Check, Mail, MessageSquare } from 'lucide-react';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';
import { resendNotificationAction } from '@/modules/appointments/actions/status/resend-notification.action';

interface AppointmentDetailPaneProps {
  view: any;
  compact?: boolean;
}

export function AppointmentDetailPane({ view, compact }: AppointmentDetailPaneProps) {
  const appointment = view.selectedAppointment as AppointmentDto | undefined;
  if (!appointment) return null;
  return <AppointmentDetails appointment={appointment} view={view} activeTab={view.activeTab} compact={compact} />;
}

function AppointmentDetails({ appointment, view, activeTab, compact }: { appointment: AppointmentDto; view: any; activeTab: AppointmentDirectoryTab; compact?: boolean }) {
  const [resending, setResending] = useState<string | null>(null);
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
    });
  }, [appointment]);

  const handleResend = async (eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H', targetChannel: 'EMAIL' | 'SMS') => {
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
        }
        return { ...prev, ...updates };
      });

      if (view?.fetchData) {
        view.fetchData();
      }
    } else {
      alert(res.error || 'Failed to resend notification.');
    }
    setResending(null);
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
    eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H';
    emailSent: boolean;
    smsSent: boolean;
  }[] = [
    { key: 'confirmation', label: 'Booking Confirmation', eventType: 'APPOINTMENT_BOOKED', emailSent: commState.emailConfirmationSent, smsSent: commState.smsConfirmationSent },
    { key: 'reminder48h', label: '48-Hour Reminder', eventType: 'APPOINTMENT_REMINDER_48H', emailSent: commState.emailReminder48hSent, smsSent: commState.smsReminder48hSent },
    { key: 'reminder24h', label: '24-Hour Reminder', eventType: 'APPOINTMENT_REMINDER_24H', emailSent: commState.emailReminder24hSent, smsSent: commState.smsReminder24hSent },
  ];

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
              {!isEditingChannel && (
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
            <span className={`${compact ? 'text-sm' : 'text-base'} font-medium text-foreground block`}>Notification History</span>
            <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-3'}`}>
              {commEntries.map((entry) => {
                const hasEmail = channel === 'EMAIL' || channel === 'BOTH';
                const hasSms = channel === 'SMS' || channel === 'BOTH';

                return (
                  <div key={entry.key} className={compact ? 'space-y-1' : 'space-y-2'}>
                    <span className="text-xs text-muted-foreground">{entry.label}</span>
                    <div className={!compact && hasEmail && hasSms ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}>
                      {hasSms && (
                        <div className={`flex items-center justify-between ${compact ? 'p-2' : 'p-3'} bg-secondary-bg/20 border border-card-border/60 rounded-xl`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <MessageSquare className={`${compact ? 'size-3' : 'size-3.5'} text-muted-foreground shrink-0`} />
                            <span className="text-sm text-foreground">SMS</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              entry.smsSent ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground/60'
                            }`}>
                              {entry.smsSent ? 'SENT' : 'PENDING'}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={resending === `${entry.eventType}_SMS`}
                            onClick={() => handleResend(entry.eventType, 'SMS')}
                            className={`${compact ? 'text-[9px] h-6 px-2 gap-0.5' : 'text-[10px] h-7 px-2.5 gap-1'} shrink-0`}
                          >
                            <RotateCw className={`size-3 ${resending === `${entry.eventType}_SMS` ? 'animate-spin' : ''}`} />
                            {resending === `${entry.eventType}_SMS` ? 'Sending...' : 'Resend'}
                          </Button>
                        </div>
                      )}
                      {hasEmail && (
                        <div className={`flex items-center justify-between ${compact ? 'p-2' : 'p-3'} bg-secondary-bg/20 border border-card-border/60 rounded-xl`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail className={`${compact ? 'size-3' : 'size-3.5'} text-muted-foreground shrink-0`} />
                            <span className="text-sm text-foreground">Email</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              entry.emailSent ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground/60'
                            }`}>
                              {entry.emailSent ? 'SENT' : 'PENDING'}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={resending === `${entry.eventType}_EMAIL`}
                            onClick={() => handleResend(entry.eventType, 'EMAIL')}
                            className={`${compact ? 'text-[9px] h-6 px-2 gap-0.5' : 'text-[10px] h-7 px-2.5 gap-1'} shrink-0`}
                          >
                            <RotateCw className={`size-3 ${resending === `${entry.eventType}_EMAIL` ? 'animate-spin' : ''}`} />
                            {resending === `${entry.eventType}_EMAIL` ? 'Sending...' : 'Resend'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {channel === 'NONE' && (
                <p className="text-xs text-muted-foreground italic">No notification channel selected.</p>
              )}
            </div>
          </div>
          <hr className={`border-card-border/40 ${compact ? 'mx-4' : 'mx-5'}`} />
          <div className={`${compact ? 'px-4 pb-4 pt-1' : 'px-5 pb-6 pt-2'}`}>
            <AppointmentStatusHistory appointment={appointment} activeTab={activeTab} compact={compact} />
          </div>
        </>
      }
      actionsBar={activeTab === 'upcoming' ? (
        !view.showRescheduleForm && !view.showCancelForm ? (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-[42px]" onClick={() => view.setShowRescheduleForm(true)}>
              Reschedule
            </Button>
            <Button variant="outline" className="flex-1 h-[42px] border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => view.setShowCancelForm(true)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {view.showRescheduleForm && <AppointmentRescheduleForm appointment={appointment} {...getRescheduleProps(view)} />}
            {view.showCancelForm && (
              <AppointmentCancelForm
                reasonPreset={view.cancelReasonPreset}
                setReasonPreset={view.setCancelReasonPreset}
                reasonCustom={view.cancelReasonCustom}
                setReasonCustom={view.setCancelReasonCustom}
                isSubmitting={view.isSubmitting}
                onSubmit={view.submitCancel}
                onBack={() => view.setShowCancelForm(false)}
              />
            )}
          </div>
        )
      ) : undefined}
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
