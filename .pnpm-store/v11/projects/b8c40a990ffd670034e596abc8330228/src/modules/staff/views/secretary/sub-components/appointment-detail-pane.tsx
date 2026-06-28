'use client';

import { Button } from '@/components/ui/button';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AppointmentDirectoryTab } from '@/modules/staff/hooks/secretary/use-secretary-appointments';
import { formatClinicTime, formatShortDate } from '@/shared/utils/date.util';
import { AppointmentCancelForm } from './appointment-cancel-form';
import { AppointmentRescheduleForm } from './appointment-reschedule-form';
import { AppointmentStatusHistory } from './appointment-status-history';

interface AppointmentDetailPaneProps {
  view: any;
}

export function AppointmentDetailPane({ view }: AppointmentDetailPaneProps) {
  const appointment = view.selectedAppointment as AppointmentDto | undefined;
  return (
    <div className="lg:col-span-5 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
      {appointment ? <AppointmentDetails appointment={appointment} view={view} activeTab={view.activeTab} /> : (
        <div className="h-full flex items-center justify-center text-xs text-text-muted text-center py-12">
          Select an appointment from the table to inspect details and history logs.
        </div>
      )}
    </div>
  );
}

function AppointmentDetails({ appointment, view, activeTab }: { appointment: AppointmentDto; view: any; activeTab: AppointmentDirectoryTab }) {
  return (
    <div className="flex flex-col gap-4">
      <AppointmentSummary appointment={appointment} formatPatientName={view.formatPatientName} />
      {activeTab === 'upcoming' && !view.showRescheduleForm && !view.showCancelForm && (
        <div className="flex gap-2 border-t border-card-border/60 pt-3">
          <Button onClick={() => view.setShowRescheduleForm(true)} className="text-xs py-1.5 flex-1 bg-primary text-white">Reschedule</Button>
          <Button onClick={() => view.setShowCancelForm(true)} variant="danger" className="text-xs py-1.5 flex-1 border border-red-500 text-red-500 hover:bg-red-500/10">Cancel Slot</Button>
        </div>
      )}
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
      <AppointmentStatusHistory appointment={appointment} activeTab={activeTab} />
    </div>
  );
}

function AppointmentSummary({ appointment, formatPatientName }: { appointment: AppointmentDto; formatPatientName: (appointment: AppointmentDto) => string }) {
  return (
    <>
      <div className="border-b border-card-border pb-3">
        <h3 className="text-base font-extrabold text-text-primary">{formatPatientName(appointment)}</h3>
        <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">{appointment.service?.name || 'Selected Treatment'}</span>
      </div>
      <div className="flex flex-col gap-1.5 text-xs">
        <InfoRow label="Dentist" value={appointment.doctor ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : '-'} />
        <InfoRow label="Scheduled" value={`${formatShortDate(appointment.date)} | ${formatClinicTime(appointment.startTime)} - ${formatClinicTime(appointment.endTime)}`} />
        <InfoRow label="Source" value={appointment.source || 'SELF_BOOKED'} />
        {appointment.userNote && (
          <div className="mt-1 bg-secondary-bg/25 p-2 rounded-lg border border-card-border/60">
            <span className="text-[10px] uppercase font-bold text-text-muted block mb-0.5">Patient Remarks:</span>
            <span className="text-[11px] text-text-secondary italic">&quot;{appointment.userNote}&quot;</span>
          </div>
        )}
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-text-muted">{label}:</span><span className="font-semibold text-text-primary">{value}</span></div>;
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
    justification: view.rescheduleJustification,
    isSubmitting: view.isSubmitting,
    onToggleTreatment: view.toggleChangeTreatment,
    onServiceSelect: view.selectRescheduleService,
    onToggleDoctor: view.toggleChangeDoctor,
    onDoctorSelect: view.setRescheduleDoctorId,
    onMonthChange: view.setRescheduleMonth,
    onDateSelect: view.selectRescheduleDate,
    onSlotSelect: view.selectRescheduleSlot,
    onJustificationChange: view.setRescheduleJustification,
    onSubmit: view.submitReschedule,
    onBack: () => view.setShowRescheduleForm(false),
  };
}
