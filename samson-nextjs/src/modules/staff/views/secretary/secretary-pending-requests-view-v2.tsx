'use client';

import React from 'react';
import { useSecretaryPendingRequests } from '../../hooks/secretary/use-secretary-pending-requests';
import { useSecretaryInquiriesQueue } from '../../hooks/secretary/use-secretary-inquiries-queue';
import { PendingDecisionForm } from './sub-components/pending-decision-form';
import { PendingDoctorSchedule } from './sub-components/pending-doctor-schedule';
import { PendingEditPanel } from './sub-components/pending-edit-panel';
import { PendingRequestListV2 } from './sub-components/pending-request-list-v2';
import { PendingRequestOverview } from './sub-components/pending-request-overview';

import { InquiryDecisionCard } from './sub-components/inquiry-decision-card';
import { InquiryDropReason, InquirySecretaryNotes } from './sub-components/inquiry-notes-panels';
import { InquiryGuestProfile } from './sub-components/inquiry-guest-profile';
import { InquiryPatientLinking } from './sub-components/inquiry-patient-linking';
import { InquiryRequestContext } from './sub-components/inquiry-request-context';
import { InquirySchedulePanel } from './sub-components/inquiry-schedule-panel';
import { InquiryToast } from './sub-components/inquiry-toast';
import { Button } from '@/components/ui/button';

export function SecretaryPendingRequestsViewV2() {
  const view = useSecretaryPendingRequests();
  const inquiriesView = useSecretaryInquiriesQueue();
  const [activeTab, setActiveTab] = React.useState<'registered' | 'guest'>('registered');

  return (
    <div className="flex-1 min-h-0 w-full overflow-hidden flex">
      {/* Left List Sidebar */}
      <PendingRequestListV2
        appointments={view.appointments}
        selectedAppointmentId={view.selectedAppointmentId}
        isLoadingAppointments={view.isLoading}
        onSelectAppointment={view.selectAppointment}

        inquiries={inquiriesView.inquiries}
        selectedInquiryId={inquiriesView.selectedInquiryId}
        isLoadingInquiries={inquiriesView.isLoadingInquiries}
        onSelectInquiry={(inq) => inquiriesView.selectInquiry(inq)}

        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
      />

      {/* Right Details Column (occupies remaining width) - data-lenis-prevent stops Lenis from hijacking nested scroll wheel events */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-background/50 overflow-y-auto p-6 md:p-8" data-lenis-prevent>
        <div className="max-w-3xl w-full mx-auto flex flex-col gap-6">
          {activeTab === 'registered' ? (
            view.selectedAppointment ? (
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
            )
          ) : (
            inquiriesView.selectedInquiry ? (
              <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                {inquiriesView.inlineError && (
                  <div className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                    Error: {inquiriesView.inlineError}
                  </div>
                )}
                <InquiryGuestProfile
                  firstName={inquiriesView.guestFirstName}
                  setFirstName={inquiriesView.setGuestFirstName}
                  middleName={inquiriesView.guestMiddleName}
                  setMiddleName={inquiriesView.setGuestMiddleName}
                  lastName={inquiriesView.guestLastName}
                  setLastName={inquiriesView.setGuestLastName}
                  suffix={inquiriesView.guestSuffix}
                  setSuffix={inquiriesView.setGuestSuffix}
                  phone={inquiriesView.guestPhone}
                  setPhone={inquiriesView.setGuestPhone}
                  email={inquiriesView.guestEmail}
                  setEmail={inquiriesView.setGuestEmail}
                />
                <InquiryDecisionCard
                  decision={inquiriesView.stagedInquiryAction}
                  onDecisionChange={inquiriesView.setDecision}
                />
                <InquiryRequestContext inquiry={inquiriesView.selectedInquiry} />

                {inquiriesView.stagedInquiryAction === 'CONVERT' ? (
                  <div className="flex flex-col gap-3 animate-fadeIn">
                    <InquirySchedulePanel
                      services={inquiriesView.services}
                      selectedService={inquiriesView.stagedInquiryService}
                      onServiceSelect={inquiriesView.selectService}
                      currentMonth={inquiriesView.currentMonth}
                      onMonthChange={inquiriesView.setCurrentMonth}
                      availableDates={inquiriesView.availableDates}
                      selectedDate={inquiriesView.stagedInquiryDate}
                      onDateSelect={inquiriesView.selectDate}
                      doctors={inquiriesView.availableDoctors}
                      selectedDoctor={inquiriesView.stagedInquiryDoctor}
                      onDoctorSelect={inquiriesView.selectDoctor}
                      slots={inquiriesView.timeslots}
                      selectedTime={inquiriesView.stagedInquiryTime}
                      selectedEndTime={inquiriesView.stagedInquiryEndTime}
                      onSlotSelect={inquiriesView.selectSlot}
                      onStartTimeChange={inquiriesView.setStagedInquiryTime}
                      onEndTimeChange={inquiriesView.setStagedInquiryEndTime}
                      isLoadingServices={inquiriesView.isLoadingServices}
                      isLoadingDays={inquiriesView.isLoadingDays}
                      isLoadingDoctors={inquiriesView.isLoadingDoctors}
                      isLoadingSlots={inquiriesView.isLoadingSlots}
                    />
                    <InquiryPatientLinking
                      patientMode={inquiriesView.patientMode}
                      setPatientMode={inquiriesView.setPatientMode}
                      patientSearchQuery={inquiriesView.patientSearchQuery}
                      setPatientSearchQuery={inquiriesView.setPatientSearchQuery}
                      patientSearchResults={inquiriesView.patientSearchResults}
                      isSearchingPatients={inquiriesView.isSearchingPatients}
                      selectedPatient={inquiriesView.selectedPatient}
                      onSelectPatient={inquiriesView.selectPatient}
                      onClearPatient={inquiriesView.clearPatient}
                    />
                    <InquirySecretaryNotes
                      value={inquiriesView.stagedSecretaryNotes}
                      onChange={inquiriesView.setSecretaryNotes}
                    />
                  </div>
                ) : inquiriesView.stagedInquiryAction === 'DROP' ? (
                  <InquiryDropReason
                    value={inquiriesView.stagedInquiryNote}
                    onChange={inquiriesView.setStagedInquiryNote}
                  />
                ) : (
                  <div className="border border-dashed border-card-border rounded-2xl p-8 text-center text-xs text-text-muted bg-card/20">
                    Choose a decision action above to begin processing this inquiry.
                  </div>
                )}

                <div className="border-t border-card-border/80 pt-4 flex flex-col gap-3 mt-auto">
                  <Button
                    onClick={() => inquiriesView.submitReview(inquiriesView.selectedInquiry.id)}
                    disabled={!inquiriesView.canSubmit}
                    variant="primary"
                    className="w-full text-xs font-bold py-3"
                  >
                    {inquiriesView.isSubmitting ? 'Processing...' : 'Finish Inquiry Review'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[50vh] flex flex-col items-center justify-center text-center p-8 border border-dashed border-card-border/60 rounded-3xl bg-card/20">
                <span className="text-3xl mb-3">📋</span>
                <h3 className="text-sm font-bold text-text-primary">No Selection</h3>
                <p className="text-xs text-text-muted max-w-xs mt-1">
                  Select an active guest inquiry from the left column to view details, link patients, and process booking reviews.
                </p>
              </div>
            )
          )}
        </div>
      </div>
      <InquiryToast toast={inquiriesView.toast} />
    </div>
  );
}
