'use client';

import React from 'react';
import { useSecretaryInquiriesQueue } from '../../hooks/secretary/use-secretary-inquiries-queue';
import { PendingRequestListV2 } from './sub-components/pending-request-list-v2';
import { CoordinationHub } from './sub-components/coordination-hub';
import { InquiryToast } from './sub-components/inquiry-toast';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  ArrowLeft,
  EllipsisVertical,
} from 'lucide-react';

function getServiceName(services: { id: string; name: string }[], serviceId: string): string {
  if (!serviceId) return 'No service selected';
  return services.find((s) => s.id === serviceId)?.name || 'Unknown service';
}

function normalizeTo24h(time: string): string {
  if (!time) return '';
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (match[3].toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatTo12h(time: string): string {
  if (!time) return '-';
  const already12h = /^(0?[1-9]|1[0-2]):[0-5]\d\s*(AM|PM)$/i;
  if (already12h.test(time.trim())) return time.trim();
  const parts = time.split(':');
  if (parts.length < 2) return time;
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1].replace(/\D/g, '');
  if (isNaN(hours)) return time;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function generateTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h < 12 ? 'AM' : 'PM';
      const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const label = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
      options.push({ value: val, label });
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

const COMMON_REASONS = [
  'Patient request accepted',
  'Appointment confirmed',
  'Rescheduled from previous date',
  'Emergency case accommodated',
  'Others',
];

export function SecretaryPendingRequestsViewV2() {
  const inquiriesView = useSecretaryInquiriesQueue();
  const [approvalReason, setApprovalReason] = React.useState('');
  const [mobileView, setMobileView] = React.useState<'list' | 'detail' | 'quickLogs'>('list');
  const [isEditingPatient, setIsEditingPatient] = React.useState(false);
  const [patientSnapshot, setPatientSnapshot] = React.useState<Record<string, string>>({});
  const [isEditingSchedule, setIsEditingSchedule] = React.useState(false);
  const [scheduleSnapshot, setScheduleSnapshot] = React.useState<Record<string, string>>({});

  const colMobile = (view: 'list' | 'detail' | 'quickLogs') =>
    mobileView === view ? 'flex' : 'hidden';

  const startTime24h = normalizeTo24h(inquiriesView.stagedInquiryTime);
  const endTimeOptions = startTime24h
    ? TIME_OPTIONS.filter((t) => t.value > startTime24h)
    : TIME_OPTIONS;
  const isReady = !!inquiriesView.stagedInquiryDoctor && !!inquiriesView.stagedInquiryEndTime;
  const hasSelection = !!inquiriesView.selectedInquiry;

  const startEditPatient = () => {
    setPatientSnapshot({
      firstName: inquiriesView.guestFirstName,
      middleName: inquiriesView.guestMiddleName,
      lastName: inquiriesView.guestLastName,
      suffix: inquiriesView.guestSuffix,
      phone: inquiriesView.guestPhone,
      email: inquiriesView.guestEmail,
    });
    setIsEditingPatient(true);
  };

  const cancelEditPatient = () => {
    inquiriesView.setGuestFirstName(patientSnapshot.firstName || '');
    inquiriesView.setGuestMiddleName(patientSnapshot.middleName || '');
    inquiriesView.setGuestLastName(patientSnapshot.lastName || '');
    inquiriesView.setGuestSuffix(patientSnapshot.suffix || '');
    inquiriesView.setGuestPhone(patientSnapshot.phone || '');
    inquiriesView.setGuestEmail(patientSnapshot.email || '');
    setIsEditingPatient(false);
  };

  const saveEditPatient = async () => {
    await inquiriesView.saveInquiryChanges('patient');
    setIsEditingPatient(false);
  };

  const startEditSchedule = () => {
    setScheduleSnapshot({
      service: inquiriesView.stagedInquiryService,
      date: inquiriesView.stagedInquiryDate,
      time: inquiriesView.stagedInquiryTime,
    });
    setIsEditingSchedule(true);
  };

  const cancelEditSchedule = () => {
    inquiriesView.selectService(scheduleSnapshot.service || '');
    inquiriesView.selectDate(scheduleSnapshot.date || '');
    inquiriesView.setStagedInquiryTime(scheduleSnapshot.time || '');
    setIsEditingSchedule(false);
  };

  const saveEditSchedule = () => {
    setIsEditingSchedule(false);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className={`lg:w-[350px] flex-1 lg:flex-none flex-col border-r border-card-border/40 bg-sidebar h-full overflow-hidden ${colMobile('list')} lg:flex`}>
        <PendingRequestListV2
          inquiries={inquiriesView.inquiries}
          selectedInquiryId={inquiriesView.selectedInquiryId}
          isLoadingInquiries={inquiriesView.isLoadingInquiries}
          onSelectInquiry={(inq) => { inquiriesView.selectInquiry(inq); setIsEditingPatient(false); setIsEditingSchedule(false); setMobileView('detail'); }}
          activeTab={inquiriesView.activeTab}
          setActiveTab={inquiriesView.setActiveTab}
          tabCounts={inquiriesView.tabCounts}
        />
      </div>

      {hasSelection ? (
        <>
      <div className={`flex-1 flex-col min-w-0 border-r border-card-border/40 ${colMobile('detail')} lg:flex`}>
        <div className="p-4 border-b border-card-border/40 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileView('list')} className="lg:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0">
              <ArrowLeft className="size-5" />
            </button>
            <div className="flex-1 text-base font-medium text-foreground">
              Request Details
            </div>
            <button onClick={() => setMobileView('quickLogs')} className="lg:hidden p-1 -mr-1 text-muted-foreground hover:text-foreground shrink-0">
              <EllipsisVertical className="size-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 !overflow-y-auto max-sm:px-3 px-5 space-y-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
          style={{ scrollbarWidth: 'thin' }}
          data-lenis-prevent
        >
              {inquiriesView.inlineError && (
                <div className="text-xs font-bold text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 my-3">
                  Error: {inquiriesView.inlineError}
                </div>
              )}

              {/* Section 1: Patient Information */}
              <div className="py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    PATIENT INFORMATION
                  </span>
                  {!isEditingPatient ? (
                    <Button variant="outline" size="sm" onClick={startEditPatient} className="h-auto px-2 py-1 text-xs">
                      Edit Info
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={cancelEditPatient} className="h-auto px-2 py-1 text-xs">
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveEditPatient} className="h-auto px-3 py-1 text-xs bg-slate-900 text-white rounded-md">
                        Save
                      </Button>
                    </div>
                  )}
                </div>
                <hr className="border-card-border/40 mb-3" />

                {!isEditingPatient ? (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-muted-foreground">First Name</span>
                        <span className="text-sm text-foreground">{inquiriesView.guestFirstName || '-'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-muted-foreground">Last Name</span>
                        <span className="text-sm text-foreground">{inquiriesView.guestLastName || '-'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-muted-foreground">Middle Name</span>
                        <span className="text-sm text-foreground">{inquiriesView.guestMiddleName || '-'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-muted-foreground">Suffix</span>
                        <span className="text-sm text-foreground">{inquiriesView.guestSuffix || '-'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-muted-foreground">Email</span>
                      <span className="text-sm text-foreground">{inquiriesView.guestEmail || '-'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-muted-foreground">Phone</span>
                      <span className="text-sm text-foreground">{inquiriesView.guestPhone || '-'}</span>
                    </div>
                    {inquiriesView.stagedInquiryNote && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-muted-foreground">Note</span>
                        <span className="text-sm text-muted-foreground italic">&ldquo;{inquiriesView.stagedInquiryNote}&rdquo;</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Last name</span>
                        <input value={inquiriesView.guestLastName} onChange={(e) => inquiriesView.setGuestLastName(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-card-border rounded-md bg-card focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Suffix</span>
                        <input value={inquiriesView.guestSuffix} onChange={(e) => inquiriesView.setGuestSuffix(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-card-border rounded-md bg-card focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">First name</span>
                        <input value={inquiriesView.guestFirstName} onChange={(e) => inquiriesView.setGuestFirstName(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-card-border rounded-md bg-card focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Middle name</span>
                        <input value={inquiriesView.guestMiddleName} onChange={(e) => inquiriesView.setGuestMiddleName(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-card-border rounded-md bg-card focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Email</span>
                        <input type="email" value={inquiriesView.guestEmail} onChange={(e) => inquiriesView.setGuestEmail(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-card-border rounded-md bg-card focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Phone</span>
                        <input value={inquiriesView.guestPhone} onChange={(e) => inquiriesView.setGuestPhone(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-card-border rounded-md bg-card focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-card-border/40" />

              {/* Section 2: Appointment Details */}
              <div className="py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    APPOINTMENT DETAILS
                  </span>
                  {isEditingSchedule ? (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={cancelEditSchedule} className="h-auto px-2 py-1 text-xs">
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveEditSchedule} className="h-auto px-3 py-1 text-xs bg-slate-900 text-white rounded-md">
                        Save Changes
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={startEditSchedule} className="h-auto px-2 py-1 text-xs">
                      Edit Schedule
                    </Button>
                  )}
                </div>
                <hr className="border-card-border/40 mb-3" />

                {isEditingSchedule ? (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Service</span>
                      <Select
                        value={inquiriesView.stagedInquiryService}
                        onChange={(e) => inquiriesView.selectService(e.target.value)}
                        options={[
                          { value: '', label: 'Select service...' },
                          ...inquiriesView.services.map((s) => ({ value: s.id, label: s.name }))
                        ]}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Appointment Date</span>
                      <DatePicker value={inquiriesView.stagedInquiryDate} onChange={(v) => inquiriesView.selectDate(v)} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Time Frame (Start &rarr; End)</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={startTime24h}
                          onChange={(e) => inquiriesView.setStagedInquiryTime(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-md border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-card-border"
                        >
                          <option value="">Start time...</option>
                          {TIME_OPTIONS.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                        <span className="text-muted-foreground text-sm shrink-0">&rarr;</span>
                        <select
                          value={inquiriesView.stagedInquiryEndTime}
                          onChange={(e) => inquiriesView.setStagedInquiryEndTime(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-md border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-card-border"
                        >
                          <option value="">End time...</option>
                          {endTimeOptions.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Assign Dentist <span className="text-destructive">*</span></span>
                      <Select
                        value={inquiriesView.stagedInquiryDoctor}
                        onChange={(e) => inquiriesView.selectDoctor(e.target.value)}
                        options={[
                          { value: '', label: 'Select available doctor...' },
                          ...inquiriesView.availableDoctors.map((d) => ({ value: d.doctorId, label: d.doctorName }))
                        ]}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Patient Requested</div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-muted-foreground">Service</span>
                        <span className="text-sm font-semibold text-foreground">{getServiceName(inquiriesView.services, inquiriesView.stagedInquiryService)}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-muted-foreground">Date</span>
                        <span className="text-sm font-semibold text-foreground">{inquiriesView.stagedInquiryDate ? new Date(inquiriesView.stagedInquiryDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-muted-foreground">Start Time</span>
                        <span className="text-sm font-semibold text-foreground">{formatTo12h(inquiriesView.stagedInquiryTime)}</span>
                      </div>
                    </div>

                    <hr className="border-card-border/40 my-3" />

                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Required Clinic Assignments</div>

                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2.5 mb-2">
                      <span className="font-semibold text-foreground text-sm shrink-0">{formatTo12h(inquiriesView.stagedInquiryTime)}</span>
                      <span className="text-muted-foreground text-sm shrink-0">&rarr;</span>
                      <select
                        value={inquiriesView.stagedInquiryEndTime}
                        onChange={(e) => inquiriesView.setStagedInquiryEndTime(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-sm rounded-md border bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 border-card-border"
                      >
                        <option value="">Select end time...</option>
                        {endTimeOptions.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Assign Dentist <span className="text-destructive">*</span></span>
                      <Select
                        value={inquiriesView.stagedInquiryDoctor}
                        onChange={(e) => inquiriesView.selectDoctor(e.target.value)}
                        options={[
                          { value: '', label: 'Select available doctor...' },
                          ...inquiriesView.availableDoctors.map((d) => ({ value: d.doctorId, label: d.doctorName }))
                        ]}
                      />
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-card-border/40" />

              {/* Section 3: Master Action Bar */}
              {inquiriesView.selectedInquiry?.status === 'NEW' && (
                <div className="py-3">
                  {!inquiriesView.stagedInquiryAction ? (
                    !isReady ? (
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-slate-50 border-slate-200">
                        <div className="flex-1 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">Fill out assignments above</span> to enable approval
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 border-red-200 text-red-700 hover:bg-red-50 h-auto px-2.5 py-1 text-xs"
                          onClick={() => { inquiriesView.setDecision('DROP'); setApprovalReason(''); }}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                          onClick={() => { inquiriesView.setDecision('CONVERT'); setApprovalReason(''); }}
                        >
                          Approve & Add to Calendar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 border-red-200 text-red-700 hover:bg-red-50 h-auto px-2.5 py-1 text-xs"
                          onClick={() => { inquiriesView.setDecision('DROP'); setApprovalReason(''); }}
                        >
                          Reject
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="border border-card-border/40 rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">
                          {inquiriesView.stagedInquiryAction === 'CONVERT' ? 'Convert note (Approve)' : 'Drop reason (Reject)'}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => { inquiriesView.setDecision(''); setApprovalReason(''); }} className="h-auto px-2 py-1 text-xs">
                          Cancel
                        </Button>
                      </div>
                      {inquiriesView.stagedInquiryAction === 'CONVERT' ? (
                        <div className="space-y-2">
                          <select
                            value={approvalReason}
                            onChange={(e) => {
                              setApprovalReason(e.target.value);
                              if (e.target.value !== 'Others') {
                                inquiriesView.setStagedInquiryNote(e.target.value);
                              } else {
                                inquiriesView.setStagedInquiryNote('');
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-card-border"
                          >
                            <option value="">Select a reason...</option>
                            {COMMON_REASONS.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                          {approvalReason === 'Others' && (
                            <textarea
                              value={inquiriesView.stagedInquiryNote}
                              onChange={(e) => inquiriesView.setStagedInquiryNote(e.target.value)}
                              placeholder="Enter custom reason..."
                              rows={2}
                              className="w-full text-sm border border-card-border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            />
                          )}
                        </div>
                      ) : (
                        <textarea
                          value={inquiriesView.stagedInquiryNote}
                          onChange={(e) => inquiriesView.setStagedInquiryNote(e.target.value)}
                          placeholder="Reason for rejection..."
                          rows={2}
                          className="w-full text-sm border border-card-border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        />
                      )}
                      <Button
                        onClick={() => inquiriesView.submitReview(inquiriesView.selectedInquiry.id)}
                        disabled={!inquiriesView.canSubmit}
                        variant={inquiriesView.stagedInquiryAction === 'CONVERT' ? 'primary' : 'destructive'}
                        size="sm"
                        className={`w-full py-2 text-xs ${inquiriesView.stagedInquiryAction === 'CONVERT' ? '!bg-slate-900' : ''}`}
                      >
                        {inquiriesView.isSubmitting
                          ? 'Saving...'
                          : `Confirm ${inquiriesView.stagedInquiryAction === 'CONVERT' ? 'Approve' : 'Reject'}`
                        }
                      </Button>
                    </div>
                  )}
                </div>
              )}

          </div>
        </div>
        <div className={`lg:w-[320px] flex-1 lg:flex-none flex-col h-full overflow-hidden ${colMobile('quickLogs')} lg:flex`}>
          <CoordinationHub inquiryId={inquiriesView.selectedInquiryId} hideActions={inquiriesView.selectedInquiry?.status !== 'NEW'} onBack={() => setMobileView('detail')} />
        </div>
      </>
    ) : (
      <div className="flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/10 max-lg:hidden flex">
        <p className="text-xs font-medium">Select an inquiry from the left list to view details and process the request.</p>
      </div>
    )}
      <InquiryToast toast={inquiriesView.toast} />
    </div>
  );
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const date = value ? new Date(value + 'T00:00:00') : new Date();
  const [month, setMonth] = React.useState(date.getMonth());
  const [day, setDay] = React.useState(date.getDate());
  const [year, setYear] = React.useState(date.getFullYear());

  const emit = (m: number, d: number, y: number) => {
    const str = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onChange(str);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className="flex gap-2">
      <select value={month} onChange={(e) => { const m = parseInt(e.target.value); setMonth(m); emit(m, day, year); }} className="flex-1 px-2.5 py-1.5 rounded-md border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-card-border">
        {MONTHS.map((name, i) => <option key={name} value={i}>{name}</option>)}
      </select>
      <select value={Math.min(day, daysInMonth)} onChange={(e) => { const d = parseInt(e.target.value); setDay(d); emit(month, d, year); }} className="w-16 px-2 py-1.5 rounded-md border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-card-border">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <select value={year} onChange={(e) => { const y = parseInt(e.target.value); setYear(y); emit(month, day, y); }} className="w-20 px-2 py-1.5 rounded-md border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-card-border">
        {Array.from({ length: 5 }, (_, i) => year - 1 + i).map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}
