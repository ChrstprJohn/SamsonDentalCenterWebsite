'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AppointmentDirectoryTab } from '@/modules/staff/hooks/secretary/use-secretary-appointments';
import { SharedAppointmentDetail } from '@/modules/appointments/components/sub-components/shared-appointment-detail';
import { AppointmentCancelForm } from './appointment-cancel-form';
import { AppointmentRescheduleForm } from './appointment-reschedule-form';
import { AppointmentStatusHistory } from './appointment-status-history';
import { Send, Calendar, RotateCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
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
  const [commState, setCommState] = useState({
    confirmationSent: appointment.confirmationSent ?? false,
    paymentReceiptSent: appointment.paymentReceiptSent ?? false,
    reminder48hSent: appointment.reminder48hSent,
    reminder24hSent: appointment.reminder24hSent,
  });

  useEffect(() => {
    setChannel(((appointment.confirmationChannel as any) || 'EMAIL'));
    setCommState({
      confirmationSent: appointment.confirmationSent ?? false,
      paymentReceiptSent: appointment.paymentReceiptSent ?? false,
      reminder48hSent: appointment.reminder48hSent,
      reminder24hSent: appointment.reminder24hSent,
    });
  }, [appointment]);

  const handleResend = async (eventType: 'APPOINTMENT_BOOKED' | 'PAYMENT_RECEIPT' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H') => {
    setResending(eventType);
    const res = await resendNotificationAction({ appointmentId: appointment.id, eventType });
    if (res.success) {
      setCommState((prev) => {
        const updates: Partial<typeof prev> = {};
        if (eventType === 'APPOINTMENT_REMINDER_48H') updates.reminder48hSent = true;
        else if (eventType === 'APPOINTMENT_REMINDER_24H') updates.reminder24hSent = true;
        else if (eventType === 'APPOINTMENT_BOOKED') updates.confirmationSent = true;
        else if (eventType === 'PAYMENT_RECEIPT') updates.paymentReceiptSent = true;
        return { ...prev, ...updates };
      });
    }
    setResending(null);
  };

  const handleChannelChange = async (newChannel: 'EMAIL' | 'SMS' | 'BOTH' | 'NONE') => {
    const res = await updateConfirmationChannelAction({
      appointmentId: appointment.id,
      confirmationChannel: newChannel,
    });
    if (res.success) {
      setChannel(newChannel);
      appointment.confirmationChannel = newChannel;
    }
  };

  const commEntries: {
    key: string;
    label: string;
    eventType: 'APPOINTMENT_BOOKED' | 'PAYMENT_RECEIPT' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H';
    sent: boolean;
  }[] = [
    { key: 'confirmation', label: 'Booking Confirmation', eventType: 'APPOINTMENT_BOOKED', sent: commState.confirmationSent },
    { key: 'receipt', label: 'Payment Receipt', eventType: 'PAYMENT_RECEIPT', sent: commState.paymentReceiptSent },
    { key: 'reminder48h', label: '48-Hour Reminder', eventType: 'APPOINTMENT_REMINDER_48H', sent: commState.reminder48hSent },
    { key: 'reminder24h', label: '24-Hour Reminder', eventType: 'APPOINTMENT_REMINDER_24H', sent: commState.reminder24hSent },
  ];

  return (
    <SharedAppointmentDetail
      appointment={appointment}
      extraSections={
        <>
          <hr className="border-card-border/40 mx-5" />
          {/* Communication History */}
          <div className="py-4 px-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-foreground">Communication History</span>
            </div>

            {/* Channel selector — radio buttons always visible */}
            <div className="p-3 bg-muted/20 border border-card-border/60 rounded-xl">
              <span className="text-xs font-semibold text-muted-foreground block mb-2">Notification Channel</span>
              <div className="flex flex-row gap-4 flex-wrap">
                {(['EMAIL', 'SMS', 'BOTH', 'NONE'] as const).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="confirmation-channel"
                      value={opt}
                      checked={channel === opt}
                      onChange={() => handleChannelChange(opt)}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Dispatch log entries */}
            <div className="flex flex-col gap-2">
              {commEntries.map((entry) => (
                <div key={entry.key} className="flex items-center justify-between p-3 bg-secondary-bg/20 border border-card-border/60 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    {entry.sent ? (
                      <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                    ) : (
                      <Clock className="size-4 shrink-0 text-muted-foreground/50" />
                    )}
                    <span className="text-xs font-medium text-foreground truncate">{entry.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      entry.sent
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-muted text-muted-foreground/60'
                    }`}>
                      {entry.sent ? 'SENT' : 'PENDING'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={resending === entry.eventType}
                    onClick={() => handleResend(entry.eventType)}
                    className="text-[10px] h-7 px-2.5 gap-1 shrink-0"
                  >
                    <RotateCw className={`size-3 ${resending === entry.eventType ? 'animate-spin' : ''}`} />
                    {resending === entry.eventType ? 'Sending...' : 'Resend'}
                  </Button>
                </div>
              ))}
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
