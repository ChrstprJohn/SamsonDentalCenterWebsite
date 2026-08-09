'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, UserRound, X, Pencil, Check } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';
import { formatClinicTime, formatShortDate } from '@/shared/utils/date.util';
import type { AppointmentDto } from '@/modules/appointments/dtos/exports';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { DoctorFilterItem } from '@/modules/staff/hooks/secretary/use-secretary-appointments';
import { AppointmentRescheduleForm, isRescheduleFormComplete } from './appointment-reschedule-form';

function patientName(appointment: AppointmentDto) {
  if (appointment.dependent) return `${appointment.dependent.firstName} ${appointment.dependent.lastName}`;
  if (appointment.patient) return `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  if (appointment.guestContact) return `${appointment.guestContact.firstName || ''} ${appointment.guestContact.lastName || ''}`.trim() || 'Guest Patient';
  return 'Guest Patient';
}

interface NeedsAttentionView {
  isPending: boolean;
  completeMissedCheckout: (appointmentId: string, reason?: string) => void;
  handleResolveNoShowSubmit: (payload: {
    appointmentId: string;
    resolution: 'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'RESCHEDULE' | 'CHECKED_IN';
    reason: string;
    newDate?: string;
    newStartTime?: string;
    newEndTime?: string;
    newDoctorId?: string;
  }) => void;
  loadActionResources: () => void;
  doctorsList: DoctorFilterItem[];
  servicesList: ServiceResponseDto[];
  rescheduleDoctor: string;
  setRescheduleDoctor: (value: string) => void;
  rescheduleDate: string;
  setRescheduleDate: (value: string) => void;
  rescheduleTime: string;
  setRescheduleTime: (value: string) => void;
  rescheduleEndTime: string;
  setRescheduleEndTime: (value: string) => void;
  rescheduleJustification: string;
  setRescheduleJustification: (value: string) => void;
}

function getPatientFirstName(app: AppointmentDto): string {
  return app?.guestContact?.firstName || app?.dependent?.firstName || app?.patient?.firstName || '-';
}
function getPatientLastName(app: AppointmentDto): string {
  return app?.guestContact?.lastName || app?.dependent?.lastName || app?.patient?.lastName || '-';
}
function getPatientEmail(app: AppointmentDto): string {
  return app?.guestContact?.email || app?.patient?.email || '-';
}
function getPatientPhone(app: AppointmentDto): string {
  return app?.guestContact?.phone || app?.patient?.phone || '-';
}
function Field({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-col gap-0.5"><span className="text-xs text-muted-foreground">{label}</span><div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{value}</div></div>;
}

/**
 * NeedsAttentionDetail - Resolve pane for the Needs attention directory tab.
 * Handles both missed checkouts (past CHECKED_IN) and unresolved no-shows.
 * Resolution options: Checkout (COMPLETED), Keep No-Show, or Reschedule.
 */
export function NeedsAttentionDetail({ appointment, view, onBack, className }: { appointment: AppointmentDto; view: NeedsAttentionView; onBack: () => void; className: string }) {
  const isMissedCheckout = appointment.status === 'CHECKED_IN';
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [resolveMode, setResolveMode] = useState<'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'RESCHEDULE'>('COMPLETED');
  const [resolveReason, setResolveReason] = useState('');
  const [showCustomReason, setShowCustomReason] = useState(false);
  const resolveReasonOptions: Record<string, string[]> = {
    COMPLETED: ['Visit completed but status updated late', 'Patient was seen but not checked in', 'Status corrected after visit'],
    CONFIRMED_NO_SHOW: ['Patient failed to arrive for appointment', 'Patient arrived after closing', 'Patient refused treatment'],
    RESCHEDULE: ['Patient requested new date', 'Doctor requested reschedule', 'Administrative reschedule'],
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
    if (draftChannel !== channel) await handleSaveChannel();
    if (isMissedCheckout) {
      view.completeMissedCheckout(appointment.id, resolveReason.trim() || 'Late checkout — past appointment follow-up');
    } else {
      if (!resolveReason.trim()) return;
      view.handleResolveNoShowSubmit({ appointmentId: appointment.id, resolution: resolveMode, reason: resolveReason.trim() });
    }
    resetResolveState();
  };

  const handleRescheduleSubmit = () => {
    const fmt = (ds: string, ts: string) => `${ds}T${ts.length === 5 ? ts + ':00' : ts}Z`;
    view.handleResolveNoShowSubmit({
      appointmentId: appointment.id,
      resolution: 'RESCHEDULE',
      reason: view.rescheduleJustification || 'Rescheduled from past no-show follow-up',
      newDate: view.rescheduleDate || appointment.date,
      newStartTime: view.rescheduleTime ? fmt(view.rescheduleDate || appointment.date, view.rescheduleTime) : undefined,
      newEndTime: view.rescheduleEndTime ? fmt(view.rescheduleDate || appointment.date, view.rescheduleEndTime) : undefined,
      newDoctorId: view.rescheduleDoctor || appointment.doctorId || undefined,
    });
  };

  const displayName = patientName(appointment);
  const isFormActive = showRescheduleForm || showResolveForm;
  const pTitle = showRescheduleForm
    ? 'Reschedule Appointment'
    : showResolveForm
      ? isMissedCheckout
        ? 'Resolve Missed Checkout'
        : 'Resolve No-Show'
      : 'Appointment Details';
  const pSub = showRescheduleForm
    ? 'Update date, time, dentist, or service details.'
    : showResolveForm
      ? isMissedCheckout
        ? 'Review the visit and finalize checkout.'
        : 'Review the no-show and choose a resolution.'
      : `Ref #${appointment.id.slice(0, 8)}`;
  const statusStr = isMissedCheckout ? 'CHECKED IN' : 'NO SHOW';
  const statusColor = isMissedCheckout ? 'text-cyan-600 bg-cyan-500/10' : 'text-amber-600 bg-amber-500/10';

  const handleHeaderBack = () => {
    if (isFormActive) {
      resetResolveState();
      return;
    }
    onBack();
  };

  return (
    <section className={`flex flex-1 min-w-0 flex-col min-h-0 ${className}`}>
      <div className="flex items-center gap-2 p-4 border-b border-border shrink-0 min-h-[61px]">
        <button onClick={handleHeaderBack} className="p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0"><ArrowLeft className="size-5" /></button>
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="text-base font-medium text-foreground truncate">{pTitle}</span>
          <span className="text-[11px] text-muted-foreground truncate">{pSub}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 !overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
        {showRescheduleForm ? (
          <div className="p-4">
            <AppointmentRescheduleForm
              appointment={appointment}
              services={view.servicesList}
              serviceId={appointment.serviceId}
              doctorId={view.rescheduleDoctor || appointment.doctorId || ''}
              doctors={(view.doctorsList as DoctorFilterItem[]).map((d) => ({ doctorId: d.id, doctorName: `Dr. ${d.firstName} ${d.lastName}` }))}
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
        ) : showResolveForm ? (
          <div className="px-4 py-4 space-y-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">Resolution Action <span className="text-destructive">*</span></span>
              <span className="text-xs text-muted-foreground">{isMissedCheckout ? 'Finalize checkout to complete this visit.' : 'Select an action for resolving this no-show appointment.'}</span>
            </div>
            <div className="flex flex-col gap-2">
              {!isMissedCheckout && (
                <button
                  type="button"
                  onClick={() => { setResolveMode('CONFIRMED_NO_SHOW'); setSelectedPreset(''); setResolveReason(''); setShowCustomReason(false); }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    resolveMode === 'CONFIRMED_NO_SHOW' ? 'border-red-500 bg-red-500/10 ring-1 ring-red-500/50' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'
                  }`}
                >
                  <div className={`size-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${resolveMode === 'CONFIRMED_NO_SHOW' ? 'border-red-500 bg-red-500' : 'border-muted-foreground/40'}`}>
                    {resolveMode === 'CONFIRMED_NO_SHOW' && <div className="size-1 rounded-full bg-white" />}
                  </div>
                  <span className={`text-xs font-semibold ${resolveMode === 'CONFIRMED_NO_SHOW' ? 'text-red-500' : 'text-foreground'}`}>Keep No-Show</span>
                </button>
              )}

              {/* Checkout (Mark Completed) */}
              <button
                type="button"
                onClick={() => { setResolveMode('COMPLETED'); setSelectedPreset(''); setResolveReason(''); setShowCustomReason(false); }}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  resolveMode === 'COMPLETED' ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/50' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'
                }`}
              >
                <div className={`size-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${resolveMode === 'COMPLETED' ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground/40'}`}>
                  {resolveMode === 'COMPLETED' && <div className="size-1 rounded-full bg-white" />}
                </div>
                <span className={`text-xs font-semibold ${resolveMode === 'COMPLETED' ? 'text-emerald-600' : 'text-foreground'}`}>Checkout (Mark Completed)</span>
              </button>

              {!isMissedCheckout && (
                <button
                  type="button"
                  onClick={() => { setResolveMode('RESCHEDULE'); setSelectedPreset(''); setResolveReason(''); setShowCustomReason(false); }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    resolveMode === 'RESCHEDULE' ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/50' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'
                  }`}
                >
                  <div className={`size-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${resolveMode === 'RESCHEDULE' ? 'border-cyan-500 bg-cyan-500' : 'border-muted-foreground/40'}`}>
                    {resolveMode === 'RESCHEDULE' && <div className="size-1 rounded-full bg-white" />}
                  </div>
                  <span className={`text-xs font-semibold ${resolveMode === 'RESCHEDULE' ? 'text-cyan-600' : 'text-foreground'}`}>Reschedule</span>
                </button>
              )}
            </div>

            {resolveMode === 'COMPLETED' && (
              <div className="p-3 border bg-amber-500/5 border-amber-500/20 rounded-2xl">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Completion Notice</span>
                <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">This will complete the visit and send the selected post-care message.</div>
              </div>
            )}
            {resolveMode === 'CONFIRMED_NO_SHOW' && (
              <div className="p-3 border bg-red-500/5 border-red-500/20 rounded-2xl">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-500">No-Show Notice</span>
                <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Clicking Submit Resolution will keep this appointment marked as <strong>Confirmed No-Show</strong> in system audit logs.</div>
              </div>
            )}
            {resolveMode === 'RESCHEDULE' && (
              <div className="p-3 border bg-cyan-500/5 border-cyan-500/20 rounded-2xl">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-600">Reschedule Notice</span>
                <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Clicking Continue to Reschedule will open slot selection to pick a new date, time, dentist, or service.</div>
              </div>
            )}

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
                  <Select value={draftChannel} onChange={(e) => setDraftChannel(e.target.value as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE')} className="text-sm w-full" options={[{ value: 'EMAIL', label: 'Email' }, { value: 'SMS', label: 'SMS' }, { value: 'BOTH', label: 'Email & SMS' }, { value: 'NONE', label: 'None' }]} />
                ) : (
                  <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{channel === 'EMAIL' ? 'Email' : channel === 'SMS' ? 'SMS' : channel === 'BOTH' ? 'Email & SMS' : 'None'}</div>
                )}
              </div>
            )}

            {resolveMode !== 'RESCHEDULE' && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Reason for Resolution</span>
                <select value={selectedPreset} onChange={(e) => { const v = e.target.value; if (v === '__custom__') { setShowCustomReason(true); setResolveReason(''); } else { setShowCustomReason(false); setSelectedPreset(v); setResolveReason(v); } }} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border">
                  <option value="" disabled>Select reason...</option>
                  {resolveReasonOptions[resolveMode]?.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                  <option value="__custom__">Custom</option>
                </select>
                {showCustomReason && (
                  <textarea value={resolveReason} onChange={(e) => setResolveReason(e.target.value)} rows={2} placeholder="Type custom reason..." className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border resize-none" />
                )}
              </div>
            )}
          </div>
        ) : (
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
        )}
      </div>

      <div className="shrink-0 border-t border-border px-4 py-3">
        {showRescheduleForm ? (() => {
          const isFormComplete = isRescheduleFormComplete({
            serviceId: appointment.serviceId,
            doctorId: view.rescheduleDoctor || appointment.doctorId || '',
            date: view.rescheduleDate || appointment.date,
            startTime: view.rescheduleTime || '',
            endTime: view.rescheduleEndTime || '',
            justification: view.rescheduleJustification || '',
          });
          return (
            <div className="flex gap-2">
              <button onClick={handleRescheduleSubmit} disabled={view.isPending || !isFormComplete} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40">
                {view.isPending ? 'Saving...' : 'Confirm'}
              </button>
              <button onClick={() => setShowRescheduleForm(false)} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">
                Back
              </button>
            </div>
          );
        })() : showResolveForm ? (
          <div className="flex gap-2">
            <button onClick={resetResolveState} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">Cancel</button>
            {resolveMode === 'RESCHEDULE' ? (
              <button
                type="button"
                onClick={() => {
                  const toHHMM = (t?: string) => { if (!t) return ''; if (t.includes('T')) { const p = t.split('T')[1]; if (p) return p.slice(0, 5); } const m = t.match(/^(\d{2}):(\d{2})/); return m ? `${m[1]}:${m[2]}` : ''; };
                  view.setRescheduleDoctor(appointment.doctorId || '');
                  view.setRescheduleDate(appointment.date || '');
                  view.setRescheduleTime(toHHMM(appointment.startTime ?? undefined));
                  view.setRescheduleEndTime(toHHMM(appointment.endTime ?? undefined));
                  view.setRescheduleJustification('');
                  void view.loadActionResources();
                  setShowRescheduleForm(true);
                  setShowResolveForm(false);
                }}
                className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl"
              >
                Continue to Reschedule
              </button>
            ) : (
              <button onClick={handleResolveSubmit} disabled={view.isPending || (!isMissedCheckout && !resolveReason.trim())} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40">{view.isPending ? 'Submitting...' : 'Submit Resolution'}</button>
            )}
          </div>
        ) : (
          <button onClick={() => { setShowResolveForm(true); setResolveMode('COMPLETED'); setResolveReason(''); setShowCustomReason(false); setSelectedPreset(''); }} className="w-full h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl">Resolve</button>
        )}
      </div>
    </section>
  );
}
