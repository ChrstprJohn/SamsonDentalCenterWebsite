'use client';

import { Button } from '@/components/ui/button';
import { InquiryDecisionCard } from './inquiry-decision-card';
import { InquiryDropReason } from './inquiry-notes-panels';
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

const CHANNEL_OPTIONS = [
  { value: 'EMAIL', label: 'Email' },
  { value: 'SMS', label: 'SMS' },
  { value: 'BOTH', label: 'Both' },
  { value: 'NONE', label: 'None' },
] as const;

function ConvertPanels({ view }: { view: any }) {
  return (
    <div className="flex flex-col gap-4 border-t border-card-border/60 pt-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-0.5">
        <h3 className="text-base font-medium text-foreground">Convert to Appointment</h3>
        <p className="text-xs text-muted-foreground">Assign a schedule and confirm notification preferences before finalising.</p>
      </div>

      {/* Notification Channel */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">Notification Channel</label>
        <div className="grid grid-cols-4 gap-1 bg-muted/20 p-1 rounded-xl border border-card-border/40">
          {CHANNEL_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => view.setConfirmationChannel(value)}
              className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                (view.confirmationChannel || 'EMAIL') === value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule + Patient */}
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
        selectedEndTime={view.stagedInquiryEndTime}
        onSlotSelect={view.selectSlot}
        onStartTimeChange={view.setStagedInquiryTime}
        onEndTimeChange={view.setStagedInquiryEndTime}
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

      {/* Secretary Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">Secretary Call Notes (Status Reason)</label>
        <textarea
          value={view.stagedSecretaryNotes}
          onChange={(e) => view.setSecretaryNotes(e.target.value)}
          placeholder="Add notes about the conversion or call details..."
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border resize-none"
        />
      </div>
    </div>
  );
}
