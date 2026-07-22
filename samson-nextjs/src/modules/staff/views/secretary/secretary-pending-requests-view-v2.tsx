'use client';

import React from 'react';
import { useSecretaryInquiriesQueue } from '../../hooks/secretary/use-secretary-inquiries-queue';
import { PendingRequestListV2 } from './sub-components/pending-request-list-v2';
import { CoordinationHub } from './sub-components/coordination-hub';
import { InquiryToast } from './sub-components/inquiry-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ClipboardList,
  Pencil,
  UserRound,
  X,
} from 'lucide-react';

function getServiceName(services: { id: string; name: string }[], serviceId: string): string {
  if (!serviceId) return 'No service selected';
  return services.find((s) => s.id === serviceId)?.name || 'Unknown service';
}

function formatPatientName(firstName?: string | null, middleName?: string | null, lastName?: string | null, suffix?: string | null): string {
  const initial = middleName ? ` ${middleName.charAt(0).toUpperCase()}.` : '';
  return `${firstName || ''}${initial} ${lastName || ''}`.trim() + (suffix ? `, ${suffix}` : '');
}

function formatTime(time: string): string {
  if (!time) return '-';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
}

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
  const [assignedDoctorName, setAssignedDoctorName] = React.useState('');

  const colMobile = (view: 'list' | 'detail' | 'quickLogs') =>
    mobileView === view ? 'flex' : 'hidden';

  const isEditing = isEditingSchedule || isEditingPatient;
  const isReady = !!inquiriesView.selectedInquiry?.assignedDoctorId && !!inquiriesView.selectedInquiry?.assignedEndTime;
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

  const saveEditSchedule = async () => {
    await inquiriesView.saveInquiryChanges('schedule');
    setIsEditingSchedule(false);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className={`lg:w-[350px] flex-1 lg:flex-none flex-col border-r border-card-border/40 bg-sidebar h-full overflow-hidden ${colMobile('list')} lg:flex`}>
        <PendingRequestListV2
          inquiries={inquiriesView.inquiries}
          selectedInquiryId={inquiriesView.selectedInquiryId}
          isLoadingInquiries={inquiriesView.isLoadingInquiries}
          onSelectInquiry={(inq) => { inquiriesView.selectInquiry(inq); setIsEditingPatient(false); setIsEditingSchedule(false); setAssignedDoctorName(''); setMobileView('detail'); }}
          activeTab={inquiriesView.activeTab}
          setActiveTab={inquiriesView.setActiveTab}
          tabCounts={inquiriesView.tabCounts}
        />
      </div>

      {hasSelection ? (
        <>
      <div className={`flex-1 flex-col min-w-0 border-r border-card-border/40 ${colMobile('detail')} xl:flex`}>
        <div className="p-4 border-b border-card-border/40 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileView('list')} className="lg:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0">
              <ArrowLeft className="size-5" />
            </button>
            <div className="flex-1 text-base font-medium text-foreground text-left">
              Request Details
            </div>
            <button onClick={() => setMobileView('quickLogs')} className="xl:hidden p-1 -mr-1 text-muted-foreground hover:text-foreground shrink-0 flex flex-col items-center gap-0.5">
              <ClipboardList className="size-5" />
              <span className="text-[10px] leading-none">Notes</span>
            </button>
          </div>
        </div>
        <div className="flex-1 !overflow-y-auto max-md:px-5 px-5 space-y-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
          style={{ scrollbarWidth: 'thin' }}
          data-lenis-prevent
        >
              <div className="flex flex-col items-center pt-6 pb-4">
                <div className="size-16 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border-2 border-border/60 overflow-hidden mb-3">
                  <UserRound className="size-14 text-muted-foreground/70 translate-y-0.5" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {isEditingPatient
                    ? formatPatientName(patientSnapshot.firstName, patientSnapshot.middleName, patientSnapshot.lastName, patientSnapshot.suffix)
                    : formatPatientName(inquiriesView.guestFirstName, inquiriesView.guestMiddleName, inquiriesView.guestLastName, inquiriesView.guestSuffix)
                  }
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">Guest</p>
              </div>

              <hr className="border-card-border/40" />

              {inquiriesView.inlineError && (
                <div className="text-xs font-bold text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 my-3">
                  Error: {inquiriesView.inlineError}
                </div>
              )}

              {/* Section: Current Status */}
              <div className="flex items-center justify-between py-4">
                <span className="text-base font-medium text-foreground">Current Status</span>
                <Badge variant={inquiriesView.selectedInquiry?.status === 'NEW' ? 'warning' : inquiriesView.selectedInquiry?.status === 'CONVERTED' ? 'success' : 'error'} className="text-xs px-3 py-1">
                  {inquiriesView.selectedInquiry?.status === 'NEW' ? 'NEW / PENDING' : inquiriesView.selectedInquiry?.status === 'CONVERTED' ? 'CONVERTED / APPROVED' : 'DROPPED / REJECTED'}
                </Badge>
              </div>

              <hr className="border-card-border/40" />

              {/* Section 1: Patient Information */}
              <div className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-medium text-foreground">
                    Guest Information
                  </span>
                  {!isEditingPatient ? (
                    <Button variant="outline" size="sm" onClick={startEditPatient} className="h-7 px-2.5 text-xs gap-1">
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={cancelEditPatient} className="h-7 px-2.5 text-xs gap-1">
                        <X className="size-3.5" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveEditPatient} className="h-7 px-2.5 text-xs gap-1 bg-slate-900 text-white rounded-md">
                        <Check className="size-3.5" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                {!isEditingPatient ? (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">First Name</span>
                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{inquiriesView.guestFirstName || '-'}</div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Last Name</span>
                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{inquiriesView.guestLastName || '-'}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Middle Name</span>
                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{inquiriesView.guestMiddleName || '-'}</div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Suffix</span>
                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{inquiriesView.guestSuffix || '-'}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">First Name</span>
                        <input value={inquiriesView.guestFirstName} onChange={(e) => inquiriesView.setGuestFirstName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Last Name</span>
                        <input value={inquiriesView.guestLastName} onChange={(e) => inquiriesView.setGuestLastName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Middle Name</span>
                        <input value={inquiriesView.guestMiddleName} onChange={(e) => inquiriesView.setGuestMiddleName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Suffix</span>
                        <input value={inquiriesView.guestSuffix} onChange={(e) => inquiriesView.setGuestSuffix(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 1b: Guest Contact */}
              <div className="py-4 space-y-3">
                <span className="text-base font-medium text-foreground block">Guest Contact</span>

                {!isEditingPatient ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Email</span>
                    <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{inquiriesView.guestEmail || '-'}</div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Phone</span>
                    <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{inquiriesView.guestPhone || '-'}</div>
                  </div>
                  {inquiriesView.stagedInquiryNote && (
                    <div className="col-span-full flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Note</span>
                      <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default italic">&ldquo;{inquiriesView.stagedInquiryNote}&rdquo;</div>
                    </div>
                  )}
                </div>
                ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Email</span>
                    <input type="email" value={inquiriesView.guestEmail} onChange={(e) => inquiriesView.setGuestEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Phone</span>
                    <input value={inquiriesView.guestPhone} onChange={(e) => inquiriesView.setGuestPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                  </div>
                  <div className="col-span-full flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Note</span>
                    <textarea value={inquiriesView.stagedInquiryNote || ''} onChange={(e) => inquiriesView.setStagedInquiryNote(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border resize-none" rows={2} />
                  </div>
                </div>
                )}
              </div>

              <hr className="border-card-border/40" />

              {/* Section 2: Appointment Details */}
              <div className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-medium text-foreground">
                    Service & Schedule
                  </span>
                  {isEditingSchedule ? (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={cancelEditSchedule} className="h-7 px-2.5 text-xs gap-1">
                        <X className="size-3.5" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveEditSchedule} className="h-7 px-2.5 text-xs gap-1 bg-slate-900 text-white rounded-md">
                        <Check className="size-3.5" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={startEditSchedule} className="h-7 px-2.5 text-xs gap-1">
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditingSchedule ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Service <span className="text-destructive">*</span></span>
                        <div className="relative">
                          <select value={inquiriesView.stagedInquiryService} onChange={(e) => inquiriesView.selectService(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border appearance-none">
                            <option value="">Select service...</option>
                            {inquiriesView.services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Date <span className="text-destructive">*</span></span>
                        <DatePicker value={inquiriesView.stagedInquiryDate} onChange={(v) => inquiriesView.selectDate(v)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Start Time <span className="text-destructive">*</span></span>
                          {inquiriesView.stagedInquiryTime.includes(':') && <span className="text-xs text-muted-foreground/60">Prefered time {formatTime(inquiriesView.stagedInquiryTime)}</span>}
                        </div>
                        <input type="time" value={inquiriesView.stagedInquiryTime} onChange={(e) => inquiriesView.setStagedInquiryTime(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">End Time <span className="text-destructive">*</span></span>
                        <div className="relative">
                          <input type="time" value={inquiriesView.stagedInquiryEndTime} onChange={(e) => inquiriesView.setStagedInquiryEndTime(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                          {inquiriesView.stagedInquiryEndTime && (
                            <button type="button" onClick={() => inquiriesView.setStagedInquiryEndTime('')} className="absolute right-10 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center text-muted-foreground hover:text-foreground z-10">
                              <X className="size-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Assign Dentist <span className="text-destructive">*</span></span>
                        <div className="relative">
                          <select value={inquiriesView.stagedInquiryDoctor} onChange={(e) => { inquiriesView.selectDoctor(e.target.value); setAssignedDoctorName(e.target.options[e.target.selectedIndex].text); }} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border appearance-none">
                            <option value="">Not assigned</option>
                            {inquiriesView.availableDoctors.map((d) => <option key={d.doctorId} value={d.doctorId}>{d.doctorName}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Service <span className="text-destructive">*</span></span>
                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{getServiceName(inquiriesView.services, inquiriesView.stagedInquiryService)}</div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Date <span className="text-destructive">*</span></span>
                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{inquiriesView.stagedInquiryDate ? new Date(inquiriesView.stagedInquiryDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Start Time <span className="text-destructive">*</span></span>
                          {inquiriesView.stagedInquiryTime.includes(':') && <span className="text-xs text-muted-foreground/60">Prefered time {formatTime(inquiriesView.stagedInquiryTime)}</span>}
                        </div>
                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{formatTime(inquiriesView.stagedInquiryTime)}</div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">End Time <span className="text-destructive">*</span></span>
                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{formatTime(inquiriesView.stagedInquiryEndTime)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Assign Dentist <span className="text-destructive">*</span></span>
                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{assignedDoctorName || inquiriesView.availableDoctors.find(d => d.doctorId === inquiriesView.stagedInquiryDoctor)?.doctorName || '-'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-card-border/40" />

          </div>

              {/* Section 3: Master Action Bar */}
              {inquiriesView.selectedInquiry?.status === 'NEW' && (
                <div className="border-t border-card-border/40 px-5 py-4 shrink-0">
                  {!inquiriesView.stagedInquiryAction ? (
                    <div className="flex flex-col gap-3">
                      {isEditing && (
                        <p className="text-xs text-muted-foreground">Press Save to apply changes before approving or rejecting</p>
                      )}
                      {!isEditing && !isReady && (
                        <p className="text-xs text-muted-foreground">Fill the required fields to enable approval</p>
                      )}
                      <div className="flex gap-3">
                        <Button
                          variant="default"
                          size="default"
                          disabled={isEditing || !isReady}
                          className="flex-1 py-3 text-sm font-semibold shadow-sm !from-slate-900 !to-slate-900 !text-white hover:!from-slate-800 hover:!to-slate-800 disabled:!from-slate-400 disabled:!to-slate-400"
                          onClick={() => { inquiriesView.setDecision('CONVERT'); setApprovalReason(''); }}
                        >
                          Approve/Convert
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          disabled={isEditing}
                          className="shrink-0 border-red-200 text-red-700 hover:bg-red-50 h-auto px-5 py-3 text-sm"
                          onClick={() => { inquiriesView.setDecision('DROP'); setApprovalReason(''); }}
                        >
                          Reject/Drop
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => { e.preventDefault(); inquiriesView.submitReview(inquiriesView.selectedInquiry.id); }}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex flex-col gap-0.5">
                        <h3 className={`text-base font-medium ${inquiriesView.stagedInquiryAction === 'CONVERT' ? 'text-foreground' : 'text-destructive'}`}>
                          {inquiriesView.stagedInquiryAction === 'CONVERT' ? 'Approve & Convert' : 'Reject / Drop'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {inquiriesView.stagedInquiryAction === 'CONVERT'
                            ? 'Select notification channel and add an optional note before confirming.'
                            : 'Provide a reason for dropping this inquiry.'}
                        </p>
                      </div>

                      {inquiriesView.stagedInquiryAction === 'CONVERT' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-muted-foreground">Notification Channel</label>
                          <div className="grid grid-cols-4 gap-1 bg-muted/20 p-1 rounded-lg border border-card-border/40">
                            {(['EMAIL', 'SMS', 'BOTH', 'NONE'] as const).map((channel) => (
                              <button
                                key={channel}
                                type="button"
                                onClick={() => inquiriesView.setConfirmationChannel?.(channel)}
                                className={`py-1.5 text-[10px] font-bold rounded-md transition-all ${
                                  (inquiriesView.confirmationChannel || 'EMAIL') === channel
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                {channel}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted-foreground">
                          {inquiriesView.stagedInquiryAction === 'CONVERT' ? 'Approval Note' : 'Drop Reason'}{' '}
                          <span className="text-destructive">*</span>
                        </label>
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
                          className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                          required
                        >
                          <option value="">
                            {inquiriesView.stagedInquiryAction === 'CONVERT' ? 'Select approval note...' : 'Select drop reason...'}
                          </option>
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
                            className="w-full text-sm border border-card-border rounded-xl px-4 py-2.5 bg-card focus:outline-none focus:ring-2 focus:ring-primary-ring resize-none"
                          />
                        )}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          type="submit"
                          disabled={!inquiriesView.canSubmit || inquiriesView.isSubmitting}
                          className={`flex-1 h-[42px] text-sm font-medium rounded-xl disabled:opacity-50 ${
                            inquiriesView.stagedInquiryAction === 'CONVERT'
                              ? 'bg-slate-900 text-white hover:bg-slate-800'
                              : 'bg-destructive text-white hover:bg-destructive/90'
                          }`}
                        >
                          {inquiriesView.isSubmitting
                            ? 'Saving...'
                            : `Confirm ${inquiriesView.stagedInquiryAction === 'CONVERT' ? 'Approve' : 'Reject'}`}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => { inquiriesView.setDecision(''); setApprovalReason(''); }}
                          className="flex-1 h-[42px] text-sm font-medium border border-card-border text-foreground bg-transparent hover:bg-muted rounded-xl"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
        </div>
        <div className={`flex-1 xl:w-[320px] xl:flex-none flex-col h-full overflow-hidden ${colMobile('quickLogs')} xl:flex`}>
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
      <div className="relative flex-1">
        <select value={month} onChange={(e) => { const m = parseInt(e.target.value); setMonth(m); emit(m, day, year); }} className="w-full appearance-none px-2.5 py-2.5 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border">
          {MONTHS.map((name, i) => <option key={name} value={i}>{name}</option>)}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      </div>
      <div className="relative w-16">
        <select value={Math.min(day, daysInMonth)} onChange={(e) => { const d = parseInt(e.target.value); setDay(d); emit(month, d, year); }} className="w-full appearance-none px-2 py-2.5 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      </div>
      <div className="relative w-20">
        <select value={year} onChange={(e) => { const y = parseInt(e.target.value); setYear(y); emit(month, day, y); }} className="w-full appearance-none px-2 py-2.5 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border">
          {Array.from({ length: 5 }, (_, i) => year - 1 + i).map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
