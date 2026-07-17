'use client';

import React from 'react';
import { useSecretaryInquiriesQueue } from '../../hooks/secretary/use-secretary-inquiries-queue';
import { PendingRequestListV2 } from './sub-components/pending-request-list-v2';
import { CoordinationHub } from './sub-components/coordination-hub';
import { Input } from '@/components/ui/input';
import { InquiryToast } from './sub-components/inquiry-toast';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  ClipboardList,
  AlertTriangle,
  BadgeCheck,
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

  const colMobile = (view: 'list' | 'detail' | 'quickLogs') =>
    mobileView === view ? 'flex' : 'hidden';

  const isMissingDoctor = !inquiriesView.stagedInquiryDoctor;
  const isMissingTime = !inquiriesView.stagedInquiryTime || !inquiriesView.stagedInquiryEndTime;
  const isLocked = isMissingDoctor || isMissingTime;
  const hasSelection = !!inquiriesView.selectedInquiry;

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className={`lg:w-[350px] flex-1 lg:flex-none flex-col border-r border-card-border/40 bg-sidebar h-full overflow-hidden ${colMobile('list')} lg:flex`}>
        <PendingRequestListV2
          inquiries={inquiriesView.inquiries}
          selectedInquiryId={inquiriesView.selectedInquiryId}
          isLoadingInquiries={inquiriesView.isLoadingInquiries}
          onSelectInquiry={(inq) => { inquiriesView.selectInquiry(inq); setMobileView('detail'); }}
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
        <div className="flex-1 !overflow-y-auto max-sm:p-3 p-6 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
          style={{ scrollbarWidth: 'thin' }}
          data-lenis-prevent
        >
              {inquiriesView.inlineError && (
                <div className="text-xs font-bold text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                  Error: {inquiriesView.inlineError}
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="max-sm:text-sm">Guest Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="multiple">
                    <AccordionItem value="first-name">
                      <AccordionTrigger>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="max-sm:text-xs text-xs text-text-muted">First name</span>
                          <span className="max-sm:text-xs text-sm font-semibold text-slate-800">{inquiriesView.guestFirstName || '-'}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Input value={inquiriesView.guestFirstName} onChange={(e) => inquiriesView.setGuestFirstName(e.target.value)} className="max-sm:text-xs text-sm" />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="middle-name">
                      <AccordionTrigger>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="max-sm:text-xs text-xs text-text-muted">Middle name</span>
                          <span className="max-sm:text-xs text-sm font-semibold text-slate-800">{inquiriesView.guestMiddleName || '-'}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Input value={inquiriesView.guestMiddleName} onChange={(e) => inquiriesView.setGuestMiddleName(e.target.value)} className="max-sm:text-xs text-sm" />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="last-name">
                      <AccordionTrigger>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="max-sm:text-xs text-xs text-text-muted">Last name</span>
                          <span className="max-sm:text-xs text-sm font-semibold text-slate-800">{inquiriesView.guestLastName || '-'}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Input value={inquiriesView.guestLastName} onChange={(e) => inquiriesView.setGuestLastName(e.target.value)} className="max-sm:text-xs text-sm" />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="suffix">
                      <AccordionTrigger>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="max-sm:text-xs text-xs text-text-muted">Suffix</span>
                          <span className="max-sm:text-xs text-sm font-semibold text-slate-800">{inquiriesView.guestSuffix || '-'}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Input value={inquiriesView.guestSuffix} onChange={(e) => inquiriesView.setGuestSuffix(e.target.value)} className="max-sm:text-xs text-sm" />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="patient-note">
                      <AccordionTrigger>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="max-sm:text-xs text-xs text-text-muted">Patient note</span>
                          <span className="max-sm:text-xs text-sm text-slate-700">{inquiriesView.stagedInquiryNote ? `"${inquiriesView.stagedInquiryNote}"` : '-'}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <textarea
                          value={inquiriesView.stagedInquiryNote}
                          onChange={(e) => inquiriesView.setStagedInquiryNote(e.target.value)}
                          rows={2}
                          className="w-full max-sm:text-xs text-sm text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
                          placeholder="Add a note..."
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="max-sm:text-sm">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="multiple">
                    <AccordionItem value="email">
                      <AccordionTrigger>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="max-sm:text-xs text-xs text-text-muted">Email address</span>
                          <span className="max-sm:text-xs text-sm font-semibold text-slate-800 truncate">{inquiriesView.guestEmail || '-'}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Input type="email" value={inquiriesView.guestEmail} onChange={(e) => inquiriesView.setGuestEmail(e.target.value)} className="max-sm:text-xs text-sm" />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="phone">
                      <AccordionTrigger>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="max-sm:text-xs text-xs text-text-muted">Phone</span>
                          <span className="max-sm:text-xs text-sm font-semibold text-slate-800">{inquiriesView.guestPhone || '-'}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Input value={inquiriesView.guestPhone} onChange={(e) => inquiriesView.setGuestPhone(e.target.value)} className="max-sm:text-xs text-sm" />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="max-sm:text-sm">Appointment Details</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="multiple">
                    <AccordionItem value="service">
                      <AccordionTrigger>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="max-sm:text-xs text-xs text-text-muted">Treatment / Service <span className="text-destructive">*</span></span>
                          <span className="max-sm:text-xs text-sm font-semibold text-slate-800">{getServiceName(inquiriesView.services, inquiriesView.stagedInquiryService)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {inquiriesView.selectedInquiry?.preferredServiceName && (
                          <p className="max-sm:text-[10px] text-xs text-text-muted mb-2">Preference: {inquiriesView.selectedInquiry.preferredServiceName}</p>
                        )}
                        <Select
                          value={inquiriesView.stagedInquiryService}
                          onChange={(e) => inquiriesView.selectService(e.target.value)}
                          options={[
                            { value: '', label: 'Select service...' },
                            ...inquiriesView.services.map((s) => ({ value: s.id, label: s.name }))
                          ]}
                        />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="date">
                      <AccordionTrigger>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="max-sm:text-xs text-xs text-text-muted">Date <span className="text-destructive">*</span></span>
                          <span className="max-sm:text-xs text-sm font-semibold text-slate-800">{inquiriesView.stagedInquiryDate ? new Date(inquiriesView.stagedInquiryDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {inquiriesView.selectedInquiry?.preferredDate && (
                          <p className="max-sm:text-[10px] text-xs text-text-muted mb-2">Preference: {new Date(inquiriesView.selectedInquiry.preferredDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        )}
                        <DatePicker value={inquiriesView.stagedInquiryDate} onChange={(v) => inquiriesView.selectDate(v)} />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="dentist">
                      <AccordionTrigger>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="max-sm:text-xs text-xs text-text-muted">Assign dentist <span className="text-destructive">*</span></span>
                          <span className="max-sm:text-xs text-sm font-semibold text-slate-800">{inquiriesView.stagedInquiryDoctor ? inquiriesView.availableDoctors.find((d) => d.doctorId === inquiriesView.stagedInquiryDoctor)?.doctorName || 'Unknown' : '-'}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Select
                          value={inquiriesView.stagedInquiryDoctor}
                          onChange={(e) => inquiriesView.selectDoctor(e.target.value)}
                          options={[
                            { value: '', label: 'Select doctor...' },
                            ...inquiriesView.availableDoctors.map((d) => ({ value: d.doctorId, label: d.doctorName }))
                          ]}
                        />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="start-time">
                      <AccordionTrigger>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="max-sm:text-xs text-xs text-text-muted">Start time <span className="text-destructive">*</span></span>
                          <span className="max-sm:text-xs text-sm font-semibold text-slate-800">{formatTo12h(inquiriesView.stagedInquiryTime)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {inquiriesView.selectedInquiry?.preferredStartTime && (
                          <p className="max-sm:text-[10px] text-xs text-text-muted mb-2">Preference: {formatTo12h(inquiriesView.selectedInquiry.preferredStartTime)}</p>
                        )}
                        <input
                          type="time"
                          value={normalizeTo24h(inquiriesView.stagedInquiryTime)}
                          onChange={(e) => inquiriesView.setStagedInquiryTime(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border bg-card max-sm:text-xs text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-ring transition-all border-card-border focus:border-primary-start/50"
                        />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="end-time">
                      <AccordionTrigger>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="max-sm:text-xs text-xs text-text-muted">End time <span className="text-destructive">*</span></span>
                          <span className="max-sm:text-xs text-sm font-semibold text-slate-800">{formatTo12h(inquiriesView.stagedInquiryEndTime)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <input
                          type="time"
                          value={inquiriesView.stagedInquiryEndTime}
                          onChange={(e) => inquiriesView.setStagedInquiryEndTime(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border bg-card max-sm:text-xs text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-ring transition-all border-card-border focus:border-primary-start/50"
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {inquiriesView.selectedInquiry?.status === 'NEW' && (
                <div className={`flex items-start gap-3 max-sm:px-4 max-sm:py-3 px-5 py-4 rounded-xl border ${isLocked ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20' : 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'}`}>
                  {isLocked
                    ? <AlertTriangle className="max-sm:size-4 size-5 text-amber-500 shrink-0 mt-0.5" />
                    : <BadgeCheck className="max-sm:size-4 size-5 text-emerald-500 shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className="max-sm:text-xs text-sm font-semibold text-text-primary">
                      {isLocked ? 'Action required' : 'Ready for approval'}
                    </p>
                    <p className="max-sm:text-[10px] text-xs text-text-muted mt-0.5">
                      {isLocked
                        ? 'Fill in the required fields to enable the approval action.'
                        : 'All required fields are set. You can now approve this booking.'
                      }
                    </p>
                  </div>
                </div>
              )}

              {inquiriesView.selectedInquiry?.status === 'NEW' && !inquiriesView.stagedInquiryAction && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 max-sm:py-2 py-3 max-sm:text-xs text-sm font-semibold"
                    onClick={() => { inquiriesView.setDecision('DROP'); setApprovalReason(''); }}
                  >
                    Drop / Reject
                  </Button>
                  <Button
                    disabled={isLocked}
                    size="sm"
                    className="flex-1 max-sm:py-2 py-3 max-sm:text-xs text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                    onClick={() => { inquiriesView.setDecision('CONVERT'); setApprovalReason(''); }}
                  >
                    Convert / Approve
                  </Button>
                </div>
              )}

              {inquiriesView.selectedInquiry?.status === 'NEW' && !!inquiriesView.stagedInquiryAction && (
                <Card>
                  <CardContent className="flex flex-col gap-4 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="max-sm:text-xs text-sm font-semibold flex items-center gap-2">
                        {inquiriesView.stagedInquiryAction === 'CONVERT' ? 'Convert note (Approve)' : 'Drop reason (Reject)'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { inquiriesView.setDecision(''); setApprovalReason(''); }}
                      >
                        Cancel
                      </Button>
                    </div>
                    {inquiriesView.stagedInquiryAction === 'CONVERT' ? (
                      <div className="flex flex-col gap-3">
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
                          className="w-full px-4 py-2.5 rounded-xl border bg-card max-sm:text-xs text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-ring transition-all border-card-border focus:border-primary-start/50"
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
                            placeholder="Enter custom reason (required)..."
                            rows={2}
                          className="w-full max-sm:text-xs text-sm border border-card-border rounded-xl px-4 py-2.5 bg-card text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary-ring transition-all"
                        />
                        )}
                      </div>
                    ) : (
                      <textarea
                        value={inquiriesView.stagedInquiryNote}
                        onChange={(e) => inquiriesView.setStagedInquiryNote(e.target.value)}
                        placeholder="Reason for rejection (required)..."
                        rows={3}
                        className="w-full max-sm:text-xs text-sm border border-card-border rounded-xl px-4 py-2.5 bg-card text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary-ring transition-all"
                      />
                    )}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 py-3"
                        onClick={() => { inquiriesView.setDecision(''); setApprovalReason(''); }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => inquiriesView.submitReview(inquiriesView.selectedInquiry.id)}
                        disabled={!inquiriesView.canSubmit}
                        variant={inquiriesView.stagedInquiryAction === 'CONVERT' ? 'primary' : 'destructive'}
                        size="sm"
                        className={`flex-1 py-3 ${inquiriesView.stagedInquiryAction === 'CONVERT' ? '!bg-slate-900 !from-slate-900 !to-slate-800 hover:!from-slate-800 hover:!to-slate-700 shadow-sm' : ''}`}
                      >
                        {inquiriesView.isSubmitting
                          ? 'Saving...'
                          : `Confirm ${inquiriesView.stagedInquiryAction === 'CONVERT' ? 'convert / approve' : 'drop / reject'}`
                        }
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

          </div>
        </div>
        <div className={`lg:w-[320px] flex-1 lg:flex-none flex-col h-full overflow-hidden ${colMobile('quickLogs')} lg:flex`}>
          <CoordinationHub inquiryId={inquiriesView.selectedInquiryId} hideActions={inquiriesView.selectedInquiry?.status !== 'NEW'} onBack={() => setMobileView('detail')} />
        </div>
      </>
    ) : (
      <div className="flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/10 space-y-2 max-lg:hidden flex">
        <ClipboardList className="size-12 text-muted-foreground/40" />
        <p className="text-sm font-medium">Select an inquiry from the left list to view details and process the request.</p>
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
      <select value={month} onChange={(e) => { const m = parseInt(e.target.value); setMonth(m); emit(m, day, year); }} className="flex-1 px-3 py-2.5 rounded-xl border bg-card max-sm:text-xs text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-ring transition-all border-card-border focus:border-primary-start/50">
        {MONTHS.map((name, i) => <option key={name} value={i}>{name}</option>)}
      </select>
      <select value={Math.min(day, daysInMonth)} onChange={(e) => { const d = parseInt(e.target.value); setDay(d); emit(month, d, year); }} className="w-20 px-3 py-2.5 rounded-xl border bg-card max-sm:text-xs text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-ring transition-all border-card-border focus:border-primary-start/50">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <select value={year} onChange={(e) => { const y = parseInt(e.target.value); setYear(y); emit(month, day, y); }} className="w-24 px-3 py-2.5 rounded-xl border bg-card max-sm:text-xs text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-ring transition-all border-card-border focus:border-primary-start/50">
        {Array.from({ length: 5 }, (_, i) => year - 1 + i).map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}
