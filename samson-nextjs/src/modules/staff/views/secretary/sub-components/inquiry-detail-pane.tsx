'use client';

import { Button } from '@/components/ui/button';
import { InquiryDecisionCard } from './inquiry-decision-card';
import { InquiryDropReason, InquirySecretaryNotes } from './inquiry-notes-panels';
import { InquiryGuestProfile } from './inquiry-guest-profile';
import { InquiryPatientLinking } from './inquiry-patient-linking';
import { InquiryRequestContext } from './inquiry-request-context';
import { InquirySchedulePanel } from './inquiry-schedule-panel';

export function InquiryDetailPane({ view }: { view: any }) {
  const inquiry = view.selectedInquiry;
  return (
    <div className="lg:col-span-7 border border-card-border bg-card rounded-3xl p-6 shadow-md overflow-y-auto max-h-[75vh] flex flex-col gap-4 justify-between min-h-[400px]">
      {inquiry ? <SelectedInquiry view={view} inquiry={inquiry} /> : <div className="h-full flex items-center justify-center text-xs text-text-muted text-center py-12">Select an active guest inquiry from the table to start reviewing details.</div>}
    </div>
  );
}

function SelectedInquiry({ view, inquiry }: { view: any; inquiry: any }) {
  return (
    <div className="flex flex-col gap-4 h-full justify-between">
      <div className="flex flex-col gap-4">
        {view.inlineError && <div className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">Error: {view.inlineError}</div>}
        <InquiryGuestProfile
          firstName={view.guestFirstName}
          setFirstName={view.setGuestFirstName}
          middleName={view.guestMiddleName}
          setMiddleName={view.setGuestMiddleName}
          lastName={view.guestLastName}
          setLastName={view.setGuestLastName}
          suffix={view.guestSuffix}
          setSuffix={view.setGuestSuffix}
          phone={view.guestPhone}
          setPhone={view.setGuestPhone}
          email={view.guestEmail}
          setEmail={view.setGuestEmail}
        />
        <InquiryDecisionCard decision={view.stagedInquiryAction} onDecisionChange={view.setDecision} />
        <InquiryRequestContext inquiry={inquiry} />
        {view.stagedInquiryAction === 'CONVERT' ? <ConvertPanels view={view} /> : view.stagedInquiryAction === 'DROP' ? (
          <InquiryDropReason value={view.stagedInquiryNote} onChange={view.setStagedInquiryNote} />
        ) : (
          <div className="border border-dashed border-card-border rounded-2xl p-8 text-center text-xs text-text-muted">Choose a decision action above to begin processing this inquiry.</div>
        )}
      </div>
      <div className="border-t border-card-border/80 pt-4 flex flex-col gap-3 mt-auto">
        <Button onClick={() => view.submitReview(inquiry.id)} disabled={!view.canSubmit} variant="primary" className="w-full text-xs font-bold py-3 mt-2">
          {view.isSubmitting ? 'Processing...' : 'Finish Inquiry Review'}
        </Button>
      </div>
    </div>
  );
}

function ConvertPanels({ view }: { view: any }) {
  return (
    <div className="flex flex-col gap-3 animate-fadeIn">
      <InquirySchedulePanel
        services={view.services}
        selectedService={view.stagedInquiryService}
        onServiceSelect={view.selectService}
        currentMonth={view.currentMonth}
        onMonthChange={view.setCurrentMonth}
        availableDates={view.availableDates}
        selectedDate={view.stagedInquiryDate}
        onDateSelect={view.selectDate}
        doctors={view.availableDoctors}
        selectedDoctor={view.stagedInquiryDoctor}
        onDoctorSelect={view.selectDoctor}
        slots={view.timeslots}
        selectedTime={view.stagedInquiryTime}
        onSlotSelect={view.selectSlot}
        isLoadingServices={view.isLoadingServices}
        isLoadingDays={view.isLoadingDays}
        isLoadingDoctors={view.isLoadingDoctors}
        isLoadingSlots={view.isLoadingSlots}
      />
      <InquiryPatientLinking
        patientMode={view.patientMode}
        setPatientMode={view.setPatientMode}
        patientSearchQuery={view.patientSearchQuery}
        setPatientSearchQuery={view.setPatientSearchQuery}
        patientSearchResults={view.patientSearchResults}
        isSearchingPatients={view.isSearchingPatients}
        selectedPatient={view.selectedPatient}
        onSelectPatient={view.selectPatient}
        onClearPatient={view.clearPatient}
      />
      <InquirySecretaryNotes value={view.stagedSecretaryNotes} onChange={view.setSecretaryNotes} />
    </div>
  );
}
