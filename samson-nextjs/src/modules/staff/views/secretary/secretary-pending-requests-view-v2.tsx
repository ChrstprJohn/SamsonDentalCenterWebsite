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
  const [activeAccordion, setActiveAccordion] = React.useState<'service' | 'doctor' | 'date' | 'time' | null>(null);
  const [isEditingGuest, setIsEditingGuest] = React.useState(false);

  React.useEffect(() => {
    if (inquiriesView.selectedInquiry) {
      setIsEditingGuest(false);
      if (!inquiriesView.stagedInquiryService) setActiveAccordion('service');
      else if (!inquiriesView.stagedInquiryDate) setActiveAccordion('date');
      else if (!inquiriesView.stagedInquiryDoctor) setActiveAccordion('doctor');
      else setActiveAccordion('time');
    }
  }, [inquiriesView.selectedInquiryId]);

  return (
    <div className="flex-1 min-h-0 w-full overflow-hidden flex">
      {/* Left List Sidebar */}
      <PendingRequestListV2
        inquiries={inquiriesView.inquiries}
        selectedInquiryId={inquiriesView.selectedInquiryId}
        isLoadingInquiries={inquiriesView.isLoadingInquiries}
        onSelectInquiry={(inq) => inquiriesView.selectInquiry(inq)}
      />

      {/* Right Details Column (occupies remaining width) - data-lenis-prevent stops Lenis from hijacking nested scroll wheel events */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-background/50 overflow-y-auto p-6 md:p-8" data-lenis-prevent>
        <div className="max-w-3xl w-full mx-auto flex flex-col gap-6">
            {inquiriesView.selectedInquiry ? (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                {inquiriesView.inlineError && (
                  <div className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                    Error: {inquiriesView.inlineError}
                  </div>
                )}
                
                {/* PART 1: Guest Profile Card */}
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

                {/* Dynamic Downward Arrow */}
                <div className="flex justify-center text-slate-400 py-1">
                  <span>⬇️ [ REQUESTS ]</span>
                </div>

                {/* PART 3: Requested Appointment Info Card (Guest) */}
                <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg p-4 flex flex-col gap-3">
                  <div className="border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      📅 3. REQUESTED APPOINTMENT (INITIAL)
                    </h4>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Service Selector */}
                    <div>
                      <div 
                        onClick={() => setActiveAccordion(activeAccordion === 'service' ? null : 'service')}
                        className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 -mx-2 rounded-lg transition-colors text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs shrink-0">{inquiriesView.stagedInquiryService ? '🟢' : '🔴'}</span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16 shrink-0">Service:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {inquiriesView.services.find((s) => s.id === inquiriesView.stagedInquiryService)?.name || 'Unassigned'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary hover:underline shrink-0">
                          {inquiriesView.stagedInquiryService ? '[ Edit ]' : '[ Set ]'}
                        </span>
                      </div>
                      {activeAccordion === 'service' && (
                        <div className="pl-11 pr-2 py-2 border-t border-slate-100 dark:border-slate-900/60 mt-1">
                          <Select
                            value={inquiriesView.stagedInquiryService}
                            onChange={(e) => {
                              inquiriesView.selectService(e.target.value);
                              setActiveAccordion('date');
                            }}
                            options={[
                              { value: '', label: 'Select Service...' },
                              ...inquiriesView.services.map((s) => ({ value: s.id, label: s.name }))
                            ]}
                            className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg w-full max-w-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Date Selector */}
                    <div>
                      <div 
                        onClick={() => setActiveAccordion(activeAccordion === 'date' ? null : 'date')}
                        className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 -mx-2 rounded-lg transition-colors text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs shrink-0">{inquiriesView.stagedInquiryDate ? '🟢' : '🔴'}</span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16 shrink-0">Date:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {inquiriesView.stagedInquiryDate ? `${formatShortDate(inquiriesView.stagedInquiryDate)} (${getDayOfWeek(inquiriesView.stagedInquiryDate)})` : 'Unassigned'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary hover:underline shrink-0">
                          {inquiriesView.stagedInquiryDate ? '[ Edit ]' : '[ Set ]'}
                        </span>
                      </div>
                      {activeAccordion === 'date' && (
                        <div className="pl-11 pr-2 py-2 border-t border-slate-100 dark:border-slate-900/60 mt-1">
                          <input
                            type="date"
                            value={inquiriesView.stagedInquiryDate}
                            onChange={(e) => {
                              inquiriesView.selectDate(e.target.value);
                              setActiveAccordion('doctor');
                            }}
                            className="px-3 py-1.5 text-xs rounded-lg border bg-slate-50 dark:bg-slate-900 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-ring border-slate-200 dark:border-slate-800 w-full max-w-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Dentist Selector */}
                    <div>
                      <div 
                        onClick={() => setActiveAccordion(activeAccordion === 'doctor' ? null : 'doctor')}
                        className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 -mx-2 rounded-lg transition-colors text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs shrink-0">{inquiriesView.stagedInquiryDoctor ? '🟢' : '🔴'}</span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16 shrink-0">Dentist:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {inquiriesView.availableDoctors.find((d) => d.doctorId === inquiriesView.stagedInquiryDoctor)?.doctorName || 'Unassigned'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary hover:underline shrink-0">
                          {inquiriesView.stagedInquiryDoctor ? '[ Edit ]' : '[ Set ]'}
                        </span>
                      </div>
                      {activeAccordion === 'doctor' && (
                        <div className="pl-11 pr-2 py-2 border-t border-slate-100 dark:border-slate-900/60 mt-1">
                          <Select
                            value={inquiriesView.stagedInquiryDoctor}
                            onChange={(e) => {
                              inquiriesView.selectDoctor(e.target.value);
                              setActiveAccordion('time');
                            }}
                            options={[
                              { value: '', label: 'Select Doctor...' },
                              ...inquiriesView.availableDoctors.map((d) => ({ value: d.doctorId, label: d.doctorName }))
                            ]}
                            className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg w-full max-w-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Time Slot Selector */}
                    <div>
                      <div 
                        onClick={() => setActiveAccordion(activeAccordion === 'time' ? null : 'time')}
                        className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 -mx-2 rounded-lg transition-colors text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs shrink-0">
                            {inquiriesView.stagedInquiryTime && inquiriesView.stagedInquiryEndTime 
                              ? '🟢' 
                              : (inquiriesView.stagedInquiryTime || inquiriesView.stagedInquiryEndTime || inquiriesView.selectedInquiry.preferredStartTime) 
                                ? '🟡' 
                                : '🔴'}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16 shrink-0">Time Slot:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {inquiriesView.stagedInquiryTime && inquiriesView.stagedInquiryEndTime 
                              ? `${convertTo12h(inquiriesView.stagedInquiryTime)} - ${convertTo12h(inquiriesView.stagedInquiryEndTime)}` 
                              : inquiriesView.stagedInquiryTime 
                                ? `${convertTo12h(inquiriesView.stagedInquiryTime)} (Pending End Time...)` 
                                : inquiriesView.stagedInquiryEndTime 
                                  ? `(Pending Start Time...) - ${convertTo12h(inquiriesView.stagedInquiryEndTime)}` 
                                  : inquiriesView.selectedInquiry.preferredStartTime 
                                    ? `${convertTo12h(convertTo24h(inquiriesView.selectedInquiry.preferredStartTime))} (Pending End Time...)` 
                                    : 'Unassigned'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary hover:underline shrink-0">
                          {(inquiriesView.stagedInquiryTime && inquiriesView.stagedInquiryEndTime) ? '[ Edit ]' : '[ Set ]'}
                        </span>
                      </div>
                      {activeAccordion === 'time' && (
                        <div className="pl-11 pr-2 py-2 border-t border-slate-100 dark:border-slate-900/60 mt-1">
                          <div className="flex items-center gap-2 max-w-md">
                            <Select
                              value={convertTo12h(inquiriesView.stagedInquiryTime)}
                              onChange={(e) => inquiriesView.setStagedInquiryTime(convertTo24h(e.target.value))}
                              options={[
                                { value: '', label: 'Select Start Time...' },
                                ...PENDING_CLINIC_HOURS.map((hour) => ({ value: hour, label: hour }))
                              ]}
                              className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg flex-1"
                            />
                            <span className="text-xs text-text-muted">to</span>
                            <Select
                              value={convertTo12h(inquiriesView.stagedInquiryEndTime)}
                              onChange={(e) => {
                                inquiriesView.setStagedInquiryEndTime(convertTo24h(e.target.value));
                                setActiveAccordion(null);
                              }}
                              options={[
                                { value: '', label: 'Select End Time...' },
                                ...PENDING_CLINIC_HOURS.map((hour) => ({ value: hour, label: hour }))
                              ]}
                              className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg flex-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* PART 4: PATIENT LINKING & NOTES (Guest) */}
                {inquiriesView.stagedInquiryAction === 'CONVERT' && (
                  <>
                    {/* Dynamic Downward Arrow */}
                    <div className="flex justify-center text-slate-400 py-1">
                      <span>⬇️ [ MANAGES ]</span>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg p-4 flex flex-col gap-3 animate-in fade-in duration-200">
                      <div className="border-b border-slate-100 dark:border-slate-800/80 pb-2">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          👤 4. PATIENT LINKING & NOTES
                        </h4>
                      </div>
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
                  </>
                )}

                {/* Dynamic Downward Arrow */}
                <div className="flex justify-center text-slate-400 py-1">
                  <span>⬇️ [ DECISION ]</span>
                </div>

                {/* PART 5: ACTION CENTER (Guest) */}
                {(() => {
                  const isMissingDoctor = !inquiriesView.stagedInquiryDoctor;
                  const isMissingTime = !inquiriesView.stagedInquiryTime || !inquiriesView.stagedInquiryEndTime;
                  const isLocked = isMissingDoctor || isMissingTime;
                  
                  return (
                    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg p-4 flex flex-col gap-3">
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex flex-col gap-1">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">🛠️ 5. ACTION CENTER</h4>
                        {isLocked && (
                          <span className="text-[10px] text-rose-500 font-semibold mt-1">
                            ⚠️ Please finish assigning the Dentist and Time Slot to approve this request.
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          disabled={isLocked}
                          onClick={() => inquiriesView.setDecision('CONVERT')} 
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                            isLocked 
                              ? 'opacity-40 cursor-not-allowed bg-secondary-bg/5 border-card-border text-text-muted' 
                              : inquiriesView.stagedInquiryAction === 'CONVERT' 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                                : 'border-card-border bg-card text-text-muted hover:text-text-primary'
                          }`}
                        >
                          🟢 Approve Booking{isLocked ? ' (Locked)' : ''}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => inquiriesView.setDecision('DROP')} 
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                            inquiriesView.stagedInquiryAction === 'DROP' 
                              ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' 
                              : 'border-card-border bg-card text-text-muted hover:text-text-primary'
                          }`}
                        >
                          🔴 Reject Booking
                        </button>
                      </div>

                      {inquiriesView.stagedInquiryAction === 'DROP' && (
                        <div className="flex flex-col gap-2 mt-2">
                          <span className="text-xs font-bold text-text-secondary">Rejection Reason / Remarks (Required)</span>
                          <textarea
                            value={inquiriesView.stagedInquiryNote}
                            onChange={(e) => inquiriesView.setStagedInquiryNote(e.target.value)}
                            placeholder="Enter reason for dropping/archiving this inquiry..."
                            rows={3}
                            className="text-xs border border-card-border rounded-xl px-3 py-2 bg-secondary-bg/20 text-text-primary resize-none focus:outline-none focus:border-primary-start/60"
                          />
                        </div>
                      )}

                      <Button
                        onClick={() => inquiriesView.submitReview(inquiriesView.selectedInquiry.id)}
                        disabled={!inquiriesView.canSubmit}
                        variant="primary"
                        className="w-full text-xs font-bold py-3 mt-2"
                      >
                        {inquiriesView.isSubmitting ? 'Saving Review...' : 'Finish Review Decision'}
                      </Button>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="h-full min-h-[50vh] flex flex-col items-center justify-center text-center p-8 border border-dashed border-card-border/60 rounded-3xl bg-card/20">
                <span className="text-3xl mb-3">📋</span>
                <h3 className="text-sm font-bold text-text-primary">No Selection</h3>
                <p className="text-xs text-text-muted max-w-xs mt-1">
                  Select an active guest inquiry from the left column to view details, link patients, and process booking reviews.
                </p>
              </div>
            )}
        </div>
      </div>
      <InquiryToast toast={inquiriesView.toast} />
    </div>
  );
}
