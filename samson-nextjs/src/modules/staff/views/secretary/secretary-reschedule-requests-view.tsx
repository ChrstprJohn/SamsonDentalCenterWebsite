'use client';

import { CalendarClock } from 'lucide-react';
import { useSecretaryRescheduleRequests } from '../../hooks/secretary/use-secretary-reschedule-requests';
import { RescheduleDecisionForm } from './sub-components/reschedule-decision-form';
import { RescheduleDoctorSchedule } from './sub-components/reschedule-doctor-schedule';
import { RescheduleRequestList } from './sub-components/reschedule-request-list';
import { RescheduleRequestSummary } from './sub-components/reschedule-request-summary';

export function SecretaryRescheduleRequestsView() {
  const view = useSecretaryRescheduleRequests();

  return (
    <div className="flex flex-col gap-8 flex-1 min-h-0 p-6 md:p-8 overflow-y-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Reschedule Requests</h1>
        <p className="text-xs text-text-muted">
          Review patient-proposed rescheduling times and choose to Approve or Reject changes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        <RescheduleRequestList
          appointments={view.appointments}
          selectedAppointmentId={view.selectedAppointmentId}
          isLoading={view.isLoading}
          onSelect={view.selectAppointment}
        />
        <div className="lg:col-span-7 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-5 justify-between">
          {view.selectedAppointment ? (
            view.isLoadingDetails ? (
              <div className="h-full flex items-center justify-center text-xs text-text-muted">Loading request details...</div>
            ) : (
              <div className="flex flex-col gap-5 h-full justify-between animate-in fade-in duration-200">
                <div className="flex flex-col gap-4">
                  <RescheduleRequestSummary
                    appointment={view.selectedAppointment}
                    patientDetails={view.patientDetails}
                    getDoctorName={view.getDoctorName}
                  />
                  <RescheduleDoctorSchedule
                    appointment={view.selectedAppointment}
                    doctorSchedule={view.doctorSchedule}
                    getDoctorName={view.getDoctorName}
                  />
                </div>
                <RescheduleDecisionForm
                  stagedStatus={view.stagedStatus}
                  stagedReason={view.stagedReason}
                  customReason={view.customReason}
                  isSubmitting={view.isSubmitting}
                  onDecisionChange={view.setDecision}
                  onReasonChange={view.setReason}
                  onCustomReasonChange={view.setCustomReason}
                  onConfirm={() => view.finishReviewDecision(view.selectedAppointment.id)}
                />
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground py-12">
              <div className="size-14 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                <CalendarClock className="size-7 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-foreground">No Reschedule Request Selected</p>
              <p className="text-xs text-muted-foreground max-w-xs mt-1">Select a reschedule request from the list to review slot details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
