'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, UserRound, MessageSquare, Mail, RotateCw, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatClinicTime, formatShortDate } from '@/shared/utils/date.util';
import { AppointmentRescheduleForm } from './appointment-reschedule-form';
import { AppointmentStatusHistory } from './appointment-status-history';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';
import { resendNotificationAction } from '@/modules/appointments/actions/status/resend-notification.action';
import { computeNotificationStatus } from '@/modules/notifications/utils/notification-status.util';

const STATUS_BADGE: Record<string, string> = {
  APPROVED: 'text-blue-600 bg-blue-500/10',
  CHECKED_IN: 'text-cyan-600 bg-cyan-500/10',
  COMPLETED: 'text-emerald-600 bg-emerald-500/10',
  CANCELLED: 'text-rose-600 bg-rose-500/10',
  REJECTED: 'text-rose-600 bg-rose-500/10',
  NO_SHOW: 'text-amber-600 bg-amber-500/10',
  DISPLACED: 'text-amber-600 bg-amber-500/10',
};

function getPatientDisplayName(app: any): string {
  if (!app) return 'Guest Patient';
  if (app.dependent) {
    return `${app.dependent.firstName || ''} ${app.dependent.lastName || ''}`.trim() || 'Dependent';
  }
  if (app.guestContact) {
    const first = app.guestContact.firstName || '';
    const last = app.guestContact.lastName || '';
    return `${first} ${last}`.trim() || 'Guest Patient';
  }
  if (app.patient) {
    const first = app.patient.firstName || '';
    const last = app.patient.lastName || '';
    return `${first} ${last}`.trim() || 'Patient';
  }
  return 'Guest Patient';
}

function getPatientFirstName(app: any): string {
  return app?.guestContact?.firstName || app?.dependent?.firstName || app?.patient?.firstName || '-';
}

function getPatientLastName(app: any): string {
  return app?.guestContact?.lastName || app?.dependent?.lastName || app?.patient?.lastName || '-';
}

function getPatientMiddleName(app: any): string {
  return app?.guestContact?.middleName || app?.patient?.middleName || '-';
}

function getPatientSuffix(app: any): string {
  return app?.guestContact?.suffix || app?.patient?.suffix || '-';
}

function getPatientEmail(app: any): string {
  return app?.guestContact?.email || app?.patient?.email || '-';
}

function getPatientPhone(app: any): string {
  return app?.guestContact?.phone || app?.guestContact?.phone_number || app?.guestContact?.phoneNumber || app?.patient?.phoneNumber || '-';
}

export function CheckInDetailPane({ view, onClose }: { view: any; onClose: () => void }) {
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [showUndoForm, setShowUndoForm] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [resolveMode, setResolveMode] = useState<'COMPLETED' | 'CONFIRMED_NO_SHOW'>('COMPLETED');
  const [resolveReason, setResolveReason] = useState('');
  const [showCustomReason, setShowCustomReason] = useState(false);

  const resolveReasonOptions: Record<string, string[]> = {
    COMPLETED: ['Secretary forgot to click check-in', 'Patient was seen but not checked in', 'Administrative oversight'],
    CONFIRMED_NO_SHOW: ['Patient failed to arrive for appointment', 'Patient arrived after closing', 'Patient refused treatment'],
  };
  const [selectedPreset, setSelectedPreset] = useState('');
  const appointment = view.checkInAppt || view.checkoutAppt || view.viewAppt || view.resolveAppt || view.rescheduleAppt;

  const prevApptId = useRef(appointment?.id);
  useEffect(() => {
    if (appointment?.id !== prevApptId.current) {
      prevApptId.current = appointment?.id;
      setShowCheckInForm(false);
      setShowResolveForm(false);
      setShowRescheduleForm(false);
      setShowUndoForm(false);
      setShowCheckoutForm(false);
      setResolveMode('COMPLETED');
      setResolveReason('');
      setShowCustomReason(false);
      setSelectedPreset('');
    }
  }, [appointment?.id]);

  if (!appointment) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
          <UserRound className="size-6 text-muted-foreground/60" />
        </div>
        <p className="text-xs font-medium text-foreground">No appointment selected</p>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px]">
          Click a visit card on the board to view details and manage the visit.
        </p>
      </div>
    );
  }

  const paneType = view.checkInAppt ? 'checkin' : view.checkoutAppt ? 'checkout' : view.viewAppt ? 'details' : view.resolveAppt ? 'resolve' : view.rescheduleAppt ? 'reschedule' : null;

  const paneTitle = paneType === 'details' ? 'Appointment Details' : paneType === 'checkin' ? 'Check In' : paneType === 'checkout' ? 'Checkout' : paneType === 'resolve' ? 'No-Show Resolution' : paneType === 'reschedule' ? 'Reschedule' : '';

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <div className="flex items-center gap-2 p-4 border-b border-border shrink-0">
        <button onClick={onClose} className="lg:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="text-base font-medium text-foreground truncate">
            {paneTitle}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {paneType === 'details' ? `Ref #${appointment.id?.slice(0, 8) || ''}` : `${getPatientDisplayName(appointment)} &mdash; ${appointment.service?.name}`}
          </span>
        </div>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground shrink-0 max-lg:hidden">
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
        {paneType === 'details' && (
          <div className="flex flex-col items-center pt-4 pb-3 px-4">
            <div className="size-12 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border-2 border-border/60 overflow-hidden mb-3">
              <UserRound className="size-10 text-muted-foreground/70 translate-y-0.5" />
            </div>
            <h2 className="text-base font-semibold text-foreground text-center">
              {getPatientDisplayName(appointment)}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">{appointment.guestContact ? 'Guest' : 'Patient'}</p>
          </div>
        )}
        {paneType === 'details' && <hr className="border-card-border/40 mx-4" />}
        {paneType === 'details' && (
          <div className="flex items-center justify-between py-3 px-4">
            <span className="text-sm font-medium text-foreground">Current Status</span>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_BADGE[appointment.status] || 'bg-muted/50 text-muted-foreground'}`}>
              {appointment.status === 'CHECKED_IN' ? 'CHECKED IN' : appointment.status}
            </span>
          </div>
        )}
        {paneType === 'details' && <hr className="border-card-border/40 mx-4" />}
        <div className="px-4 py-4 space-y-4">
          {paneType === 'details' && <DetailsContent appointment={appointment} view={view} />}

          {paneType === 'checkout' && <CheckoutContent appointment={appointment} view={view} />}
          {paneType === 'resolve' && <ResolveContent view={view} onClose={onClose} />}
          {paneType === 'reschedule' && <StandaloneReschedule view={view} onClose={onClose} />}
        </div>
      </div>

      {paneType !== 'resolve' && paneType !== 'reschedule' && (
        <div className="shrink-0 border-t border-border px-4 py-3">
          <div className="flex gap-2">
            {paneType === 'details' && appointment.status === 'APPROVED' && !showCheckInForm && (
              <button onClick={() => setShowCheckInForm(true)} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl">
                Check In
              </button>
            )}
            {paneType === 'details' && appointment.status === 'APPROVED' && showCheckInForm && (
              <div className="w-full flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-medium text-foreground">Confirm Patient Check-In</h3>
                  <p className="text-xs text-muted-foreground">
                    Mark patient as arrived and ready for their appointment.
                  </p>
                </div>
                <div className="p-3 border bg-amber-500/5 border-amber-500/20">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Check-In Notice</span>
                  <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    Clicking Confirm Check-In will check in the patient and change their status to Checked In. Are you sure you want to proceed? This will immediately move their card to the "In Treatment" queue.
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowCheckInForm(false)} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">
                    Cancel
                  </button>
                  <button onClick={() => { view.handleCheckIn(appointment.id); setShowCheckInForm(false); }} disabled={view.isPending} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40">
                    {view.isPending ? 'Checking In...' : 'Confirm Check-In'}
                  </button>
                </div>
              </div>
            )}
            {paneType === 'details' && appointment.status === 'NO_SHOW' && !showResolveForm && !showRescheduleForm && (
              <>
                <button onClick={() => { const toHHMM = (t?: string) => { if (!t) return ''; if (t.includes('T')) { const p = t.split('T')[1]; if (p) return p.slice(0, 5); } const m = t.match(/^(\d{2}):(\d{2})/); return m ? `${m[1]}:${m[2]}` : ''; }; view.setRescheduleAppt(appointment); view.setRescheduleDate(appointment.date || ''); view.setRescheduleTime(toHHMM(appointment.startTime)); view.setRescheduleEndTime(toHHMM(appointment.endTime)); view.setRescheduleJustification(''); setShowRescheduleForm(true); }} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">
                  Reschedule
                </button>
                <button onClick={() => { setShowResolveForm(true); setResolveMode('CONFIRMED_NO_SHOW'); setResolveReason(''); setShowCustomReason(false); setSelectedPreset(''); }} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl">
                  Resolve
                </button>
              </>
            )}
            {paneType === 'details' && appointment.status === 'NO_SHOW' && showResolveForm && (
              <div className="w-full flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-medium text-foreground">No-Show Resolution</h3>
                  <p className="text-xs text-muted-foreground">
                    Choose how to handle this no-show. Unresolved stays marked as No-Show.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setResolveMode('CONFIRMED_NO_SHOW'); setSelectedPreset(''); setResolveReason(''); setShowCustomReason(false); }}
                    className={`p-2 border text-[10px] font-medium transition-all ${resolveMode === 'CONFIRMED_NO_SHOW' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'}`}>
                    Keep No-Show
                  </button>
                  <button onClick={() => { setResolveMode('COMPLETED'); setSelectedPreset(''); setResolveReason(''); setShowCustomReason(false); }}
                    className={`p-2 border text-[10px] font-medium transition-all ${resolveMode === 'COMPLETED' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'}`}>
                    Mark Completed
                  </button>
                </div>
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
                <div className="p-3 border bg-amber-500/5 border-amber-500/20">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Resolution Notice</span>
                  <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    Clicking Submit Resolution will apply the selected action. Are you sure you want to proceed? This decision can be changed later.
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setShowResolveForm(false); setResolveMode('CONFIRMED_NO_SHOW'); setResolveReason(''); setShowCustomReason(false); setSelectedPreset(''); }} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">
                    Cancel
                  </button>
                  <button onClick={() => { view.handleResolveNoShowSubmit({ appointmentId: appointment.id, resolution: resolveMode, reason: resolveReason }); setShowResolveForm(false); }} disabled={view.isPending || !resolveReason.trim()} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40">
                    {view.isPending ? 'Submitting...' : 'Submit Resolution'}
                  </button>
                </div>
              </div>
            )}
            {paneType === 'details' && appointment.status === 'NO_SHOW' && showRescheduleForm && (
              <div className="[&_form]:!border-t-0 [&_form]:!pt-0 w-full">
                <AppointmentRescheduleForm
                  appointment={appointment}
                  services={view.servicesList || []}
                  serviceId={appointment.serviceId}
                  doctorId={view.rescheduleDoctor || appointment.doctorId}
                  doctors={(view.doctorsList || []).map((d: any) => ({ doctorId: d.id, doctorName: `${d.prefix || 'Dr.'} ${d.firstName} ${d.lastName}` }))}
                  date={view.rescheduleDate || ''}
                  activeServiceId={appointment.serviceId}
                  activeDoctorId={appointment.doctorId}
                  startTime={view.rescheduleTime || ''}
                  endTime={view.rescheduleEndTime || ''}
                  justification={view.rescheduleJustification || ''}
                  isSubmitting={view.isPending}
                  onServiceSelect={() => {}}
                  onDoctorSelect={(docId) => view.setRescheduleDoctor(docId)}
                  onDateSelect={(d) => view.setRescheduleDate(d)}
                  onStartTimeChange={(t) => view.setRescheduleTime(t)}
                  onEndTimeChange={(t) => view.setRescheduleEndTime?.(t)}
                  onJustificationChange={(j) => view.setRescheduleJustification(j)}
                  onSubmit={() => { view.handleRescheduleSubmit(); setShowRescheduleForm(false); }}
                  onBack={() => { view.setRescheduleAppt(null); setShowRescheduleForm(false); }}
                />
              </div>
            )}
            {paneType === 'details' && appointment.status === 'CHECKED_IN' && !showUndoForm && !showCheckoutForm && (
              <>
                <button onClick={() => setShowUndoForm(true)} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">
                  Undo Check-In
                </button>
                <button onClick={() => setShowCheckoutForm(true)} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl">
                  Checkout
                </button>
              </>
            )}
            {paneType === 'details' && appointment.status === 'CHECKED_IN' && showUndoForm && (
              <div className="w-full flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-medium text-foreground">Undo Check-In</h3>
                  <p className="text-xs text-muted-foreground">
                    Revert patient back to <span className="font-medium text-amber-600">Upcoming Today</span> status.
                  </p>
                </div>
                <div className="p-3 border bg-amber-500/5 border-amber-500/20">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Status Change</span>
                  <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    Clicking Undo Check-In will revert the check-in and move the patient back to the "Upcoming Today" queue. Are you sure you want to proceed?
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowUndoForm(false)} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">
                    Cancel
                  </button>
                  <button onClick={() => { view.handleUndoCheckIn(appointment.id); setShowUndoForm(false); }} disabled={view.isPending} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40">
                    {view.isPending ? 'Reverting...' : 'Undo Check-In'}
                  </button>
                </div>
              </div>
            )}
            {paneType === 'details' && appointment.status === 'CHECKED_IN' && showCheckoutForm && (
              <InlineCheckoutForm appointment={appointment} view={view} onCancel={() => setShowCheckoutForm(false)} />
            )}
            {paneType === 'checkout' && (
              <>
                <button onClick={onClose} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">
                  Cancel
                </button>
                <button onClick={() => view.handleCheckoutComplete(appointment.id)} disabled={view.isPending} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40">
                  {view.isPending ? 'Sending...' : 'Confirm & Send'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ variant, title, children }: { variant: 'cyan' | 'amber' | 'emerald' | 'red'; title: string; children: React.ReactNode }) {
  const colors = {
    cyan: 'bg-cyan-500/5 border-cyan-500/20 text-cyan-600',
    amber: 'bg-amber-500/5 border-amber-500/20 text-amber-600',
    emerald: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600',
    red: 'bg-red-500/5 border-red-500/20 text-red-500',
  };
  return (
    <div className={`p-3 border ${colors[variant]}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider">{title}</span>
      <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{children}</div>
    </div>
  );
}

function DetailsContent({ appointment, view }: { appointment: any; view?: any }) {
  const channel = (appointment.confirmationChannel || appointment.confirmation_channel) as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE' || 'EMAIL';
  const [resending, setResending] = useState<string | null>(null);

  const [commState, setCommState] = useState({
    emailConfirmationSent: Boolean(appointment.emailConfirmationSent || appointment.email_confirmation_sent),
    smsConfirmationSent: Boolean(appointment.smsConfirmationSent || appointment.sms_confirmation_sent),
    emailReminder48hSent: Boolean(appointment.emailReminder48hSent || appointment.email_reminder_48h_sent),
    smsReminder48hSent: Boolean(appointment.smsReminder48hSent || appointment.sms_reminder_48h_sent),
    emailReminder24hSent: Boolean(appointment.emailReminder24hSent || appointment.email_reminder_24h_sent),
    smsReminder24hSent: Boolean(appointment.smsReminder24hSent || appointment.sms_reminder_24h_sent),
    emailCheckoutSent: Boolean(appointment.emailCheckoutSent || appointment.email_checkout_sent),
    smsCheckoutSent: Boolean(appointment.smsCheckoutSent || appointment.sms_checkout_sent),
  });

  useEffect(() => {
    setCommState({
      emailConfirmationSent: Boolean(appointment.emailConfirmationSent || appointment.email_confirmation_sent),
      smsConfirmationSent: Boolean(appointment.smsConfirmationSent || appointment.sms_confirmation_sent),
      emailReminder48hSent: Boolean(appointment.emailReminder48hSent || appointment.email_reminder_48h_sent),
      smsReminder48hSent: Boolean(appointment.smsReminder48hSent || appointment.sms_reminder_48h_sent),
      emailReminder24hSent: Boolean(appointment.emailReminder24hSent || appointment.email_reminder_24h_sent),
      smsReminder24hSent: Boolean(appointment.smsReminder24hSent || appointment.sms_reminder_24h_sent),
      emailCheckoutSent: Boolean(appointment.emailCheckoutSent || appointment.email_checkout_sent),
      smsCheckoutSent: Boolean(appointment.smsCheckoutSent || appointment.sms_checkout_sent),
    });
  }, [appointment]);

  const handleResend = async (eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H' | 'APPOINTMENT_CHECKOUT', targetChannel: 'EMAIL' | 'SMS') => {
    const key = `${eventType}_${targetChannel}`;
    setResending(key);
    const res = await resendNotificationAction({ appointmentId: appointment.id, eventType, targetChannel });
    if (res.success) {
      if (eventType === 'APPOINTMENT_REMINDER_48H') {
        if (targetChannel === 'EMAIL') { (appointment as any).emailReminder48hSent = true; (appointment as any).email_reminder_48h_sent = true; }
        if (targetChannel === 'SMS') { (appointment as any).smsReminder48hSent = true; (appointment as any).sms_reminder_48h_sent = true; }
      } else if (eventType === 'APPOINTMENT_REMINDER_24H') {
        if (targetChannel === 'EMAIL') { (appointment as any).emailReminder24hSent = true; (appointment as any).email_reminder_24h_sent = true; }
        if (targetChannel === 'SMS') { (appointment as any).smsReminder24hSent = true; (appointment as any).sms_reminder_24h_sent = true; }
      } else if (eventType === 'APPOINTMENT_BOOKED') {
        if (targetChannel === 'EMAIL') { (appointment as any).emailConfirmationSent = true; (appointment as any).email_confirmation_sent = true; }
        if (targetChannel === 'SMS') { (appointment as any).smsConfirmationSent = true; (appointment as any).sms_confirmation_sent = true; }
      } else if (eventType === 'APPOINTMENT_CHECKOUT') {
        if (targetChannel === 'EMAIL') { (appointment as any).emailCheckoutSent = true; (appointment as any).email_checkout_sent = true; }
        if (targetChannel === 'SMS') { (appointment as any).smsCheckoutSent = true; (appointment as any).sms_checkout_sent = true; }
      }

      setCommState((prev) => {
        const updates: Partial<typeof prev> = {};
        if (eventType === 'APPOINTMENT_REMINDER_48H') {
          if (targetChannel === 'EMAIL') updates.emailReminder48hSent = true;
          if (targetChannel === 'SMS') updates.smsReminder48hSent = true;
        } else if (eventType === 'APPOINTMENT_REMINDER_24H') {
          if (targetChannel === 'EMAIL') updates.emailReminder24hSent = true;
          if (targetChannel === 'SMS') updates.smsReminder24hSent = true;
        } else if (eventType === 'APPOINTMENT_BOOKED') {
          if (targetChannel === 'EMAIL') updates.emailConfirmationSent = true;
          if (targetChannel === 'SMS') updates.smsConfirmationSent = true;
        } else if (eventType === 'APPOINTMENT_CHECKOUT') {
          if (targetChannel === 'EMAIL') updates.emailCheckoutSent = true;
          if (targetChannel === 'SMS') updates.smsCheckoutSent = true;
        }
        return { ...prev, ...updates };
      });
      if (view?.fetchData) view.fetchData();
    } else {
      alert(res.error || 'Failed to resend notification.');
    }
    setResending(null);
  };

  const commEntries: {
    key: string;
    label: string;
    eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H' | 'APPOINTMENT_CHECKOUT';
    emailSent: boolean;
    smsSent: boolean;
  }[] = [
    { key: 'confirmation', label: 'Booking Confirmation', eventType: 'APPOINTMENT_BOOKED', emailSent: commState.emailConfirmationSent, smsSent: commState.smsConfirmationSent },
    { key: 'reminder48h', label: '48-Hour Reminder', eventType: 'APPOINTMENT_REMINDER_48H', emailSent: commState.emailReminder48hSent, smsSent: commState.smsReminder48hSent },
    { key: 'reminder24h', label: '24-Hour Reminder', eventType: 'APPOINTMENT_REMINDER_24H', emailSent: commState.emailReminder24hSent, smsSent: commState.smsReminder24hSent },
    { key: 'checkout', label: 'Checkout / Thank You', eventType: 'APPOINTMENT_CHECKOUT', emailSent: commState.emailCheckoutSent, smsSent: commState.smsCheckoutSent },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="text-sm font-medium text-foreground block mb-3">Guest Information</span>
        <div className="flex flex-col gap-2">
          <Field label="First Name" value={getPatientFirstName(appointment)} />
          <Field label="Last Name" value={getPatientLastName(appointment)} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Middle Name" value={getPatientMiddleName(appointment)} />
            <Field label="Suffix" value={getPatientSuffix(appointment)} />
          </div>
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

      <hr className="border-card-border/40" />

      {/* Read-Only Notification Channel */}
      <div>
        <span className="text-sm font-medium text-foreground block mb-2">Notification Channel</span>
        <div className="p-3 bg-secondary-bg/20 border border-card-border/60 rounded-xl flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {channel === 'EMAIL' && 'Email Only'}
            {channel === 'SMS' && 'SMS Only'}
            {channel === 'BOTH' && 'Both (Email & SMS)'}
            {channel === 'NONE' && 'None (Opted Out)'}
          </span>
          <span className="text-xs text-muted-foreground">
            {channel === 'NONE' ? 'Automated messaging disabled' : 'Active dispatch channel'}
          </span>
        </div>
      </div>

      <hr className="border-card-border/40" />

      {/* Notification History */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-foreground block">Notification History</span>
        <div className="flex flex-col gap-2">
          {commEntries.map((entry) => {
            const createdAt = (appointment as any).createdAt || (appointment as any).created_at;
            const startTime = (appointment as any).startTime || (appointment as any).start_time || (appointment as any).date;

            const smsStatus = computeNotificationStatus({
              eventType: entry.eventType,
              targetChannel: 'SMS',
              isSent: entry.smsSent,
              currentChannel: channel,
              createdAt,
              startTime,
            });

            const emailStatus = computeNotificationStatus({
              eventType: entry.eventType,
              targetChannel: 'EMAIL',
              isSent: entry.emailSent,
              currentChannel: channel,
              createdAt,
              startTime,
            });

            return (
              <div key={entry.key} className="space-y-1.5">
                <span className="text-xs text-muted-foreground">{entry.label}</span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-2.5 bg-secondary-bg/20 border border-card-border/60 rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground">SMS</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${smsStatus.badgeClass}`}>
                        {smsStatus.label}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={resending === `${entry.eventType}_SMS`}
                      onClick={() => handleResend(entry.eventType, 'SMS')}
                      className="text-[10px] h-6 px-2 gap-1 shrink-0"
                    >
                      <RotateCw className={`size-3 ${resending === `${entry.eventType}_SMS` ? 'animate-spin' : ''}`} />
                      {resending === `${entry.eventType}_SMS` ? 'Sending...' : 'Resend'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-secondary-bg/20 border border-card-border/60 rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground">Email</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${emailStatus.badgeClass}`}>
                        {emailStatus.label}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={resending === `${entry.eventType}_EMAIL`}
                      onClick={() => handleResend(entry.eventType, 'EMAIL')}
                      className="text-[10px] h-6 px-2 gap-1 shrink-0"
                    >
                      <RotateCw className={`size-3 ${resending === `${entry.eventType}_EMAIL` ? 'animate-spin' : ''}`} />
                      {resending === `${entry.eventType}_EMAIL` ? 'Sending...' : 'Resend'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="border-card-border/40" />
      <AppointmentStatusHistory appointment={appointment as any} activeTab="upcoming" compact />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">
        {value}
      </div>
    </div>
  );
}

function CheckoutContent({ appointment, view }: { appointment: any; view?: any }) {
  const ch = (appointment?.confirmationChannel || appointment?.confirmation_channel) as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE' || 'EMAIL';

  const [channel, setChannel] = useState(ch);
  const [draftChannel, setDraftChannel] = useState(ch);
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [isSavingChannel, setIsSavingChannel] = useState(false);

  useEffect(() => {
    setChannel(ch);
    setDraftChannel(ch);
    setIsEditingChannel(false);
  }, [appointment?.id]);

  const handleSaveChannel = async () => {
    setIsSavingChannel(true);
    const res = await updateConfirmationChannelAction({
      appointmentId: appointment.id,
      confirmationChannel: draftChannel,
    });
    if (res.success) {
      setChannel(draftChannel);
      appointment.confirmationChannel = draftChannel;
      appointment.confirmation_channel = draftChannel;
      setIsEditingChannel(false);
      if (view?.fetchData) view.fetchData();
    }
    setIsSavingChannel(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-base font-medium text-foreground">Checkout Patient</h3>
        <p className="text-xs text-muted-foreground">
          Review channel & finalize visit.
        </p>
      </div>

      <hr className="border-card-border/40" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Notification Channel</span>
          {!isEditingChannel ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditingChannel(true)} className="h-7 px-2.5 text-xs gap-1">
              <Pencil className="size-3.5" /> Edit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setDraftChannel(channel); setIsEditingChannel(false); }} className="h-7 px-2.5 text-xs gap-1">
                <X className="size-3.5" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSaveChannel} disabled={isSavingChannel || draftChannel === channel} className="h-7 px-2.5 text-xs gap-1 bg-slate-900 text-white rounded-md disabled:cursor-not-allowed">
                <Check className="size-3.5" /> {isSavingChannel ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        {isEditingChannel ? (
          <Select
            value={draftChannel}
            onChange={(e) => setDraftChannel(e.target.value as any)}
            className="text-sm w-full"
            options={[
              { value: 'EMAIL', label: 'Email' },
              { value: 'SMS', label: 'SMS' },
              { value: 'BOTH', label: 'Email & SMS' },
              { value: 'NONE', label: 'None' },
            ]}
          />
        ) : (
          <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">
            {channel === 'EMAIL' ? 'Email' : channel === 'SMS' ? 'SMS' : channel === 'BOTH' ? 'Email & SMS' : 'None'}
          </div>
        )}
      </div>

      <InfoBox variant="amber" title="Automated Communication">
        Confirming will complete the visit and send a Thank You & Review Request message via the selected channel.
      </InfoBox>
    </div>
  );
}

function ResolveContent({ view, onClose }: { view: any; onClose: () => void }) {
  const appointment = view.resolveAppt;
  const [resolution, setResolution] = useState<'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'RESCHEDULE'>('COMPLETED');
  const [reason, setReason] = useState('Secretary forgot to click check-in');

  if (!appointment) return null;

  const handleSubmit = () => {
    if (!reason.trim()) return;
    view.handleResolveNoShowSubmit({
      appointmentId: appointment.id,
      resolution,
      reason: reason.trim(),
    });
  };

  const selectResolution = (val: 'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'RESCHEDULE', defaultReason: string) => {
    setResolution(val);
    setReason(defaultReason);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground">No-Show Resolution</h3>
        <p className="text-xs text-muted-foreground">
          Original slot: {appointment.date} ({appointment.startTime?.substring(0, 5)} - {appointment.endTime?.substring(0, 5)})
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Resolution Action</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => selectResolution('COMPLETED', 'Secretary forgot to click check-in')}
            className={`p-2.5 border text-[10px] font-medium transition-all ${
              resolution === 'COMPLETED' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'
            }`}
          >
            Mark Completed
          </button>
          <button
            onClick={() => selectResolution('CONFIRMED_NO_SHOW', 'Patient failed to arrive for appointment')}
            className={`p-2.5 border text-[10px] font-medium transition-all ${
              resolution === 'CONFIRMED_NO_SHOW' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'
            }`}
          >
            Keep No-Show
          </button>
          <button
            onClick={() => selectResolution('RESCHEDULE', 'Patient arrived late; rescheduling to new slot')}
            className={`p-2.5 border text-[10px] font-medium transition-all ${
              resolution === 'RESCHEDULE' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'
            }`}
          >
            Reschedule
          </button>
        </div>
      </div>

      {resolution === 'RESCHEDULE' ? (
        <AppointmentRescheduleForm
          appointment={appointment}
          services={view.servicesList || []}
          serviceId={appointment.serviceId}
          doctorId={view.rescheduleDoctor || appointment.doctorId}
          doctors={(view.doctorsList || []).map((d: any) => ({
            doctorId: d.id,
            doctorName: `${d.prefix || 'Dr.'} ${d.firstName} ${d.lastName}`,
          }))}
          date={view.rescheduleDate || ''}
          activeServiceId={appointment.serviceId}
          activeDoctorId={appointment.doctorId}
          startTime={view.rescheduleTime || ''}
          endTime={view.rescheduleEndTime || ''}
          justification={reason}
          isSubmitting={view.isPending}
          onServiceSelect={() => {}}
          onDoctorSelect={(docId) => view.setRescheduleDoctor(docId)}
          onDateSelect={(d) => view.setRescheduleDate(d)}
          onStartTimeChange={(t) => view.setRescheduleTime(t)}
          onEndTimeChange={(t) => view.setRescheduleEndTime?.(t)}
          onJustificationChange={(j) => setReason(j)}
          onSubmit={handleSubmit}
          onBack={onClose}
        />
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Reason for Resolution</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Provide reason for audit log..."
              className="w-full text-xs p-3 bg-card border border-card-border text-foreground outline-none focus:border-foreground/30 resize-none"
            />
          </div>

          {resolution === 'COMPLETED' && (
            <InfoBox variant="emerald" title="Auto-Communication">
              Will complete appointment and send Thank You and Post-Care Review Request message to patient.
            </InfoBox>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleSubmit}
              disabled={view.isPending || !reason.trim()}
              className={`w-full h-10 text-sm font-medium border disabled:opacity-40 transition-colors ${
                resolution === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20'
              }`}
            >
              {view.isPending ? 'Submitting...' : 'Submit Resolution'}
            </button>
            <button
              onClick={onClose}
              className="w-full h-10 text-sm font-medium border border-card-border text-foreground bg-transparent hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StandaloneReschedule({ view, onClose }: { view: any; onClose: () => void }) {
  const appointment = view.rescheduleAppt;
  if (!appointment) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground">Reschedule Appointment</h3>
        <p className="text-xs text-muted-foreground">
          {getPatientDisplayName(appointment)} - {appointment.service?.name}
        </p>
      </div>

      <AppointmentRescheduleForm
        appointment={appointment}
        services={view.servicesList || []}
        serviceId={view.rescheduleService || appointment.serviceId}
        doctorId={view.rescheduleDoctor || appointment.doctorId}
        doctors={(view.doctorsList || []).map((d: any) => ({
          doctorId: d.id,
          doctorName: `${d.prefix || 'Dr.'} ${d.firstName} ${d.lastName}`,
        }))}
        date={view.rescheduleDate}
        activeServiceId={appointment.serviceId}
        activeDoctorId={appointment.doctorId}
        startTime={view.rescheduleTime}
        endTime={view.rescheduleEndTime || ''}
        justification={view.rescheduleJustification || ''}
        isSubmitting={view.isPending}
        onServiceSelect={(sId) => view.setRescheduleService?.(sId)}
        onDoctorSelect={(docId) => view.setRescheduleDoctor(docId)}
        onDateSelect={(d) => view.setRescheduleDate(d)}
        onStartTimeChange={(t) => view.setRescheduleTime(t)}
        onEndTimeChange={(t) => view.setRescheduleEndTime?.(t)}
        onJustificationChange={(j) => view.setRescheduleJustification?.(j)}
        onSubmit={view.handleRescheduleSubmit}
        onBack={onClose}
      />
    </div>
  );
}

function MessageLogContent({ appointment, view }: { appointment: any; view: any }) {
  const ch = (appointment.confirmationChannel || appointment.confirmation_channel) as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE' || 'EMAIL';
  const [channel, setChannel] = useState(ch);
  const [draftChannel, setDraftChannel] = useState(ch);
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [isSavingChannel, setIsSavingChannel] = useState(false);
  const [resending, setResending] = useState<string | null>(null);

  const [commState, setCommState] = useState({
    emailConfirmationSent: Boolean(appointment.emailConfirmationSent || appointment.email_confirmation_sent),
    smsConfirmationSent: Boolean(appointment.smsConfirmationSent || appointment.sms_confirmation_sent),
    emailReminder48hSent: Boolean(appointment.emailReminder48hSent || appointment.email_reminder_48h_sent),
    smsReminder48hSent: Boolean(appointment.smsReminder48hSent || appointment.sms_reminder_48h_sent),
    emailReminder24hSent: Boolean(appointment.emailReminder24hSent || appointment.email_reminder_24h_sent),
    smsReminder24hSent: Boolean(appointment.smsReminder24hSent || appointment.sms_reminder_24h_sent),
    emailCheckoutSent: Boolean(appointment.emailCheckoutSent || appointment.email_checkout_sent),
    smsCheckoutSent: Boolean(appointment.smsCheckoutSent || appointment.sms_checkout_sent),
  });

  useEffect(() => {
    setChannel(ch);
    setDraftChannel(ch);
    setCommState({
      emailConfirmationSent: Boolean(appointment.emailConfirmationSent || appointment.email_confirmation_sent),
      smsConfirmationSent: Boolean(appointment.smsConfirmationSent || appointment.sms_confirmation_sent),
      emailReminder48hSent: Boolean(appointment.emailReminder48hSent || appointment.email_reminder_48h_sent),
      smsReminder48hSent: Boolean(appointment.smsReminder48hSent || appointment.sms_reminder_48h_sent),
      emailReminder24hSent: Boolean(appointment.emailReminder24hSent || appointment.email_reminder_24h_sent),
      smsReminder24hSent: Boolean(appointment.smsReminder24hSent || appointment.sms_reminder_24h_sent),
      emailCheckoutSent: Boolean(appointment.emailCheckoutSent || appointment.email_checkout_sent),
      smsCheckoutSent: Boolean(appointment.smsCheckoutSent || appointment.sms_checkout_sent),
    });
  }, [appointment]);

  const handleResend = async (eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H' | 'APPOINTMENT_CHECKOUT', targetChannel: 'EMAIL' | 'SMS') => {
    const key = `${eventType}_${targetChannel}`;
    setResending(key);
    const res = await resendNotificationAction({ appointmentId: appointment.id, eventType, targetChannel });
    if (res.success) {
      if (eventType === 'APPOINTMENT_REMINDER_48H') {
        if (targetChannel === 'EMAIL') { (appointment as any).emailReminder48hSent = true; (appointment as any).email_reminder_48h_sent = true; }
        if (targetChannel === 'SMS') { (appointment as any).smsReminder48hSent = true; (appointment as any).sms_reminder_48h_sent = true; }
      } else if (eventType === 'APPOINTMENT_REMINDER_24H') {
        if (targetChannel === 'EMAIL') { (appointment as any).emailReminder24hSent = true; (appointment as any).email_reminder_24h_sent = true; }
        if (targetChannel === 'SMS') { (appointment as any).smsReminder24hSent = true; (appointment as any).sms_reminder_24h_sent = true; }
      } else if (eventType === 'APPOINTMENT_BOOKED') {
        if (targetChannel === 'EMAIL') { (appointment as any).emailConfirmationSent = true; (appointment as any).email_confirmation_sent = true; }
        if (targetChannel === 'SMS') { (appointment as any).smsConfirmationSent = true; (appointment as any).sms_confirmation_sent = true; }
      } else if (eventType === 'APPOINTMENT_CHECKOUT') {
        if (targetChannel === 'EMAIL') { (appointment as any).emailCheckoutSent = true; (appointment as any).email_checkout_sent = true; }
        if (targetChannel === 'SMS') { (appointment as any).smsCheckoutSent = true; (appointment as any).sms_checkout_sent = true; }
      }

      setCommState((prev) => {
        const updates: Partial<typeof prev> = {};
        if (eventType === 'APPOINTMENT_REMINDER_48H') {
          if (targetChannel === 'EMAIL') updates.emailReminder48hSent = true;
          if (targetChannel === 'SMS') updates.smsReminder48hSent = true;
        } else if (eventType === 'APPOINTMENT_REMINDER_24H') {
          if (targetChannel === 'EMAIL') updates.emailReminder24hSent = true;
          if (targetChannel === 'SMS') updates.smsReminder24hSent = true;
        } else if (eventType === 'APPOINTMENT_BOOKED') {
          if (targetChannel === 'EMAIL') updates.emailConfirmationSent = true;
          if (targetChannel === 'SMS') updates.smsConfirmationSent = true;
        } else if (eventType === 'APPOINTMENT_CHECKOUT') {
          if (targetChannel === 'EMAIL') updates.emailCheckoutSent = true;
          if (targetChannel === 'SMS') updates.smsCheckoutSent = true;
        }
        return { ...prev, ...updates };
      });
      if (view?.fetchData) view.fetchData();
    } else {
      alert(res.error || 'Failed to resend notification.');
    }
    setResending(null);
  };

  const handleSaveChannel = async () => {
    setIsSavingChannel(true);
    const res = await updateConfirmationChannelAction({
      appointmentId: appointment.id,
      confirmationChannel: draftChannel,
    });
    if (res.success) {
      setChannel(draftChannel);
      appointment.confirmationChannel = draftChannel;
      appointment.confirmation_channel = draftChannel;
      setIsEditingChannel(false);
    }
    setIsSavingChannel(false);
  };

  const handleCancelChannel = () => {
    setDraftChannel(channel);
    setIsEditingChannel(false);
  };

  const commEntries: {
    key: string;
    label: string;
    eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H' | 'APPOINTMENT_CHECKOUT';
    emailSent: boolean;
    smsSent: boolean;
  }[] = [
    { key: 'confirmation', label: 'Booking Confirmation', eventType: 'APPOINTMENT_BOOKED', emailSent: commState.emailConfirmationSent, smsSent: commState.smsConfirmationSent },
    { key: 'reminder48h', label: '48-Hour Reminder', eventType: 'APPOINTMENT_REMINDER_48H', emailSent: commState.emailReminder48hSent, smsSent: commState.smsReminder48hSent },
    { key: 'reminder24h', label: '24-Hour Reminder', eventType: 'APPOINTMENT_REMINDER_24H', emailSent: commState.emailReminder24hSent, smsSent: commState.smsReminder24hSent },
    { key: 'checkout', label: 'Checkout / Thank You', eventType: 'APPOINTMENT_CHECKOUT', emailSent: commState.emailCheckoutSent, smsSent: commState.smsCheckoutSent },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Notification Channel */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Notification Channel</span>
          {!isEditingChannel && (
            <Button variant="outline" size="sm" onClick={() => setIsEditingChannel(true)} className="h-7 px-2.5 text-xs gap-1">
              <Pencil className="size-3.5" /> Edit
            </Button>
          )}
          {isEditingChannel && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelChannel} className="h-7 px-2.5 text-xs gap-1">
                <X className="size-3.5" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSaveChannel} disabled={isSavingChannel || draftChannel === channel} className="h-7 px-2.5 text-xs gap-1 bg-slate-900 text-white rounded-md disabled:cursor-not-allowed">
                <Check className="size-3.5" /> {isSavingChannel ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        {isEditingChannel ? (
          <Select
            value={draftChannel}
            onChange={(e) => setDraftChannel(e.target.value as any)}
            className="text-sm w-full"
            options={[
              { label: 'Email Only', value: 'EMAIL' },
              { label: 'SMS Only', value: 'SMS' },
              { label: 'Both (Email & SMS)', value: 'BOTH' },
              { label: 'None (Opted Out)', value: 'NONE' },
            ]}
          />
        ) : (
          <div className="p-3 bg-secondary-bg/20 border border-card-border/60 rounded-xl flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {channel === 'EMAIL' && 'Email Only'}
              {channel === 'SMS' && 'SMS Only'}
              {channel === 'BOTH' && 'Both (Email & SMS)'}
              {channel === 'NONE' && 'None (Opted Out)'}
            </span>
            <span className="text-xs text-muted-foreground">
              {channel === 'NONE' ? 'Automated messaging disabled' : 'Active dispatch channel'}
            </span>
          </div>
        )}
      </div>

      <hr className="border-card-border/40" />

      {/* Notification History */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-foreground block">Notification History</span>
        <div className="flex flex-col gap-2">
          {commEntries.map((entry) => {
            const hasEmail = channel === 'EMAIL' || channel === 'BOTH';
            const hasSms = channel === 'SMS' || channel === 'BOTH';

            return (
              <div key={entry.key} className="space-y-1.5">
                <span className="text-xs text-muted-foreground">{entry.label}</span>
                <div className="flex flex-col gap-2">
                  {hasSms && (
                    <div className="flex items-center justify-between p-2.5 bg-secondary-bg/20 border border-card-border/60 rounded-xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground">SMS</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          entry.smsSent ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground/60'
                        }`}>
                          {entry.smsSent ? 'SENT' : 'PENDING'}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={resending === `${entry.eventType}_SMS`}
                        onClick={() => handleResend(entry.eventType, 'SMS')}
                        className="text-[10px] h-6 px-2 gap-1 shrink-0"
                      >
                        <RotateCw className={`size-3 ${resending === `${entry.eventType}_SMS` ? 'animate-spin' : ''}`} />
                        {resending === `${entry.eventType}_SMS` ? 'Sending...' : 'Resend'}
                      </Button>
                    </div>
                  )}
                  {hasEmail && (
                    <div className="flex items-center justify-between p-2.5 bg-secondary-bg/20 border border-card-border/60 rounded-xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground">Email</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          entry.emailSent ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground/60'
                        }`}>
                          {entry.emailSent ? 'SENT' : 'PENDING'}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={resending === `${entry.eventType}_EMAIL`}
                        onClick={() => handleResend(entry.eventType, 'EMAIL')}
                        className="text-[10px] h-6 px-2 gap-1 shrink-0"
                      >
                        <RotateCw className={`size-3 ${resending === `${entry.eventType}_EMAIL` ? 'animate-spin' : ''}`} />
                        {resending === `${entry.eventType}_EMAIL` ? 'Sending...' : 'Resend'}
                      </Button>
                    </div>
                  )}
                  {!hasEmail && !hasSms && (
                    <div className="p-2.5 bg-secondary-bg/20 border border-card-border/60 rounded-xl text-xs text-muted-foreground">
                      Notifications opted out (Channel set to None)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InlineCheckoutForm({ appointment, view, onCancel }: { appointment: any; view: any; onCancel: () => void }) {
  const ch = (appointment?.confirmationChannel || appointment?.confirmation_channel) as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE' || 'EMAIL';
  const [channel, setChannel] = useState(ch);
  const [draftChannel, setDraftChannel] = useState(ch);
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [isSavingChannel, setIsSavingChannel] = useState(false);

  useEffect(() => {
    setChannel(ch);
    setDraftChannel(ch);
    setIsEditingChannel(false);
  }, [appointment?.id]);

  const handleSaveChannel = async () => {
    setIsSavingChannel(true);
    const res = await updateConfirmationChannelAction({
      appointmentId: appointment.id,
      confirmationChannel: draftChannel,
    });
    if (res.success) {
      setChannel(draftChannel);
      appointment.confirmationChannel = draftChannel;
      appointment.confirmation_channel = draftChannel;
      setIsEditingChannel(false);
      if (view?.fetchData) view.fetchData();
    }
    setIsSavingChannel(false);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-base font-medium text-foreground">Checkout Patient</h3>
        <p className="text-xs text-muted-foreground">
          Review channel & finalize visit.
        </p>
      </div>

      <hr className="border-card-border/40" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Notification Channel</span>
          {!isEditingChannel ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditingChannel(true)} className="h-7 px-2.5 text-xs gap-1">
              <Pencil className="size-3.5" /> Edit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setDraftChannel(channel); setIsEditingChannel(false); }} className="h-7 px-2.5 text-xs gap-1">
                <X className="size-3.5" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSaveChannel} disabled={isSavingChannel || draftChannel === channel} className="h-7 px-2.5 text-xs gap-1 bg-slate-900 text-white rounded-md disabled:cursor-not-allowed">
                <Check className="size-3.5" /> {isSavingChannel ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        {isEditingChannel ? (
          <Select
            value={draftChannel}
            onChange={(e) => setDraftChannel(e.target.value as any)}
            className="text-sm w-full"
            options={[
              { value: 'EMAIL', label: 'Email' },
              { value: 'SMS', label: 'SMS' },
              { value: 'BOTH', label: 'Email & SMS' },
              { value: 'NONE', label: 'None' },
            ]}
          />
        ) : (
          <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">
            {channel === 'EMAIL' ? 'Email' : channel === 'SMS' ? 'SMS' : channel === 'BOTH' ? 'Email & SMS' : 'None'}
          </div>
        )}
      </div>

      <div className="p-3 border bg-amber-500/5 border-amber-500/20">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Automated Communication</span>
        <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
          Confirming will complete the visit and send a Thank You & Review Request message via the selected channel.
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">
          Cancel
        </button>
        <button
          onClick={() => { view.handleCheckoutComplete(appointment.id); onCancel(); }}
          disabled={view.isPending || isEditingChannel}
          className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40"
        >
          {view.isPending ? 'Sending...' : 'Confirm & Send'}
        </button>
      </div>
    </div>
  );
}
