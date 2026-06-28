'use client';

import { useSecretaryPendingRequests } from '../../hooks/secretary/use-secretary-pending-requests';
import { PendingDecisionForm } from './sub-components/pending-decision-form';
import { PendingDoctorSchedule } from './sub-components/pending-doctor-schedule';
import { PendingEditPanel } from './sub-components/pending-edit-panel';
import { PendingRequestList } from './sub-components/pending-request-list';
import { PendingRequestOverview } from './sub-components/pending-request-overview';

export function SecretaryPendingRequestsView() {
  const view = useSecretaryPendingRequests();

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Appointment Requests</h1>
        <p className="text-xs text-text-muted">Review patient self-bookings and choose to Approve, Reject, or Displace requests.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        <PendingRequestList
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
                  <PendingRequestOverview
                    appointment={view.selectedAppointment}
                    patientDetails={view.patientDetails}
                    conflictingAppointment={view.conflictingAppointment}
                  />
                  <PendingDoctorSchedule appointment={view.selectedAppointment} doctorSchedule={view.doctorSchedule} />
                </div>
                <PendingEditPanel
                  isEditing={view.isEditing}
                  services={view.editServices}
                  serviceId={view.editServiceId}
                  doctors={view.editDoctors}
                  doctorId={view.editDoctorId}
                  availableDates={view.editAvailableDates}
                  date={view.editDate}
                  currentMonth={view.editCurrentMonth}
                  slots={view.editSlots}
                  startTime={view.editStartTime}
                  note={view.editNote}
                  isLoadingDays={view.isLoadingEditDays}
                  isLoadingSlots={view.isLoadingEditSlots}
                  onToggle={view.toggleEditing}
                  onServiceChange={view.setEditService}
                  onDoctorChange={view.setEditDoctor}
                  onDateChange={view.setEditAppointmentDate}
                  onMonthChange={view.setEditCurrentMonth}
                  onSlotChange={view.setEditSlot}
                  onNoteChange={view.setEditNote}
                />
                <PendingDecisionForm
                  stagedStatus={view.stagedStatus}
                  stagedReason={view.stagedReason}
                  customReason={view.customReason}
                  isSubmitting={view.isSubmitting}
                  onDecisionChange={view.setDecision}
                  onReasonChange={view.setReason}
                  onCustomReasonChange={view.setCustomReason}
                  onConfirm={() => view.finishAppointmentReview(view.selectedAppointment.id)}
                />
              </div>
            )
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-muted text-center py-12">
              Select a pending appointment request from the table to start reviewing details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
