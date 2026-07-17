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
  Pencil,
  AlertTriangle,
  BadgeCheck,
  X,
  Check,
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
  const [editingSection, setEditingSection] = React.useState<string | null>(null);
  const [guestSnapshot, setGuestSnapshot] = React.useState<Record<string, string>>({});
  const [contactSnapshot, setContactSnapshot] = React.useState<Record<string, string>>({});
  const [appointmentSnapshot, setAppointmentSnapshot] = React.useState<Record<string, string>>({});

  const colMobile = (view: 'list' | 'detail' | 'quickLogs') =>
    mobileView === view ? 'flex' : 'hidden';

  const startEditing = (section: string) => {
    if (section === 'guest') {
      setGuestSnapshot({
        firstName: inquiriesView.guestFirstName,
        middleName: inquiriesView.guestMiddleName,
        lastName: inquiriesView.guestLastName,
        suffix: inquiriesView.guestSuffix,
        note: inquiriesView.stagedInquiryNote,
      });
    } else if (section === 'contact') {
      setContactSnapshot({
        phone: inquiriesView.guestPhone,
        email: inquiriesView.guestEmail,
      });
    } else if (section === 'appointment') {
      setAppointmentSnapshot({
        service: inquiriesView.stagedInquiryService,
        doctor: inquiriesView.stagedInquiryDoctor,
        date: inquiriesView.stagedInquiryDate,
        time: inquiriesView.stagedInquiryTime,
        endTime: inquiriesView.stagedInquiryEndTime,
      });
    }
    setEditingSection(section);
  };

  const cancelEditing = () => {
    if (editingSection === 'guest') {
      inquiriesView.setGuestFirstName(guestSnapshot.firstName || '');
      inquiriesView.setGuestMiddleName(guestSnapshot.middleName || '');
      inquiriesView.setGuestLastName(guestSnapshot.lastName || '');
      inquiriesView.setGuestSuffix(guestSnapshot.suffix || '');
      inquiriesView.setStagedInquiryNote(guestSnapshot.note || '');
    } else if (editingSection === 'contact') {
      inquiriesView.setGuestPhone(contactSnapshot.phone || '');
      inquiriesView.setGuestEmail(contactSnapshot.email || '');
    } else if (editingSection === 'appointment') {
      inquiriesView.selectService(appointmentSnapshot.service || '');
      inquiriesView.selectDoctor(appointmentSnapshot.doctor || '');
      inquiriesView.selectDate(appointmentSnapshot.date || '');
      inquiriesView.setStagedInquiryTime(appointmentSnapshot.time || '');
      inquiriesView.setStagedInquiryEndTime(appointmentSnapshot.endTime || '');
    }
    setEditingSection(null);
  };

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
                <CardHeader className="px-4">
                  <CardTitle className="max-sm:text-sm">Guest Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="guest" className="border-0">
                      <AccordionTrigger className="px-4 py-2 hover:bg-transparent text-sm text-slate-800 font-semibold [&>svg]:text-muted-foreground">
                        {[inquiriesView.guestFirstName, inquiriesView.guestMiddleName, inquiriesView.guestLastName].filter(Boolean).join(' ') || 'Guest'}
                        {inquiriesView.guestSuffix && <span className="text-text-muted font-normal ml-1">({inquiriesView.guestSuffix})</span>}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 space-y-3">
                        {editingSection !== 'guest' ? (
                          <>
                            <div className="flex items-start justify-between gap-4">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1">
                                <div>
                                  <span className="max-sm:text-[10px] text-xs text-text-muted">First name</span>
                                  <p className="max-sm:text-xs text-sm font-semibold text-slate-800">{inquiriesView.guestFirstName || '-'}</p>
                                </div>
                                <div>
                                  <span className="max-sm:text-[10px] text-xs text-text-muted">Middle name</span>
                                  <p className="max-sm:text-xs text-sm font-semibold text-slate-800">{inquiriesView.guestMiddleName || '-'}</p>
                                </div>
                                <div>
                                  <span className="max-sm:text-[10px] text-xs text-text-muted">Last name</span>
                                  <p className="max-sm:text-xs text-sm font-semibold text-slate-800">{inquiriesView.guestLastName || '-'}</p>
                                </div>
                                <div>
                                  <span className="max-sm:text-[10px] text-xs text-text-muted">Suffix</span>
                                  <p className="max-sm:text-xs text-sm font-semibold text-slate-800">{inquiriesView.guestSuffix || '-'}</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => startEditing('guest')} className="shrink-0 bg-white hover:bg-slate-50 text-xs text-slate-700 font-medium px-3 py-1.5 border border-slate-200 rounded-lg h-auto">
                                <Pencil className="size-3.5 mr-1" />
                                Edit
                              </Button>
                            </div>
                            {inquiriesView.stagedInquiryNote && (
                              <div>
                                <span className="max-sm:text-[10px] text-xs text-text-muted">Patient note</span>
                                <p className="max-sm:text-xs text-sm text-slate-700">&ldquo;{inquiriesView.stagedInquiryNote}&rdquo;</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={cancelEditing} className="text-sm text-slate-500 hover:text-slate-700 h-auto px-3 py-1.5">
                                <X className="size-4 mr-1" />
                                Cancel
                              </Button>
                              <Button size="sm" onClick={() => setEditingSection(null)} className="text-sm text-white bg-slate-900 hover:bg-slate-800 rounded-lg h-auto px-4 py-1.5 shadow-sm">
                                <Check className="size-4 mr-1" />
                                Save Changes
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                              <div className="flex flex-col gap-1.5">
                                <span className="max-sm:text-[10px] text-xs text-text-muted">First name</span>
                                <Input value={inquiriesView.guestFirstName} onChange={(e) => inquiriesView.setGuestFirstName(e.target.value)} className="max-sm:text-xs text-sm" />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className="max-sm:text-[10px] text-xs text-text-muted">Middle name</span>
                                <Input value={inquiriesView.guestMiddleName} onChange={(e) => inquiriesView.setGuestMiddleName(e.target.value)} className="max-sm:text-xs text-sm" />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className="max-sm:text-[10px] text-xs text-text-muted">Last name</span>
                                <Input value={inquiriesView.guestLastName} onChange={(e) => inquiriesView.setGuestLastName(e.target.value)} className="max-sm:text-xs text-sm" />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className="max-sm:text-[10px] text-xs text-text-muted">Suffix</span>
                                <Input value={inquiriesView.guestSuffix} onChange={(e) => inquiriesView.setGuestSuffix(e.target.value)} className="max-sm:text-xs text-sm" />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <span className="max-sm:text-[10px] text-xs text-text-muted">Patient note</span>
                              <textarea
                                value={inquiriesView.stagedInquiryNote}
                                onChange={(e) => inquiriesView.setStagedInquiryNote(e.target.value)}
                                rows={2}
                                className="w-full max-sm:text-xs text-sm text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
                                placeholder="Add a note..."
                              />
                            </div>
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="px-4">
                  <CardTitle className="max-sm:text-sm">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="contact" className="border-0">
                      <AccordionTrigger className="px-4 py-2 hover:bg-transparent text-sm text-slate-800 font-semibold [&>svg]:text-muted-foreground">
                        {inquiriesView.guestEmail || 'No email'}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 space-y-3">
                        {editingSection !== 'contact' ? (
                          <div className="flex items-start justify-between gap-4">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1">
                              <div>
                                <span className="max-sm:text-[10px] text-xs text-text-muted">Email address</span>
                                <p className="max-sm:text-xs text-sm font-semibold text-slate-800 truncate">{inquiriesView.guestEmail || '-'}</p>
                              </div>
                              <div>
                                <span className="max-sm:text-[10px] text-xs text-text-muted">Phone</span>
                                <p className="max-sm:text-xs text-sm font-semibold text-slate-800">{inquiriesView.guestPhone || '-'}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => startEditing('contact')} className="shrink-0 bg-white hover:bg-slate-50 text-xs text-slate-700 font-medium px-3 py-1.5 border border-slate-200 rounded-lg h-auto">
                              <Pencil className="size-3.5 mr-1" />
                              Edit
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={cancelEditing} className="text-sm text-slate-500 hover:text-slate-700 h-auto px-3 py-1.5">
                                <X className="size-4 mr-1" />
                                Cancel
                              </Button>
                              <Button size="sm" onClick={() => setEditingSection(null)} className="text-sm text-white bg-slate-900 hover:bg-slate-800 rounded-lg h-auto px-4 py-1.5 shadow-sm">
                                <Check className="size-4 mr-1" />
                                Save Changes
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                              <div className="flex flex-col gap-1.5">
                                <span className="max-sm:text-[10px] text-xs text-text-muted">Email address</span>
                                <Input type="email" value={inquiriesView.guestEmail} onChange={(e) => inquiriesView.setGuestEmail(e.target.value)} className="max-sm:text-xs text-sm" />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className="max-sm:text-[10px] text-xs text-text-muted">Phone</span>
                                <Input value={inquiriesView.guestPhone} onChange={(e) => inquiriesView.setGuestPhone(e.target.value)} className="max-sm:text-xs text-sm" />
                              </div>
                            </div>
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="px-4">
                  <CardTitle className="max-sm:text-sm">Appointment Details</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="appointment" className="border-0">
                      <AccordionTrigger className="px-4 py-2 hover:bg-transparent text-sm text-slate-800 font-semibold [&>svg]:text-muted-foreground">
                        {getServiceName(inquiriesView.services, inquiriesView.stagedInquiryService)}
                        {inquiriesView.stagedInquiryDate && <span className="text-text-muted font-normal ml-1">&bull; {new Date(inquiriesView.stagedInquiryDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 space-y-3">
                        {editingSection !== 'appointment' ? (
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <div>
                                  <span className="max-sm:text-[10px] text-xs text-text-muted">Treatment / Service <span className="text-destructive">*</span></span>
                                  <p className="max-sm:text-xs text-sm font-semibold text-slate-800">{getServiceName(inquiriesView.services, inquiriesView.stagedInquiryService)}</p>
                                </div>
                                <div>
                                  <span className="max-sm:text-[10px] text-xs text-text-muted">Assigned dentist <span className="text-destructive">*</span></span>
                                  <p className="max-sm:text-xs text-sm font-semibold text-slate-800">{inquiriesView.stagedInquiryDoctor ? inquiriesView.availableDoctors.find((d) => d.doctorId === inquiriesView.stagedInquiryDoctor)?.doctorName || 'Unknown' : '-'}</p>
                                </div>
                                <div>
                                  <span className="max-sm:text-[10px] text-xs text-text-muted">Date <span className="text-destructive">*</span></span>
                                  <p className="max-sm:text-xs text-sm font-semibold text-slate-800">{inquiriesView.stagedInquiryDate ? new Date(inquiriesView.stagedInquiryDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}</p>
                                </div>
                                <div>
                                  <span className="max-sm:text-[10px] text-xs text-text-muted">Time <span className="text-destructive">*</span></span>
                                  <p className="max-sm:text-xs text-sm font-semibold text-slate-800">{formatTo12h(inquiriesView.stagedInquiryTime)}{inquiriesView.stagedInquiryEndTime ? ` - ${formatTo12h(inquiriesView.stagedInquiryEndTime)}` : ''}</p>
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => startEditing('appointment')} className="shrink-0 bg-white hover:bg-slate-50 text-xs text-slate-700 font-medium px-3 py-1.5 border border-slate-200 rounded-lg h-auto">
                              <Pencil className="size-3.5 mr-1" />
                              Edit Details
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={cancelEditing} className="text-sm text-slate-500 hover:text-slate-700 h-auto px-3 py-1.5">
                                <X className="size-4 mr-1" />
                                Cancel
                              </Button>
                              <Button size="sm" onClick={() => setEditingSection(null)} className="text-sm text-white bg-slate-900 hover:bg-slate-800 rounded-lg h-auto px-4 py-1.5 shadow-sm">
                                <Check className="size-4 mr-1" />
                                Save Changes
                              </Button>
                            </div>
                            <div className="flex flex-col gap-3">
                              <div className="flex flex-col gap-1.5">
                                <span className="max-sm:text-[10px] text-xs text-text-muted">Procedure / Service <span className="text-destructive">*</span></span>
                                {inquiriesView.selectedInquiry?.preferredServiceName && (
                                  <p className="max-sm:text-[10px] text-xs text-text-muted">Preference: {inquiriesView.selectedInquiry.preferredServiceName}</p>
                                )}
                                <Select
                                  value={inquiriesView.stagedInquiryService}
                                  onChange={(e) => inquiriesView.selectService(e.target.value)}
                                  options={[
                                    { value: '', label: 'Select service...' },
                                    ...inquiriesView.services.map((s) => ({ value: s.id, label: s.name }))
                                  ]}
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className="max-sm:text-[10px] text-xs text-text-muted">Assigned doctor <span className="text-destructive">*</span></span>
                                <Select
                                  value={inquiriesView.stagedInquiryDoctor}
                                  onChange={(e) => inquiriesView.selectDoctor(e.target.value)}
                                  options={[
                                    { value: '', label: 'Select doctor...' },
                                    ...inquiriesView.availableDoctors.map((d) => ({ value: d.doctorId, label: d.doctorName }))
                                  ]}
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className="max-sm:text-[10px] text-xs text-text-muted">Appointment date <span className="text-destructive">*</span></span>
                                {inquiriesView.selectedInquiry?.preferredDate && (
                                  <p className="max-sm:text-[10px] text-xs text-text-muted">Preference: {new Date(inquiriesView.selectedInquiry.preferredDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                )}
                                <DatePicker value={inquiriesView.stagedInquiryDate} onChange={(v) => inquiriesView.selectDate(v)} />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className="max-sm:text-[10px] text-xs text-text-muted">Time / Window <span className="text-destructive">*</span></span>
                                {inquiriesView.selectedInquiry?.preferredStartTime && (
                                  <p className="max-sm:text-[10px] text-xs text-text-muted">Preference: {formatTo12h(inquiriesView.selectedInquiry.preferredStartTime)}</p>
                                )}
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="time"
                                    value={normalizeTo24h(inquiriesView.stagedInquiryTime)}
                                    onChange={(e) => inquiriesView.setStagedInquiryTime(e.target.value)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border bg-card max-sm:text-xs text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-ring transition-all border-card-border focus:border-primary-start/50"
                                  />
                                  <span className="text-text-muted">to</span>
                                  <input
                                    type="time"
                                    value={inquiriesView.stagedInquiryEndTime}
                                    onChange={(e) => inquiriesView.setStagedInquiryEndTime(e.target.value)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border bg-card max-sm:text-xs text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-ring transition-all border-card-border focus:border-primary-start/50"
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}
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
