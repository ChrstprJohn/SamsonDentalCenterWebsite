'use client';

import React from 'react';
import { PENDING_CLINIC_HOURS } from '../../hooks/secretary/use-secretary-pending-requests';
import { useSecretaryInquiriesQueue } from '../../hooks/secretary/use-secretary-inquiries-queue';
import { PendingRequestListV2 } from './sub-components/pending-request-list-v2';
import { formatShortDate } from '@/shared/utils/date.util';

import { InquiryDecisionCard } from './sub-components/inquiry-decision-card';
import { InquiryDropReason, InquirySecretaryNotes } from './sub-components/inquiry-notes-panels';
import { InquiryGuestProfile } from './sub-components/inquiry-guest-profile';
import { InquiryPatientLinking } from './sub-components/inquiry-patient-linking';
import { InquiryRequestContext } from './sub-components/inquiry-request-context';
import { InquirySchedulePanel } from './sub-components/inquiry-schedule-panel';
import { InquiryToast } from './sub-components/inquiry-toast';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

function getDayOfWeek(dateStr: string) {
  if (!dateStr) return '';
  // Avoid time-zone offset issue by replacing hyphens and creating local date
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
}

function convertTo24h(time12h: string): string {
  if (!time12h) return '';
  const match = time12h.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return time12h;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function convertTo12h(time24h: string): string {
  if (!time24h) return '';
  if (time24h.toUpperCase().includes('AM') || time24h.toUpperCase().includes('PM')) {
    return time24h;
  }
  const [hoursStr, minutesStr] = time24h.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return time24h;
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}



export function SecretaryPendingRequestsViewV2() {
  const inquiriesView = useSecretaryInquiriesQueue();
  const [isEditingGuest, setIsEditingGuest] = React.useState(false);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left Column: Inquiry List Only */}
      <div className="w-[350px] flex flex-col flex-shrink-0">
        <PendingRequestListV2
          inquiries={inquiriesView.inquiries}
          selectedInquiryId={inquiriesView.selectedInquiryId}
          isLoadingInquiries={inquiriesView.isLoadingInquiries}
          onSelectInquiry={(inq) => inquiriesView.selectInquiry(inq)}
        />
      </div>

      {/* Right Column: Profile, Details & Actions */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto p-6 gap-6" data-lenis-prevent>
        {inquiriesView.selectedInquiry ? (
          <>
            {inquiriesView.inlineError && (
              <div className="text-xs font-bold text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                Error: {inquiriesView.inlineError}
              </div>
            )}
            
            {/* Guest Profile Card */}
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
              setEmail={inquiriesView.setEmail}
              patientNote={inquiriesView.selectedInquiry.patientNote || ''}
              isEditing={isEditingGuest}
              onToggle={() => setIsEditingGuest(!isEditingGuest)}
            />

            {/* Patient Linking & Notes */}
            {inquiriesView.stagedInquiryAction === 'CONVERT' && (
              <div className="border border-card-border bg-card rounded-3xl p-6 shadow-md">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Patient Linking & Notes</h4>
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
            )}

            {/* Schedule Card */}
            <div className="border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-4">
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Service & Schedule</h4>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-text-muted mb-1 block">Service</label>
                  <Select
                    value={inquiriesView.stagedInquiryService}
                    onChange={(e) => inquiriesView.selectService(e.target.value)}
                    options={[
                      { value: '', label: 'Select Service...' },
                      ...inquiriesView.services.map((s) => ({ value: s.id, label: s.name }))
                    ]}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-text-muted mb-1 block">Date</label>
                  <input
                    type="date"
                    value={inquiriesView.stagedInquiryDate}
                    onChange={(e) => inquiriesView.selectDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-card text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-ring transition-all border-card-border"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-text-muted mb-1 block">Dentist</label>
                  <Select
                    value={inquiriesView.stagedInquiryDoctor}
                    onChange={(e) => inquiriesView.selectDoctor(e.target.value)}
                    options={[
                      { value: '', label: 'Select Doctor...' },
                      ...inquiriesView.availableDoctors.map((d) => ({ value: d.doctorId, label: d.doctorName }))
                    ]}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-text-muted mb-1 block">Time Slot</label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={convertTo12h(inquiriesView.stagedInquiryTime)}
                      onChange={(e) => inquiriesView.setStagedInquiryTime(convertTo24h(e.target.value))}
                      options={[
                        { value: '', label: 'Start...' },
                        ...PENDING_CLINIC_HOURS.map((hour) => ({ value: hour, label: hour }))
                      ]}
                    />
                    <span className="text-xs text-text-muted">to</span>
                    <Select
                      value={convertTo12h(inquiriesView.stagedInquiryEndTime)}
                      onChange={(e) => inquiriesView.setStagedInquiryEndTime(convertTo24h(e.target.value))}
                      options={[
                        { value: '', label: 'End...' },
                        ...PENDING_CLINIC_HOURS.map((hour) => ({ value: hour, label: hour }))
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Center Card */}
            {(() => {
              const isMissingDoctor = !inquiriesView.stagedInquiryDoctor;
              const isMissingTime = !inquiriesView.stagedInquiryTime || !inquiriesView.stagedInquiryEndTime;
              const isLocked = isMissingDoctor || isMissingTime;
              
              return (
                <div className="border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Action Center</h4>
                  {isLocked && (
                    <span className="text-[10px] text-destructive font-semibold">
                      Assign a Dentist and Time Slot to approve.
                    </span>
                  )}

                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      disabled={isLocked}
                      onClick={() => inquiriesView.setDecision('CONVERT')} 
                      className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
                        isLocked 
                          ? 'opacity-40 cursor-not-allowed bg-muted/5 border-border text-muted-foreground' 
                          : inquiriesView.stagedInquiryAction === 'CONVERT' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                            : 'border-card-border bg-card text-text-muted hover:text-text-primary'
                      }`}
                    >
                      Approve Booking
                    </button>
                    <button 
                      type="button" 
                      onClick={() => inquiriesView.setDecision('DROP')} 
                      className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
                        inquiriesView.stagedInquiryAction === 'DROP' 
                          ? 'bg-destructive/10 text-destructive border-destructive/30' 
                          : 'border-card-border bg-card text-text-muted hover:text-text-primary'
                      }`}
                    >
                      Reject Booking
                    </button>
                  </div>

                  {inquiriesView.stagedInquiryAction === 'DROP' && (
                    <textarea
                      value={inquiriesView.stagedInquiryNote}
                      onChange={(e) => inquiriesView.setStagedInquiryNote(e.target.value)}
                      placeholder="Reason for rejection..."
                      rows={3}
                      className="w-full text-xs border border-card-border rounded-xl px-3 py-2 bg-card text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary-ring transition-all"
                    />
                  )}

                  <Button
                    onClick={() => inquiriesView.submitReview(inquiriesView.selectedInquiry.id)}
                    disabled={!inquiriesView.canSubmit}
                    variant="default"
                    size="sm"
                    className="w-full text-xs font-bold mt-1"
                  >
                    {inquiriesView.isSubmitting ? 'Saving...' : 'Finish Review Decision'}
                  </Button>
                </div>
              );
            })()}
          </>
        ) : (
          <div className="h-full min-h-[50vh] flex flex-col items-center justify-center text-center p-8 border border-dashed border-card-border/60 rounded-3xl bg-card/20">
            <span className="text-3xl mb-3 text-muted-foreground">📋</span>
            <h3 className="text-sm font-bold text-text-primary">No Selection</h3>
            <p className="text-xs text-text-muted max-w-xs mt-1">
              Select an inquiry from the left list to view details and process the request.
            </p>
          </div>
        )}
      </div>
      <InquiryToast toast={inquiriesView.toast} />
    </div>
  );
}
