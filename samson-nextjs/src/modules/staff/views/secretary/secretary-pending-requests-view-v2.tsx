'use client';

import React from 'react';
import { useSecretaryPendingRequests } from '../../hooks/secretary/use-secretary-pending-requests';
import { PendingDecisionForm } from './sub-components/pending-decision-form';
import { PendingDoctorSchedule } from './sub-components/pending-doctor-schedule';
import { PendingEditPanel } from './sub-components/pending-edit-panel';
import { PendingRequestListV2 } from './sub-components/pending-request-list-v2';
import { PendingRequestOverview } from './sub-components/pending-request-overview';

export function SecretaryPendingRequestsViewV2() {
  const view = useSecretaryPendingRequests();

  return (
    <div className="flex-1 min-h-0 w-full overflow-hidden flex">
      {/* Left List Sidebar */}
      <PendingRequestListV2
        appointments={view.appointments}
        selectedAppointmentId={view.selectedAppointmentId}
        isLoading={view.isLoading}
        onSelect={view.selectAppointment}
      />

      {/* Right Details Column (occupies remaining width) - data-lenis-prevent stops Lenis from hijacking nested scroll wheel events */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-background/50 overflow-y-auto p-6 md:p-8" data-lenis-prevent>
        <div className="max-w-3xl w-full mx-auto flex flex-col gap-6">
          {view.selectedAppointment ? (
            view.isLoadingDetails ? (
              <div className="h-full flex items-center justify-center text-xs text-text-muted py-12">Loading request details...</div>
            ) : (
              <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                <PendingRequestOverview
                  appointment={view.selectedAppointment}
                  patientDetails={view.patientDetails}
                  conflictingAppointment={view.conflictingAppointment}
                />
                <PendingDoctorSchedule appointment={view.selectedAppointment} doctorSchedule={view.doctorSchedule} />
                
                <PendingEditPanel
                  isEditing={view.isEditing}
                  services={view.editServices}
                  serviceId={view.editServiceId}
                  doctors={view.editDoctors}
                  doctorId={view.editDoctorId}
                  availableDates={view.editAvailableDates}
                  date={view.editDate}
                  currentMonth={view.editCurrentMonth}
                  startTime={view.editStartTime}
                  endTime={view.editEndTime}
                  note={view.editNote}
                  isLoadingDays={view.isLoadingEditDays}
                  onToggle={view.toggleEditing}
                  onServiceChange={view.setEditService}
                  onDoctorChange={view.setEditDoctor}
                  onDateChange={view.setEditAppointmentDate}
                  onMonthChange={view.setEditCurrentMonth}
                  onStartTimeChange={view.setEditStartTime}
                  onEndTimeChange={view.setEditEndTime}
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
            <div className="h-full min-h-[50vh] flex flex-col items-center justify-center text-center p-8 border border-dashed border-card-border/60 rounded-3xl bg-card/20">
              <span className="text-3xl mb-3">📋</span>
              <h3 className="text-sm font-bold text-text-primary">No Selection</h3>
              <p className="text-xs text-text-muted max-w-xs mt-1">
                Select a pending appointment request from the left column to view schedules, patient histories, and process booking reviews.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
