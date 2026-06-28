'use client';

import { useSecretaryRescheduleRequests } from '../../hooks/secretary/use-secretary-reschedule-requests';
import { RescheduleDecisionForm } from './sub-components/reschedule-decision-form';
import { RescheduleDoctorSchedule } from './sub-components/reschedule-doctor-schedule';
import { RescheduleRequestList } from './sub-components/reschedule-request-list';
import { RescheduleRequestSummary } from './sub-components/reschedule-request-summary';

export function SecretaryRescheduleRequestsView() {
  const view = useSecretaryRescheduleRequests();

  return (
    <div className="flex flex-col gap-8 h-full">
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
            <div className="h-full flex items-center justify-center text-xs text-text-muted text-center py-12">
              Select a reschedule request from the list to review slot details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
