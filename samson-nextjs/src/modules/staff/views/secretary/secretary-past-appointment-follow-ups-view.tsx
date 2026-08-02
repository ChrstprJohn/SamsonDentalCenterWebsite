'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { AlertCircle, ArrowLeft, ClipboardCheck, UserRound, X, Pencil, Check } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';
import { SidebarHeader, SidebarInput, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { formatClinicTime, formatShortDate } from '@/shared/utils/date.util';
import type { AppointmentDto } from '@/modules/appointments/dtos/exports';
import { usePastAppointmentFollowUps } from '../../hooks/secretary/use-past-appointment-follow-ups';
import { AppointmentRescheduleForm } from './sub-components/appointment-reschedule-form';

function patientName(appointment: AppointmentDto) {
  if (appointment.dependent) return `${appointment.dependent.firstName} ${appointment.dependent.lastName}`;
  if (appointment.patient) return `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  if (appointment.guestContact) return `${appointment.guestContact.firstName || ''} ${appointment.guestContact.lastName || ''}`.trim() || 'Guest Patient';
  return 'Guest Patient';
}

function daysWaiting(date: string) {
  const start = new Date(`${date}T00:00:00`);
  const now = new Date();
  const days = Math.max(1, Math.floor((now.getTime() - start.getTime()) / 86_400_000));
  return `${days} day${days === 1 ? '' : 's'} waiting`;
}

export function SecretaryPastAppointmentFollowUpsView() {
  const view = usePastAppointmentFollowUps();
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const visibleAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return view.list;
    return view.list.filter((appointment) =>
      [patientName(appointment), appointment.service?.name, appointment.doctor ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : '']
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [search, view.list]);

  const colMobile = (mode: 'list' | 'detail') => mobileView === mode ? 'flex' : 'hidden';

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden">
      <section className={`lg:w-[350px] flex-1 lg:flex-none flex-col border-r border-card-border/40 bg-sidebar min-h-0 overflow-hidden ${colMobile('list')} lg:flex`}>
        <SidebarHeader className="gap-3.5 border-b p-4 shrink-0">
          <div className="flex w-full h-8 items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="lg:hidden -ml-1 text-muted-foreground hover:text-foreground" />
              <div className="text-base font-medium text-foreground">
                Past Follow-ups
              </div>
            </div>
          </div>
          <div className="px-1">
            <SidebarInput
              placeholder="Type to search..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="rounded-md"
            />
          </div>
          <div className="flex gap-1 bg-muted/20 p-1 rounded-lg">
            <Button
              onClick={() => view.selectTab('missed-checkouts')}
              variant="ghost"
              size="sm"
              className={`flex-1 h-8 text-xs font-semibold rounded-xl transition-all ${
                view.activeTab === 'missed-checkouts'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Checkouts ({view.missedCheckouts.length})
            </Button>
            <Button
              onClick={() => view.selectTab('no-show-follow-ups')}
              variant="ghost"
              size="sm"
              className={`flex-1 h-8 text-xs font-semibold rounded-xl transition-all ${
                view.activeTab === 'no-show-follow-ups'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              No-shows ({view.unresolvedNoShows.length})
            </Button>
          </div>
        </SidebarHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {view.isLoading ? <div className="p-6 text-center text-sm text-muted-foreground">Loading follow-ups…</div> : null}
          {view.error ? <div className="m-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{view.error}</div> : null}
          {!view.isLoading && !view.error && visibleAppointments.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Nothing needs follow-up in this section.</div>
          ) : visibleAppointments.map((appointment) => (
            <button key={appointment.id} onClick={() => { view.setSelectedAppointmentId(appointment.id); setMobileView('detail'); }} className={`flex w-full flex-col gap-2 border-b border-card-border/40 p-4 text-left transition-colors hover:bg-sidebar-accent ${view.selectedAppointmentId === appointment.id ? 'bg-sidebar-accent' : ''}`}>
              <div className="flex items-center gap-2"><span className="font-medium text-sm truncate">{patientName(appointment)}</span><span className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold ${appointment.status === 'CHECKED_IN' ? 'bg-cyan-500/10 text-cyan-700' : 'bg-amber-500/10 text-amber-700'}`}>{appointment.status === 'CHECKED_IN' ? 'CHECKED IN' : 'NO SHOW'}</span></div>
              <span className="text-xs font-medium">{appointment.service?.name || 'Treatment'}</span>
              <div className="flex justify-between gap-2 text-[11px] text-muted-foreground"><span>{formatShortDate(appointment.date)}</span><span>{daysWaiting(appointment.date)}</span></div>
            </button>
          ))}
        </div>
      </section>

      {view.selectedAppointment ? <FollowUpDetail appointment={view.selectedAppointment} view={view} onBack={() => setMobileView('list')} className={`${colMobile('detail')} lg:flex`} /> : (
        <div className="flex flex-1 flex-col items-center justify-center bg-muted/10 text-center max-lg:hidden"><ClipboardCheck className="size-8 text-muted-foreground/50 mb-3" /><p className="font-medium">No appointment selected</p><p className="mt-1 text-sm text-muted-foreground">Select a past appointment to finish its follow-up.</p></div>
      )}
      
    </div>
  );
}

function getPatientFirstName(app: any): string {
  return app?.guestContact?.firstName || app?.dependent?.firstName || app?.patient?.firstName || '-';
}
function getPatientLastName(app: any): string {
  return app?.guestContact?.lastName || app?.dependent?.lastName || app?.patient?.lastName || '-';
}
function getPatientEmail(app: any): string {
  return app?.guestContact?.email || app?.patient?.email || '-';
}
function getPatientPhone(app: any): string {
  return app?.guestContact?.phone || app?.guestContact?.phone_number || app?.guestContact?.phoneNumber || app?.patient?.phoneNumber || '-';
}
function Field({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-col gap-0.5"><span className="text-xs text-muted-foreground">{label}</span><div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{value}</div></div>;
}

function FollowUpDetail({ appointment, view, onBack, className }: { appointment: AppointmentDto; view: ReturnType<typeof usePastAppointmentFollowUps>; onBack: () => void; className: string }) {
  const isMissedCheckout = appointment.status === 'CHECKED_IN';
  const [showLateCheckout, setShowLateCheckout] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [resolveMode, setResolveMode] = useState<'COMPLETED' | 'CONFIRMED_NO_SHOW'>('COMPLETED');
  const [resolveReason, setResolveReason] = useState('');
  const [showCustomReason, setShowCustomReason] = useState(false);
  const resolveReasonOptions: Record<string, string[]> = {
    COMPLETED: ['Secretary forgot to click check-in', 'Patient was seen but not checked in', 'Administrative oversight'],
    CONFIRMED_NO_SHOW: ['Patient failed to arrive for appointment', 'Patient arrived after closing', 'Patient refused treatment'],
  };
  const [selectedPreset, setSelectedPreset] = useState('');

  const initialChannel = (appointment.confirmationChannel || 'EMAIL') as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE';
  const [channel, setChannel] = useState(initialChannel);
  const [draftChannel, setDraftChannel] = useState(initialChannel);
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [isSavingChannel, setIsSavingChannel] = useState(false);
  const prevId = useRef(appointment.id);

  const resetResolveState = () => {
    setShowResolveForm(false);
    setShowRescheduleForm(false);
    setResolveMode('COMPLETED');
    setResolveReason('');
    setShowCustomReason(false);
    setSelectedPreset('');
  };

  useEffect(() => {
    if (appointment.id !== prevId.current) {
      prevId.current = appointment.id;
      setShowLateCheckout(false);
      resetResolveState();
      const ch = (appointment.confirmationChannel || 'EMAIL') as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE';
      setChannel(ch);
      setDraftChannel(ch);
      setIsEditingChannel(false);
    }
  }, [appointment.id, appointment.confirmationChannel]);

  const handleSaveChannel = async () => {
    setIsSavingChannel(true);
    const res = await updateConfirmationChannelAction({ appointmentId: appointment.id, confirmationChannel: draftChannel });
    if (res.success) { setChannel(draftChannel); setIsEditingChannel(false); }
    setIsSavingChannel(false);
  };

  const handleResolveSubmit = async () => {
    if (!resolveReason.trim()) return;
    if (draftChannel !== channel) await handleSaveChannel();
    view.handleResolveNoShowSubmit({ appointmentId: appointment.id, resolution: resolveMode, reason: resolveReason.trim() });
    resetResolveState();
  };

  const handleRescheduleSubmit = () => {
    const fmt = (ds: string, ts: string) => `${ds}T${ts.length === 5 ? ts + ':00' : ts}Z`;
    view.handleResolveNoShowSubmit({
      appointmentId: appointment.id,
      resolution: 'RESCHEDULE',
      reason: view.rescheduleJustification || 'Rescheduled from past no-show follow-up',
      newDate: view.rescheduleDate || appointment.date,
      newStartTime: view.rescheduleTime ? fmt(appointment.date, view.rescheduleTime) : undefined,
      newEndTime: view.rescheduleEndTime ? fmt(appointment.date, view.rescheduleEndTime) : undefined,
      newDoctorId: view.rescheduleDoctor || appointment.doctorId || undefined,
    });
  };

  const displayName = patientName(appointment);
  const pTitle = showRescheduleForm ? 'Reschedule Appointment' : (isMissedCheckout ? 'Late Checkout' : 'No-Show Follow-up');
  const pSub = showRescheduleForm ? 'Update date, time, dentist, or service details.' : `${displayName} — ${appointment.service?.name || 'Treatment'}`;
  const statusStr = isMissedCheckout ? 'CHECKED IN' : 'NO SHOW';
  const statusColor = isMissedCheckout ? 'text-cyan-600 bg-cyan-500/10' : 'text-amber-600 bg-amber-500/10';

  const showingBodyForm = isMissedCheckout ? showLateCheckout : (showResolveForm || showRescheduleForm);

  return (
    <section className={`flex flex-1 min-w-0 flex-col min-h-0 ${className}`}>
      <div className="flex items-center gap-2 p-4 border-b border-border shrink-0">
        <button onClick={showRescheduleForm ? () => setShowRescheduleForm(false) : onBack} className="p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0"><ArrowLeft className="size-4" /></button>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="text-base font-medium text-foreground truncate">{pTitle}</span>
          <span className="text-xs text-muted-foreground truncate">{pSub}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
        {!showRescheduleForm ? (
          <>
            <div className="flex flex-col items-center pt-4 pb-3 px-4">
              <div className="size-12 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border-2 border-border/60 overflow-hidden mb-3">
                <UserRound className="size-10 text-muted-foreground/70 translate-y-0.5" />
              </div>
              <h2 className="text-base font-semibold text-foreground text-center">{displayName}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{appointment.guestContact ? 'Guest' : 'Patient'}</p>
            </div>
            <hr className="border-card-border/40 mx-4" />
            <div className="flex items-center justify-between py-3 px-4">
              <span className="text-sm font-medium text-foreground">Current Status</span>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor}`}>{statusStr}</span>
            </div>
            <hr className="border-card-border/40 mx-4" />
            <div className="px-4 py-4 space-y-4">
              <div>
                <span className="text-sm font-medium text-foreground block mb-3">Guest Information</span>
                <div className="flex flex-col gap-2">
                  <Field label="First Name" value={getPatientFirstName(appointment)} />
                  <Field label="Last Name" value={getPatientLastName(appointment)} />
                </div>
              </div>
              <hr className="border-card-border/40" />
              <div>
                <span className="text-sm font-medium text-foreground block mb-3">Guest Contact</span>
                <div className="flex flex-col gap-2">
                  <Field label="Email" value={getPatientEmail(appointment)} />
                  <Field label="Phone" value={getPatientPhone(appointment)} />
                </div>
              </div>
              <hr className="border-card-border/40" />
              <div>
                <span className="text-sm font-medium text-foreground block mb-3">Service & Schedule</span>
                <div className="flex flex-col gap-2">
                  <Field label="Service" value={appointment.service?.name || 'Procedure'} />
                  <Field label="Date" value={appointment.date ? formatShortDate(appointment.date) : '-'} />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Start Time" value={appointment.startTime ? formatClinicTime(appointment.startTime) : '-'} />
                    <Field label="End Time" value={appointment.endTime ? formatClinicTime(appointment.endTime) : '-'} />
                  </div>
                  <Field label="Assign Dentist" value={`Dr. ${appointment.doctor?.firstName || ''} ${appointment.doctor?.lastName || ''}`} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4">
            <AppointmentRescheduleForm
              appointment={appointment as any}
              services={view.servicesList}
              serviceId={appointment.serviceId}
              doctorId={view.rescheduleDoctor || appointment.doctorId || ''}
              doctors={view.doctorsList.map((d: any) => ({ doctorId: d.id, doctorName: `${d.prefix || 'Dr.'} ${d.firstName} ${d.lastName}` }))}
              date={view.rescheduleDate || appointment.date}
              activeServiceId={appointment.serviceId}
              activeDoctorId={appointment.doctorId || ''}
              startTime={view.rescheduleTime || ''}
              endTime={view.rescheduleEndTime || ''}
              justification={view.rescheduleJustification || ''}
              confirmationChannel={appointment.confirmationChannel || 'EMAIL'}
              onConfirmationChannelChange={() => {}}
              isSubmitting={view.isPending}
              noFooter
              onServiceSelect={() => {}}
              onDoctorSelect={(docId: string) => view.setRescheduleDoctor(docId)}
              onDateSelect={(d: string) => view.setRescheduleDate(d)}
              onStartTimeChange={(t: string) => view.setRescheduleTime(t)}
              onEndTimeChange={(t: string) => view.setRescheduleEndTime(t)}
              onJustificationChange={(j: string) => view.setRescheduleJustification(j)}
              onSubmit={handleRescheduleSubmit}
              onBack={() => setShowRescheduleForm(false)}
            />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-4 py-3">
        {showRescheduleForm ? (
          <div className="flex gap-2">
            <button onClick={handleRescheduleSubmit} disabled={view.isPending} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40">
              {view.isPending ? 'Saving...' : 'Confirm'}
            </button>
            <button onClick={() => setShowRescheduleForm(false)} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">
              Cancel
            </button>
          </div>
        ) : isMissedCheckout && showLateCheckout ? (
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Notification Channel</span>
                {!isEditingChannel ? (
                  <button onClick={() => setIsEditingChannel(true)} className="h-7 px-2.5 text-xs gap-1 inline-flex items-center justify-center rounded-md border border-input bg-background text-foreground hover:bg-accent"><Pencil className="size-3.5" /> Edit</button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setDraftChannel(channel); setIsEditingChannel(false); }} className="h-7 px-2.5 text-xs gap-1 inline-flex items-center justify-center rounded-md border border-input bg-background text-foreground hover:bg-accent"><X className="size-3.5" /> Cancel</button>
                    <button onClick={handleSaveChannel} disabled={isSavingChannel || draftChannel === channel} className="h-7 px-2.5 text-xs gap-1 inline-flex items-center justify-center rounded-md bg-slate-900 text-white disabled:opacity-40"><Check className="size-3.5" /> {isSavingChannel ? 'Saving...' : 'Save'}</button>
                  </div>
                )}
              </div>
              {isEditingChannel ? (
                <Select value={draftChannel} onChange={(e) => setDraftChannel(e.target.value as any)} className="text-sm w-full" options={[{ value: 'EMAIL', label: 'Email' }, { value: 'SMS', label: 'SMS' }, { value: 'BOTH', label: 'Email & SMS' }, { value: 'NONE', label: 'None' }]} />
              ) : (
                <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{channel === 'EMAIL' ? 'Email' : channel === 'SMS' ? 'SMS' : channel === 'BOTH' ? 'Email & SMS' : 'None'}</div>
              )}
            </div>
            <div className="p-4 border bg-amber-500/5 border-amber-500/20 rounded-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Automated Communication</span>
              <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Confirming will complete the visit and send a Thank You & Review Request message via the selected channel.</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowLateCheckout(false)} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">Cancel</button>
              <button onClick={() => { void view.completeMissedCheckout(appointment.id); }} disabled={view.isPending} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40">{view.isPending ? 'Checking out...' : 'Confirm Late Checkout'}</button>
            </div>
          </div>
        ) : isMissedCheckout ? (
          <button onClick={() => setShowLateCheckout(true)} className="w-full h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl">Late Checkout</button>
        ) : showResolveForm ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setResolveMode('CONFIRMED_NO_SHOW'); setSelectedPreset(''); setResolveReason(''); setShowCustomReason(false); }}
                className={`p-2 border text-[10px] font-medium transition-all ${resolveMode === 'CONFIRMED_NO_SHOW' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'}`}>Keep No-Show</button>
              <button onClick={() => { setResolveMode('COMPLETED'); setSelectedPreset(''); setResolveReason(''); setShowCustomReason(false); }}
                className={`p-2 border text-[10px] font-medium transition-all ${resolveMode === 'COMPLETED' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'}`}>Mark Completed</button>
            </div>
            {resolveMode === 'COMPLETED' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Notification Channel</span>
                  {!isEditingChannel ? (
                    <button onClick={() => setIsEditingChannel(true)} className="h-7 px-2.5 text-xs gap-1 inline-flex items-center justify-center rounded-md border border-input bg-background text-foreground hover:bg-accent"><Pencil className="size-3.5" /> Edit</button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setDraftChannel(channel); setIsEditingChannel(false); }} className="h-7 px-2.5 text-xs gap-1 inline-flex items-center justify-center rounded-md border border-input bg-background text-foreground hover:bg-accent"><X className="size-3.5" /> Cancel</button>
                      <button onClick={handleSaveChannel} disabled={isSavingChannel || draftChannel === channel} className="h-7 px-2.5 text-xs gap-1 inline-flex items-center justify-center rounded-md bg-slate-900 text-white disabled:opacity-40"><Check className="size-3.5" /> {isSavingChannel ? 'Saving...' : 'Save'}</button>
                    </div>
                  )}
                </div>
                {isEditingChannel ? (
                  <Select value={draftChannel} onChange={(e) => setDraftChannel(e.target.value as any)} className="text-sm w-full" options={[{ value: 'EMAIL', label: 'Email' }, { value: 'SMS', label: 'SMS' }, { value: 'BOTH', label: 'Email & SMS' }, { value: 'NONE', label: 'None' }]} />
                ) : (
                  <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{channel === 'EMAIL' ? 'Email' : channel === 'SMS' ? 'SMS' : channel === 'BOTH' ? 'Email & SMS' : 'None'}</div>
                )}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">Reason for Resolution</span>
              <select value={selectedPreset} onChange={(e) => { const v = e.target.value; if (v === '__custom__') { setShowCustomReason(true); setResolveReason(''); } else { setShowCustomReason(false); setSelectedPreset(v); setResolveReason(v); } }} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border">
                <option value="" disabled>Select reason...</option>
                {resolveReasonOptions[resolveMode].map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                <option value="__custom__">Custom</option>
              </select>
              {showCustomReason && (
                <textarea value={resolveReason} onChange={(e) => setResolveReason(e.target.value)} rows={2} placeholder="Type custom reason..." className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border resize-none" />
              )}
            </div>
            {resolveMode === 'COMPLETED' && (
              <div className="p-4 border bg-amber-500/5 border-amber-500/20 rounded-2xl">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Automated Patient Communication</span>
                <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Clicking <strong>Submit Resolution</strong> will finalize this visit and automatically send a <strong>Thank You & Post-Care Review Request</strong> message to the patient.</div>
              </div>
            )}
            {resolveMode === 'CONFIRMED_NO_SHOW' && (
              <div className="p-3 border bg-red-500/5 border-red-500/20 rounded-2xl">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-500">No-Show Notice</span>
                <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Clicking Submit Resolution will keep this appointment marked as <strong>Confirmed No-Show</strong> in system audit logs.</div>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={resetResolveState} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">Cancel</button>
              <button onClick={handleResolveSubmit} disabled={view.isPending || !resolveReason.trim()} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40">{view.isPending ? 'Submitting...' : 'Submit Resolution'}</button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => {
              const toHHMM = (t?: string) => { if (!t) return ''; if (t.includes('T')) { const p = t.split('T')[1]; if (p) return p.slice(0, 5); } const m = t.match(/^(\d{2}):(\d{2})/); return m ? `${m[1]}:${m[2]}` : ''; };
              view.setRescheduleDoctor(appointment.doctorId || '');
              view.setRescheduleDate(appointment.date || '');
              view.setRescheduleTime(toHHMM(appointment.startTime ?? undefined));
              view.setRescheduleEndTime(toHHMM(appointment.endTime ?? undefined));
              view.setRescheduleJustification('');
              setShowRescheduleForm(true);
            }} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">Reschedule</button>
            <button onClick={() => { setShowResolveForm(true); setResolveMode('CONFIRMED_NO_SHOW'); setResolveReason(''); setShowCustomReason(false); setSelectedPreset(''); }} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl">Resolve</button>
          </div>
        )}
      </div>
    </section>
  );
}
