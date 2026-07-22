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
import { Send, Calendar, RotateCw, CheckCircle2, XCircle, Clock, Pencil, X, Check, Mail, MessageSquare } from 'lucide-react';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';
import { resendNotificationAction } from '@/modules/appointments/actions/status/resend-notification.action';

interface AppointmentDetailPaneProps {
  view: any;
}

export function AppointmentDetailPane({ view }: AppointmentDetailPaneProps) {
  const appointment = view.selectedAppointment as AppointmentDto | undefined;
  if (!appointment) return null;
  return <AppointmentDetails appointment={appointment} view={view} activeTab={view.activeTab} />;
}

function AppointmentDetails({ appointment, view, activeTab }: { appointment: AppointmentDto; view: any; activeTab: AppointmentDirectoryTab }) {
  const [resending, setResending] = useState<string | null>(null);
  const [channel, setChannel] = useState<'EMAIL' | 'SMS' | 'BOTH' | 'NONE'>(
    (appointment.confirmationChannel as any) || 'EMAIL'
  );
  const [draftChannel, setDraftChannel] = useState<'EMAIL' | 'SMS' | 'BOTH' | 'NONE'>(channel);
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [isSavingChannel, setIsSavingChannel] = useState(false);
  const [commState, setCommState] = useState({
    confirmationSent: appointment.confirmationSent ?? false,
    paymentReceiptSent: appointment.paymentReceiptSent ?? false,
    reminder48hSent: appointment.reminder48hSent,
    reminder24hSent: appointment.reminder24hSent,
  });

  useEffect(() => {
    setChannel(((appointment.confirmationChannel as any) || 'EMAIL'));
    setDraftChannel(((appointment.confirmationChannel as any) || 'EMAIL'));
    setCommState({
      confirmationSent: appointment.confirmationSent ?? false,
      paymentReceiptSent: appointment.paymentReceiptSent ?? false,
      reminder48hSent: appointment.reminder48hSent,
      reminder24hSent: appointment.reminder24hSent,
    });
  }, [appointment]);

  const handleResend = async (
    eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H',
    targetChannel: 'EMAIL' | 'SMS'
  ) => {
    const resendKey = `${eventType}_${targetChannel}`;
    setResending(resendKey);
    const res = await resendNotificationAction({ appointmentId: appointment.id, eventType, targetChannel });
    if (res.success) {
      setCommState((prev) => {
        const updates: Partial<typeof prev> = {};
        if (eventType === 'APPOINTMENT_REMINDER_48H') updates.reminder48hSent = true;
        else if (eventType === 'APPOINTMENT_REMINDER_24H') updates.reminder24hSent = true;
        else if (eventType === 'APPOINTMENT_BOOKED') updates.confirmationSent = true;
        return { ...prev, ...updates };
      });
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
    sent: boolean;
  }[] = [
    { key: 'confirmation', label: 'Booking Confirmation', eventType: 'APPOINTMENT_BOOKED', sent: commState.confirmationSent },
    { key: 'reminder48h', label: '48-Hour Reminder', eventType: 'APPOINTMENT_REMINDER_48H', sent: commState.reminder48hSent },
    { key: 'reminder24h', label: '24-Hour Reminder', eventType: 'APPOINTMENT_REMINDER_24H', sent: commState.reminder24hSent },
  ];

  return (
    <SharedAppointmentDetail
      appointment={appointment}
      extraSections={
        <>
          <hr className="border-card-border/40 mx-5" />
          {/* Notification Channel */}
          <div className="py-4 px-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-medium text-foreground">Notification Channel</span>
              {!isEditingChannel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingChannel(true)}
                  className="h-auto px-4 py-2 text-sm gap-1.5 max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
                >
                  <Pencil className="size-4" /> Edit
                </Button>
              )}
              {isEditingChannel && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelChannel} className="h-auto px-4 py-2 text-sm gap-1.5 max-sm:px-3 max-sm:py-1.5 max-sm:text-xs">
                    <X className="size-3.5" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveChannel} disabled={isSavingChannel || draftChannel === channel} className="h-auto px-4 py-2 text-sm gap-1.5 max-sm:px-3 max-sm:py-1.5 max-sm:text-xs bg-slate-900 text-white rounded-md disabled:cursor-not-allowed">
                    <Check className="size-3.5" /> {isSavingChannel ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>

            {isEditingChannel ? (
              <Select
                value={draftChannel}
                onChange={(e) => setDraftChannel(e.target.value as any)}
                className="text-xs w-full"
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

          <hr className="border-card-border/40 mx-5" />
          {/* Communication History */}
          <div className="py-4 px-5 space-y-3">
            <span className="text-base font-medium text-foreground block">Communication History</span>
            <div className="flex flex-col gap-3">
              {commEntries.map((entry) => {
                const emailActive = channel === 'EMAIL' || channel === 'BOTH';
                const smsActive = channel === 'SMS' || channel === 'BOTH';
                const resendingSmsKey = `${entry.eventType}_SMS`;
                const resendingEmailKey = `${entry.eventType}_EMAIL`;

                return (
                  <div key={entry.key} className="space-y-2">
                    <span className="text-xs font-semibold text-foreground block">{entry.label}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MessageSquare className="size-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs font-medium text-foreground">SMS</span>
                          </div>
                          {smsActive ? (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              entry.sent ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground/60'
                            }`}>
                              {entry.sent ? 'SENT' : 'PENDING'}
                            </span>
                          ) : (
                            <span className="text-[9px] text-muted-foreground/50 font-mono">N/A</span>
                          )}
                        </div>
                        {smsActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={resending === resendingSmsKey}
                            onClick={() => handleResend(entry.eventType, 'SMS')}
                            className="text-[10px] h-6 px-2 gap-1 w-full justify-center"
                          >
                            <RotateCw className={`size-2.5 ${resending === resendingSmsKey ? 'animate-spin' : ''}`} />
                            {resending === resendingSmsKey ? 'Sending...' : 'Resend SMS'}
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Mail className="size-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs font-medium text-foreground">Email</span>
                          </div>
                          {emailActive ? (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              entry.sent ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground/60'
                            }`}>
                              {entry.sent ? 'SENT' : 'PENDING'}
                            </span>
                          ) : (
                            <span className="text-[9px] text-muted-foreground/50 font-mono">N/A</span>
                          )}
                        </div>
                        {emailActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={resending === resendingEmailKey}
                            onClick={() => handleResend(entry.eventType, 'EMAIL')}
                            className="text-[10px] h-6 px-2 gap-1 w-full justify-center"
                          >
                            <RotateCw className={`size-2.5 ${resending === resendingEmailKey ? 'animate-spin' : ''}`} />
                            {resending === resendingEmailKey ? 'Sending...' : 'Resend Email'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <hr className="border-card-border/40 mx-5" />
          <div className="px-5 pb-6 pt-2">
            <AppointmentStatusHistory appointment={appointment} activeTab={activeTab} />
          </div>
        </>
      }
      actionsBar={activeTab === 'upcoming' ? (
        !view.showRescheduleForm && !view.showCancelForm ? (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => view.setShowRescheduleForm(true)}>
              <Calendar className="size-4" /> Reschedule
            </Button>
            <Button variant="outline" className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => view.setShowCancelForm(true)}>
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
