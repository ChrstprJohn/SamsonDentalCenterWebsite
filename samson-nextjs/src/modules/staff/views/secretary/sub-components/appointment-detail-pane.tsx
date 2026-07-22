'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AppointmentDirectoryTab } from '@/modules/staff/hooks/secretary/use-secretary-appointments';
import { SharedAppointmentDetail } from '@/modules/appointments/components/sub-components/shared-appointment-detail';
import { AppointmentCancelForm } from './appointment-cancel-form';
import { AppointmentRescheduleForm } from './appointment-reschedule-form';
import { AppointmentStatusHistory } from './appointment-status-history';
import { Send, Calendar, Edit2 } from 'lucide-react';
import { resendReminderAction } from '@/modules/appointments/actions/status/resend-reminder.action';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';

interface AppointmentDetailPaneProps {
  view: any;
}

export function AppointmentDetailPane({ view }: AppointmentDetailPaneProps) {
  const appointment = view.selectedAppointment as AppointmentDto | undefined;
  if (!appointment) return null;
  return <AppointmentDetails appointment={appointment} view={view} activeTab={view.activeTab} />;
}

function AppointmentDetails({ appointment, view, activeTab }: { appointment: AppointmentDto; view: any; activeTab: AppointmentDirectoryTab }) {
  const [resendingType, setResendingType] = useState<'24H' | '48H' | null>(null);
  const [reminderState, setReminderState] = useState({
    reminder24hSent: appointment.reminder24hSent,
    reminder48hSent: appointment.reminder48hSent,
  });
  const [currentChannel, setCurrentChannel] = useState<'EMAIL' | 'SMS' | 'BOTH' | 'NONE'>(
    (appointment.confirmationChannel as any) || 'EMAIL'
  );
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [isSavingChannel, setIsSavingChannel] = useState(false);

  useEffect(() => {
    setReminderState({
      reminder24hSent: appointment.reminder24hSent,
      reminder48hSent: appointment.reminder48hSent,
    });
    setCurrentChannel(((appointment.confirmationChannel as any) || 'EMAIL'));
  }, [appointment]);

  const handleResend = async (type: '24H' | '48H') => {
    setResendingType(type);
    const res = await resendReminderAction({
      appointmentId: appointment.id,
      reminderType: type,
    });
    if (res.success) {
      setReminderState((prev) => ({
        ...prev,
        ...(type === '48H' ? { reminder48hSent: true } : { reminder24hSent: true }),
      }));
    }
    setResendingType(null);
  };

  const handleUpdateChannel = async (newChannel: 'EMAIL' | 'SMS' | 'BOTH' | 'NONE') => {
    setIsSavingChannel(true);
    const res = await updateConfirmationChannelAction({
      appointmentId: appointment.id,
      confirmationChannel: newChannel,
    });
    if (res.success) {
      setCurrentChannel(newChannel);
      appointment.confirmationChannel = newChannel;
      setIsEditingChannel(false);
    }
    setIsSavingChannel(false);
  };

  return (
    <SharedAppointmentDetail
      appointment={appointment}
      extraSections={
        <>
          <hr className="border-card-border/40 mx-5" />
          {/* Notification Reminders */}
          <div className="py-4 px-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-foreground">Notification Reminders</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-primary/10 text-primary border border-primary/20">
                  {currentChannel}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                onClick={() => setIsEditingChannel(!isEditingChannel)}
              >
                <Edit2 className="size-3" />
                {isEditingChannel ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            {isEditingChannel && (
              <div className="mb-3 p-3.5 bg-muted/20 border border-card-border/60 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-muted-foreground block">Select Primary Channel</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['EMAIL', 'SMS', 'BOTH', 'NONE'] as const).map((channel) => (
                    <button
                      key={channel}
                      type="button"
                      disabled={isSavingChannel}
                      onClick={() => handleUpdateChannel(channel)}
                      className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                        currentChannel === channel
                          ? 'bg-primary text-primary-foreground shadow-sm border-primary'
                          : 'bg-card text-muted-foreground border-card-border hover:text-foreground'
                      }`}
                    >
                      {channel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-secondary-bg/20 border border-card-border/60 rounded-xl p-3 flex flex-col justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">48H REMINDER</span>
                  <span className="text-xs font-semibold text-text-primary">
                    {reminderState.reminder48hSent ? 'Sent / Processed' : 'Pending / Skipped'}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="text-[10px] h-7 px-2.5 gap-1 self-start" disabled={resendingType === '48H'} onClick={() => handleResend('48H')}>
                  <Send className="size-3" />
                  {resendingType === '48H' ? 'Sending...' : 'Resend'}
                </Button>
              </div>
              <div className="bg-secondary-bg/20 border border-card-border/60 rounded-xl p-3 flex flex-col justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">24H REMINDER</span>
                  <span className="text-xs font-semibold text-text-primary">
                    {reminderState.reminder24hSent ? 'Sent / Processed' : 'Pending / Skipped'}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="text-[10px] h-7 px-2.5 gap-1 self-start" disabled={resendingType === '24H'} onClick={() => handleResend('24H')}>
                  <Send className="size-3" />
                  {resendingType === '24H' ? 'Sending...' : 'Resend'}
                </Button>
              </div>
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
