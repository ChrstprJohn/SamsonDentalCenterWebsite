'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ArrowLeft, UserRound, MessageSquare, Mail, RotateCw, Pencil, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { AppointmentRescheduleForm, isRescheduleFormComplete } from './appointment-reschedule-form';
import { AppointmentDetailPane } from './appointment-detail-pane';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';
import { resendNotificationAction } from '@/modules/appointments/actions/status/resend-notification.action';
import { useToast } from '@/components/feedback/toast-container';

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


export function CheckInDetailPane({ view, onClose }: { view: any; onClose: () => void }) {
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [showUndoForm, setShowUndoForm] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isEditingGuestInfo, setIsEditingGuestInfo] = useState(false);
  const [checkInReason, setCheckInReason] = useState('');
  const [checkInReasonMode, setCheckInReasonMode] = useState('');
  const [checkInCustomReason, setCheckInCustomReason] = useState('');
  const [checkoutReason, setCheckoutReason] = useState('');
  const [checkoutReasonMode, setCheckoutReasonMode] = useState('');
  const [checkoutCustomReason, setCheckoutCustomReason] = useState('');
  const [undoReason, setUndoReason] = useState('');
  const [undoReasonMode, setUndoReasonMode] = useState('');
  const [undoCustomReason, setUndoCustomReason] = useState('');
  const [resolveMode, setResolveMode] = useState<'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'CHECKED_IN'>('CONFIRMED_NO_SHOW');
  const [resolveReason, setResolveReason] = useState('');
  const [showCustomReason, setShowCustomReason] = useState(false);

  const resolveReasonOptions: Record<string, string[]> = {
    CHECKED_IN: ['Patient arrived late - checked in directly', 'Check-in window passed before secretary clicked check-in', 'Patient is currently in waiting room / clinic'],
    COMPLETED: ['Visit completed but status updated late', 'Patient was seen but not checked in', 'Status corrected after visit'],
    CONFIRMED_NO_SHOW: ['Patient failed to arrive for appointment', 'Patient arrived after closing', 'Patient refused treatment'],
  };
  const [selectedPreset, setSelectedPreset] = useState('');
  const appointment = view.checkInAppt || view.checkoutAppt || view.viewAppt || view.resolveAppt || view.rescheduleAppt;

  const ch = (appointment?.confirmationChannel || appointment?.confirmation_channel) as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE' || 'EMAIL';
  const [inlineChannel, setInlineChannel] = useState(ch);
  const [draftInlineChannel, setDraftInlineChannel] = useState(ch);
  const [isEditingInlineChannel, setIsEditingInlineChannel] = useState(false);
  const [isSavingInlineChannel, setIsSavingInlineChannel] = useState(false);
  const selectionMode = view.checkInAppt ? 'checkin' : view.checkoutAppt ? 'checkout' : view.viewAppt ? 'details' : view.resolveAppt ? 'resolve' : view.rescheduleAppt ? 'reschedule' : null;

  const resetActionDrafts = useCallback((channel = ch) => {
    setShowCheckInForm(false);
    setShowResolveForm(false);
    setShowRescheduleForm(false);
    setShowUndoForm(false);
    setShowCheckoutForm(false);
    setIsEditingGuestInfo(false);
    setCheckInReason('');
    setCheckInReasonMode('');
    setCheckInCustomReason('');
    setCheckoutReason('');
    setCheckoutReasonMode('');
    setCheckoutCustomReason('');
    setUndoReason('');
    setUndoReasonMode('');
    setUndoCustomReason('');
    setResolveMode('CONFIRMED_NO_SHOW');
    setResolveReason('');
    setShowCustomReason(false);
    setSelectedPreset('');
    setInlineChannel(channel);
    setDraftInlineChannel(channel);
    setIsEditingInlineChannel(false);
  }, [ch]);

  const handleSaveInlineChannel = async () => {
    if (!appointment) return;
    setIsSavingInlineChannel(true);
    const res = await updateConfirmationChannelAction({
      appointmentId: appointment.id,
      confirmationChannel: draftInlineChannel,
    });
    if (res.success) {
      setInlineChannel(draftInlineChannel);
      appointment.confirmationChannel = draftInlineChannel;
      appointment.confirmation_channel = draftInlineChannel;
      setIsEditingInlineChannel(false);
      if (view?.fetchData) view.fetchData();
    }
    setIsSavingInlineChannel(false);
  };

  const prevApptId = useRef(appointment?.id);
  const prevSelectionMode = useRef(selectionMode);
  const prevSelectionVersion = useRef(view.selectionVersion);
  useEffect(() => {
    if (
      appointment?.id !== prevApptId.current ||
      selectionMode !== prevSelectionMode.current ||
      view.selectionVersion !== prevSelectionVersion.current
    ) {
      prevApptId.current = appointment?.id;
      prevSelectionMode.current = selectionMode;
      prevSelectionVersion.current = view.selectionVersion;
      resetActionDrafts();
    }
  }, [appointment?.id, resetActionDrafts, selectionMode, view.selectionVersion]);

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

  const paneType = selectionMode;

  const paneTitle = paneType === 'details' && showRescheduleForm ? 'Reschedule Appointment' : paneType === 'details' && showUndoForm ? 'Undo Check-In' : paneType === 'details' ? 'Appointment Details' : paneType === 'checkin' ? 'Check In Patient' : paneType === 'checkout' ? 'Checkout Patient' : paneType === 'resolve' ? 'Resolve No-Show' : paneType === 'reschedule' ? 'Reschedule Appointment' : '';

  const returnToDetails = () => {
    resetActionDrafts();
    view.clearSelection();
    view.setViewAppt(appointment);
  };

  const handleHeaderBack = () => {
    if (paneType === 'details' && showRescheduleForm) {
      returnToDetails();
      return;
    }
    if (paneType === 'details' && showUndoForm) {
      returnToDetails();
      return;
    }
    if (paneType === 'checkin' || paneType === 'checkout' || paneType === 'resolve' || paneType === 'reschedule') {
      returnToDetails();
      return;
    }
    onClose();
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <div className="flex items-center gap-2 p-4 border-b border-border shrink-0">
        <button onClick={handleHeaderBack} className="p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0">
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="text-base font-medium text-foreground truncate">
            {paneTitle}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {paneType === 'details' && showRescheduleForm
              ? 'Update date, time, dentist, or service details.'
              : paneType === 'checkin'
                ? 'Confirm the patient has arrived for their appointment.'
                : paneType === 'checkout'
                  ? 'Review the visit and finalize checkout.'
                  : paneType === 'resolve'
                    ? 'Review the no-show and choose a resolution.'
                    : paneType === 'details' && showUndoForm
                      ? 'Return the patient to the upcoming queue.'
                      : paneType === 'details'
                        ? `Ref #${appointment.id.slice(0, 8)}`
                        : 'Review the warning and confirm this visit action.'}
          </span>
        </div>
      </div>

      {paneType === 'details' && !showRescheduleForm && !showUndoForm ? (
        <AppointmentDetailPane
          key={`${appointment.id}-${view.selectionVersion ?? 0}`}
          view={view}
          appointment={appointment}
          activeTab="upcoming"
          compact
          hideActions
          onEditingGuestInfoChange={setIsEditingGuestInfo}
        />
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
          <div className="px-4 py-4 space-y-4">
            {paneType === 'checkin' && (
              <CheckInContent
                appointment={appointment}
                view={view}
                onClose={onClose}
                reasonMode={checkInReasonMode}
                customReason={checkInCustomReason}
                onReasonSelect={(value) => {
                  setCheckInReasonMode(value);
                  setCheckInReason(value === 'CUSTOM' ? checkInCustomReason : value);
                }}
                onCustomReasonChange={(value) => {
                  setCheckInCustomReason(value);
                  if (checkInReasonMode === 'CUSTOM') setCheckInReason(value);
                }}
              />
            )}
            {paneType === 'checkout' && (
              <CheckoutContent
                appointment={appointment}
                view={view}
                reasonMode={checkoutReasonMode}
                customReason={checkoutCustomReason}
                onReasonSelect={(value) => {
                  setCheckoutReasonMode(value);
                  setCheckoutReason(value === 'CUSTOM' ? checkoutCustomReason : value);
                }}
                onCustomReasonChange={(value) => {
                  setCheckoutCustomReason(value);
                  if (checkoutReasonMode === 'CUSTOM') setCheckoutReason(value);
                }}
              />
            )}
            {paneType === 'resolve' && <ResolveContent view={view} onClose={onClose} />}
            {paneType === 'details' && appointment.status === 'CHECKED_IN' && showUndoForm && (
              <UndoCheckInContent
                appointment={appointment}
                view={view}
                onClose={() => setShowUndoForm(false)}
                reasonMode={undoReasonMode}
                customReason={undoCustomReason}
                onReasonSelect={(value) => {
                  setUndoReasonMode(value);
                  setUndoReason(value === 'CUSTOM' ? undoCustomReason : value);
                }}
                onCustomReasonChange={(value) => {
                  setUndoCustomReason(value);
                  if (undoReasonMode === 'CUSTOM') setUndoReason(value);
                }}
              />
            )}
            {paneType === 'reschedule' && <StandaloneReschedule view={view} onClose={returnToDetails} />}
            {paneType === 'details' && appointment.status === 'NO_SHOW' && showRescheduleForm && (
              <div className="[&_form]:!border-t-0 [&_form]:!pt-0">
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
                  confirmationChannel={appointment.confirmationChannel || (appointment as any).confirmation_channel || 'EMAIL'}
                  onConfirmationChannelChange={(channel) => {
                    appointment.confirmationChannel = channel;
                    (appointment as any).confirmation_channel = channel;
                  }}
                  isSubmitting={view.isPending}
                  noFooter
                  onServiceSelect={() => {}}
                  onDoctorSelect={(docId) => view.setRescheduleDoctor(docId)}
                  onDateSelect={(d) => view.setRescheduleDate(d)}
                  onStartTimeChange={(t) => view.setRescheduleTime(t)}
                  onEndTimeChange={(t) => view.setRescheduleEndTime?.(t)}
                  onJustificationChange={(j) => view.setRescheduleJustification(j)}
                  onSubmit={() => { view.handleRescheduleSubmit(); }}
                  onBack={returnToDetails}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {paneType !== 'reschedule' && (
        <div className="shrink-0 border-t border-border px-4 py-3">
          {isEditingGuestInfo && (
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center mb-3">
              Please finish editing or save guest information before taking action.
            </p>
          )}
          <div className={`flex gap-2 ${isEditingGuestInfo ? 'pointer-events-none opacity-40' : ''}`}>
            {paneType === 'details' && appointment.status === 'NO_SHOW' && showRescheduleForm ? (() => {
              const isFormValid = isRescheduleFormComplete({
                serviceId: appointment.serviceId,
                doctorId: view.rescheduleDoctor || appointment.doctorId,
                date: view.rescheduleDate,
                startTime: view.rescheduleTime,
                endTime: view.rescheduleEndTime,
                justification: view.rescheduleJustification,
              });
              return (
                <>
                  <button onClick={() => { view.handleRescheduleSubmit(); }} disabled={view.isPending || !isFormValid} className="flex-1 h-[42px] text-sm font-medium bg-primary text-white hover:bg-primary/90 rounded-xl disabled:opacity-50">
                    {view.isPending ? 'Saving...' : 'Confirm'}
                  </button>
                  <button onClick={returnToDetails} className="flex-1 h-[42px] text-sm font-medium border border-card-border text-foreground bg-transparent hover:bg-muted rounded-xl">
                    Back
                  </button>
                </>
              );
            })() : paneType === 'details' && appointment.status === 'APPROVED' && !showCheckInForm && (
                <button onClick={() => { resetActionDrafts(); view.openCheckIn(appointment); }} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl">
                Check In
              </button>
            )}
            {paneType === 'details' && appointment.status === 'APPROVED' && showCheckInForm && null}
            {paneType === 'details' && appointment.status === 'NO_SHOW' && !showResolveForm && (
              <>
                <button onClick={() => { resetActionDrafts(); view.openResolve(appointment); }} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl">
                  Resolve
                </button>
              </>
            )}
            {paneType === 'details' && appointment.status === 'NO_SHOW' && showResolveForm && (
              <div className="w-full flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">Resolution Action <span className="text-destructive">*</span></span>
                  <span className="text-xs text-muted-foreground">Select an action for resolving this no-show appointment.</span>
                </div>
                <div className="flex flex-col gap-2">
                  {/* Keep No-Show */}
                  <button type="button" onClick={() => { setResolveMode('CONFIRMED_NO_SHOW'); setSelectedPreset(''); setResolveReason(''); setShowCustomReason(false); }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${resolveMode === 'CONFIRMED_NO_SHOW' ? 'border-red-500 bg-red-500/10 ring-1 ring-red-500/50' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'}`}>
                    <div className={`size-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${resolveMode === 'CONFIRMED_NO_SHOW' ? 'border-red-500 bg-red-500' : 'border-muted-foreground/40'}`}>
                      {resolveMode === 'CONFIRMED_NO_SHOW' && <div className="size-1 rounded-full bg-white" />}
                    </div>
                    <span className={`text-xs font-semibold ${resolveMode === 'CONFIRMED_NO_SHOW' ? 'text-red-500' : 'text-foreground'}`}>Keep No-Show</span>
                  </button>
                  {/* Check In */}
                  <button type="button" onClick={() => { setResolveMode('CHECKED_IN'); setSelectedPreset(''); setResolveReason('Secretary forgot to check-in patient during active window'); setShowCustomReason(false); }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${resolveMode === 'CHECKED_IN' ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'}`}>
                    <div className={`size-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${resolveMode === 'CHECKED_IN' ? 'border-blue-500 bg-blue-500' : 'border-muted-foreground/40'}`}>
                      {resolveMode === 'CHECKED_IN' && <div className="size-1 rounded-full bg-white" />}
                    </div>
                    <span className={`text-xs font-semibold ${resolveMode === 'CHECKED_IN' ? 'text-blue-600' : 'text-foreground'}`}>Check In</span>
                  </button>
                  <button type="button" onClick={() => { setResolveMode('COMPLETED'); setSelectedPreset(''); setResolveReason(''); setShowCustomReason(false); }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${resolveMode === 'COMPLETED' ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/50' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'}`}>
                    <div className={`size-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${resolveMode === 'COMPLETED' ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground/40'}`}>
                      {resolveMode === 'COMPLETED' && <div className="size-1 rounded-full bg-white" />}
                    </div>
                    <span className={`text-xs font-semibold ${resolveMode === 'COMPLETED' ? 'text-emerald-600' : 'text-foreground'}`}>Checkout (Mark Completed)</span>
                  </button>
                </div>

                {/* Dynamic Notice Box right after Resolution Action choice */}
                {resolveMode === 'CHECKED_IN' && (
                  <div className="p-3 border bg-blue-500/5 border-blue-500/20 rounded-2xl">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">Late Check-In Notice</span>
                    <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      Clicking <strong>Submit Resolution</strong> will mark this patient as <strong>Checked In</strong> so staff and doctors know they are currently in the clinic.
                    </div>
                  </div>
                )}

                {resolveMode === 'COMPLETED' && (
                  <div className="p-3 border bg-amber-500/5 border-amber-500/20 rounded-2xl">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500">Completion Notice</span>
                    <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      This will complete the visit and send the selected post-care message.
                    </div>
                  </div>
                )}

                {resolveMode === 'CONFIRMED_NO_SHOW' && (
                  <div className="p-3 border bg-red-500/5 border-red-500/20 rounded-2xl">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-red-500">No-Show Notice</span>
                    <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      Clicking <strong>Submit Resolution</strong> will keep this appointment marked as <strong>Confirmed No-Show</strong> in system audit logs.
                    </div>
                  </div>
                )}

                {resolveMode === 'COMPLETED' && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">Notification Channel <span className="text-destructive">*</span></span>
                        <span className="text-xs text-muted-foreground">Which channel should be used to notify the patient?</span>
                      </div>
                      {!isEditingInlineChannel ? (
                        <Button variant="outline" size="sm" onClick={() => setIsEditingInlineChannel(true)} className="h-7 px-2.5 text-xs gap-1">
                          <Pencil className="size-3.5" /> Edit
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setDraftInlineChannel(inlineChannel); setIsEditingInlineChannel(false); }} className="h-7 px-2.5 text-xs gap-1">
                            <X className="size-3.5" /> Cancel
                          </Button>
                          <Button size="sm" onClick={handleSaveInlineChannel} disabled={isSavingInlineChannel || draftInlineChannel === inlineChannel} className="h-7 px-2.5 text-xs gap-1 bg-slate-900 text-white rounded-md disabled:cursor-not-allowed">
                            <Check className="size-3.5" /> {isSavingInlineChannel ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      )}
                    </div>

                    {isEditingInlineChannel ? (
                      <Select
                        value={draftInlineChannel}
                        onChange={(e) => setDraftInlineChannel(e.target.value as any)}
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
                        {inlineChannel === 'EMAIL' ? 'Email' : inlineChannel === 'SMS' ? 'SMS' : inlineChannel === 'BOTH' ? 'Email & SMS' : 'None'}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">Reason for Resolution <span className="text-destructive">*</span></span>
                    <span className="text-xs text-muted-foreground">Add a reason for resolving this no-show before confirming.</span>
                  </div>
                  <select value={selectedPreset} onChange={(e) => { const v = e.target.value; if (v === '__custom__') { setShowCustomReason(true); setResolveReason(''); } else { setShowCustomReason(false); setSelectedPreset(v); setResolveReason(v); } }} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border">
                    <option value="" disabled>Select a Reason</option>
                    {resolveReasonOptions[resolveMode].map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                    <option value="__custom__">Custom</option>
                  </select>
                  {showCustomReason && (
                    <textarea value={resolveReason} onChange={(e) => setResolveReason(e.target.value)} rows={2} placeholder="Type custom reason..." className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border resize-none" />
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={returnToDetails} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">
                    Back
                  </button>
                  <button onClick={async () => {
                    if (draftInlineChannel !== inlineChannel) {
                      await handleSaveInlineChannel();
                    }
                    view.handleResolveNoShowSubmit({ appointmentId: appointment.id, resolution: resolveMode, reason: resolveReason });
                  }} disabled={view.isPending || !resolveReason.trim()} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40">
                    {view.isPending ? 'Submitting...' : 'Submit Resolution'}
                  </button>
                </div>
              </div>
            )}
            {paneType === 'details' && appointment.status === 'CHECKED_IN' && !showUndoForm && !showCheckoutForm && (
              <>
                <button onClick={() => { resetActionDrafts(); setShowUndoForm(true); }} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">
                  Undo Check-In
                </button>
                <button onClick={() => { resetActionDrafts(); view.openCheckout(appointment); }} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl">
                  Checkout
                </button>
              </>
            )}

            {paneType === 'checkin' && (
              <>
                <button onClick={returnToDetails} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent rounded-xl">Back</button>
                <button onClick={() => view.handleCheckIn(appointment.id, checkInReason)} disabled={view.isPending || !checkInReason.trim()} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl disabled:opacity-40">{view.isPending ? 'Checking In...' : 'Confirm Check-In'}</button>
              </>
            )}
            {paneType === 'checkout' && (
              <>
                <button onClick={returnToDetails} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent rounded-xl">Back</button>
                <button onClick={() => view.handleCheckoutComplete(appointment.id, checkoutReason)} disabled={view.isPending || !checkoutReason.trim()} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl disabled:opacity-40">{view.isPending ? 'Sending...' : 'Confirm & Send'}</button>
              </>
            )}
            {paneType === 'details' && showUndoForm && (
              <>
                <button onClick={returnToDetails} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent rounded-xl">Back</button>
                <button onClick={() => view.handleUndoCheckIn(appointment.id, undoReason)} disabled={view.isPending || !undoReason.trim()} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground rounded-xl disabled:opacity-40">{view.isPending ? 'Reverting...' : 'Undo Check-In'}</button>
              </>
            )}
            {paneType === 'resolve' && (
              <>
                <button onClick={returnToDetails} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent rounded-xl">Back</button>
                <button onClick={() => (document.getElementById('resolve-form') as HTMLFormElement | null)?.requestSubmit()} disabled={view.isPending} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground rounded-xl disabled:opacity-40">{view.isPending ? 'Submitting...' : 'Submit Resolution'}</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckInContent({
  appointment,
  reasonMode,
  customReason,
  onReasonSelect,
  onCustomReasonChange,
}: {
  appointment: any;
  view: any;
  onClose: () => void;
  reasonMode: string;
  customReason: string;
  onReasonSelect: (value: string) => void;
  onCustomReasonChange: (value: string) => void;
}) {
  const reasonOptions = ['Patient arrived for appointment', 'Patient identity confirmed', 'Check-in completed by secretary'];

  return (
    <div className="flex flex-col gap-4">
      <InfoBox variant="cyan" title="Check-In Notice">
        Confirming will mark the patient as present and move the appointment to the Checked In queue.
      </InfoBox>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">Reason for Check-In <span className="text-destructive">*</span></span>
          <span className="text-xs text-muted-foreground">Add a reason for this check-in before confirming.</span>
        </div>
        <div className="relative flex items-center">
          <select
            value={reasonMode}
            onChange={(event) => onReasonSelect(event.target.value)}
            className="w-full px-4 pr-10 py-2.5 appearance-none rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
            required
          >
            <option value="" disabled>Select a Reason</option>
            {reasonOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            <option value="CUSTOM">Other / Custom Reason...</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
        {reasonMode === 'CUSTOM' && (
          <Textarea
            value={customReason}
            onChange={(event) => onCustomReasonChange(event.target.value)}
            placeholder="Enter check-in reason..."
            className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border min-h-[60px] resize-none"
            required
          />
        )}
      </div>
    </div>
  );
}

function UndoCheckInContent({
  reasonMode,
  customReason,
  onReasonSelect,
  onCustomReasonChange,
}: {
  appointment: any;
  view: any;
  onClose: () => void;
  reasonMode: string;
  customReason: string;
  onReasonSelect: (value: string) => void;
  onCustomReasonChange: (value: string) => void;
}) {
  const reasonOptions = ['Checked in by mistake', 'Patient was checked in too early', 'Status correction required'];

  return (
    <div className="flex flex-col gap-4">
      <InfoBox variant="amber" title="Status Change">
        This will remove the Checked In status and return the patient to the Upcoming queue.
      </InfoBox>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">Reason for Undo <span className="text-destructive">*</span></span>
          <span className="text-xs text-muted-foreground">Add a reason for reverting this check-in before confirming.</span>
        </div>
        <div className="relative flex items-center">
          <select
            value={reasonMode}
            onChange={(event) => onReasonSelect(event.target.value)}
            className="w-full px-4 pr-10 py-2.5 appearance-none rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
            required
          >
            <option value="" disabled>Select a Reason</option>
            {reasonOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            <option value="CUSTOM">Other / Custom Reason...</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
        {reasonMode === 'CUSTOM' && (
          <Textarea
            value={customReason}
            onChange={(event) => onCustomReasonChange(event.target.value)}
            placeholder="Enter undo reason..."
            className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border min-h-[60px] resize-none"
            required
          />
        )}
      </div>
    </div>
  );
}

function InfoBox({ variant, title, children }: { variant: 'cyan' | 'amber' | 'emerald' | 'red' | 'blue'; title: string; children: React.ReactNode }) {
  const colors = {
    blue: 'bg-blue-500/5 border-blue-500/20 text-blue-600',
    cyan: 'bg-cyan-500/5 border-cyan-500/20 text-cyan-600',
    amber: 'bg-amber-500/5 border-amber-500/20 text-amber-600',
    emerald: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600',
    red: 'bg-red-500/5 border-red-500/20 text-red-500',
  };
  return (
    <div className={`p-4 border rounded-2xl ${colors[variant]}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider">{title}</span>
      <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{children}</div>
    </div>
  );
}

function CheckoutContent({
  appointment,
  view,
  reasonMode,
  customReason,
  onReasonSelect,
  onCustomReasonChange,
}: {
  appointment: any;
  view?: any;
  reasonMode: string;
  customReason: string;
  onReasonSelect: (value: string) => void;
  onCustomReasonChange: (value: string) => void;
}) {
  const ch = (appointment?.confirmationChannel || appointment?.confirmation_channel) as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE' || 'EMAIL';
  const reasonOptions = [
    'Treatment completed and reviewed with patient',
    'Payment and visit details confirmed',
    'Checkout completed by secretary',
  ];

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
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">Checkout Reason <span className="text-destructive">*</span></span>
          <span className="text-xs text-muted-foreground">Add a reason for this checkout before confirming.</span>
        </div>
        <div className="relative flex items-center">
          <select
            value={reasonMode}
            onChange={(event) => onReasonSelect(event.target.value)}
            className="w-full px-4 pr-10 py-2.5 appearance-none rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
            required
          >
            <option value="" disabled>Select a Reason</option>
            {reasonOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            <option value="CUSTOM">Other / Custom Reason...</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
        {reasonMode === 'CUSTOM' && (
          <Textarea
            value={customReason}
            onChange={(event) => onCustomReasonChange(event.target.value)}
            placeholder="Enter checkout reason..."
            className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border min-h-[60px] resize-none"
            required
          />
        )}
      </div>

      {isEditingChannel && (
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center">
          Please finish editing or save your channel changes before completing checkout.
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">Notification Channel <span className="text-destructive">*</span></span>
            <span className="text-xs text-muted-foreground">Which channel should be used to notify the patient?</span>
          </div>
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

      <InfoBox variant="amber" title="Completion Notice">
        This will complete the visit and send the selected post-care message.
      </InfoBox>
    </div>
  );
}

function ResolveContent({ view, onClose }: { view: any; onClose: () => void }) {
  const appointment = view.resolveAppt;
  const ch = (appointment?.confirmationChannel || appointment?.confirmation_channel) as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE' || 'EMAIL';
  const [resolution, setResolution] = useState<'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'RESCHEDULE' | 'CHECKED_IN'>('CONFIRMED_NO_SHOW');
  const [reason, setReason] = useState('');
  const [reasonMode, setReasonMode] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [channel, setChannel] = useState(ch);
  const [draftChannel, setDraftChannel] = useState(ch);
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [isSavingChannel, setIsSavingChannel] = useState(false);

  useEffect(() => {
    setChannel(ch);
    setDraftChannel(ch);
    setIsEditingChannel(false);
  }, [appointment?.id]);

  if (!appointment) return null;

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

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    if (draftChannel !== channel) {
      await handleSaveChannel();
    }
    view.handleResolveNoShowSubmit({
      appointmentId: appointment.id,
      resolution,
      reason: reason.trim(),
    });
  };

  const selectResolution = (val: 'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'RESCHEDULE' | 'CHECKED_IN') => {
    setResolution(val);
    setReason('');
    setReasonMode('');
    setCustomReason('');
  };

  const reasonOptions = resolution === 'CHECKED_IN'
    ? ['Patient arrived late - checked in directly', 'Check-in window passed before secretary clicked check-in', 'Patient is currently in waiting room / clinic', 'CUSTOM']
    : resolution === 'COMPLETED'
      ? ['Visit completed but status updated late', 'Visit completed but status was not updated', 'System issue prevented status update', 'CUSTOM']
      : ['Patient failed to arrive for appointment', 'Patient confirmed they would not attend', 'Patient left before check-in was completed', 'CUSTOM'];

  const resolutionWarning = resolution === 'CHECKED_IN'
    ? { variant: 'blue' as const, title: 'Late Check-In Notice', text: 'This will set the appointment status to Checked In so staff and doctors know the patient is in the clinic.' }
    : resolution === 'COMPLETED'
      ? { variant: 'emerald' as const, title: 'Completion Notice', text: 'This will complete the visit and send the selected post-care message.' }
      : resolution === 'CONFIRMED_NO_SHOW'
        ? { variant: 'red' as const, title: 'No-Show Notice', text: 'This will keep the appointment marked as a confirmed no-show in the audit history.' }
        : { variant: 'cyan' as const, title: 'Reschedule Notice', text: 'This will open the reschedule details and move the appointment into the rescheduling workflow.' };

  const handleReasonSelect = (value: string) => {
    setReasonMode(value);
    setReason(value === 'CUSTOM' ? customReason : value);
  };

  const handleCustomReasonChange = (value: string) => {
    setCustomReason(value);
    if (reasonMode === 'CUSTOM') setReason(value);
  };

  return (
    <form id="resolve-form" className="flex flex-col gap-4" onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">Resolution Action <span className="text-destructive">*</span></span>
          <span className="text-xs text-muted-foreground">Select an action for resolving this no-show appointment.</span>
        </div>
        <div className="flex flex-col gap-2">
          {/* Keep No-Show */}
          <button
            type="button"
            onClick={() => selectResolution('CONFIRMED_NO_SHOW')}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
              resolution === 'CONFIRMED_NO_SHOW' ? 'border-red-500 bg-red-500/10 ring-1 ring-red-500/50' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'
            }`}
          >
            <div className={`size-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${resolution === 'CONFIRMED_NO_SHOW' ? 'border-red-500 bg-red-500' : 'border-muted-foreground/40'}`}>
              {resolution === 'CONFIRMED_NO_SHOW' && <div className="size-1 rounded-full bg-white" />}
            </div>
            <span className={`text-xs font-semibold ${resolution === 'CONFIRMED_NO_SHOW' ? 'text-red-500' : 'text-foreground'}`}>Keep No-Show</span>
          </button>

          {/* Check In */}
          <button
            type="button"
            onClick={() => selectResolution('CHECKED_IN')}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
              resolution === 'CHECKED_IN' ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'
            }`}
          >
            <div className={`size-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${resolution === 'CHECKED_IN' ? 'border-blue-500 bg-blue-500' : 'border-muted-foreground/40'}`}>
              {resolution === 'CHECKED_IN' && <div className="size-1 rounded-full bg-white" />}
            </div>
            <span className={`text-xs font-semibold ${resolution === 'CHECKED_IN' ? 'text-blue-600' : 'text-foreground'}`}>Check In</span>
          </button>

          {/* Checkout */}
          <button
            type="button"
            onClick={() => selectResolution('COMPLETED')}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
              resolution === 'COMPLETED' ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/50' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'
            }`}
          >
            <div className={`size-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${resolution === 'COMPLETED' ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground/40'}`}>
              {resolution === 'COMPLETED' && <div className="size-1 rounded-full bg-white" />}
            </div>
            <span className={`text-xs font-semibold ${resolution === 'COMPLETED' ? 'text-emerald-600' : 'text-foreground'}`}>Checkout (Mark Completed)</span>
          </button>

          {/* Reschedule */}
          <button
            type="button"
            onClick={() => selectResolution('RESCHEDULE')}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
              resolution === 'RESCHEDULE' ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/50' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'
            }`}
          >
            <div className={`size-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${resolution === 'RESCHEDULE' ? 'border-cyan-500 bg-cyan-500' : 'border-muted-foreground/40'}`}>
              {resolution === 'RESCHEDULE' && <div className="size-1 rounded-full bg-white" />}
            </div>
            <span className={`text-xs font-semibold ${resolution === 'RESCHEDULE' ? 'text-cyan-600' : 'text-foreground'}`}>Reschedule</span>
          </button>
        </div>
      </div>

      <InfoBox variant={resolutionWarning.variant} title={resolutionWarning.title}>
        {resolutionWarning.text}
      </InfoBox>

      {/* Notification Channel Block - Only visible on Checkout */}
      {resolution === 'COMPLETED' && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">Notification Channel <span className="text-destructive">*</span></span>
              <span className="text-xs text-muted-foreground">Which channel should be used to notify the patient?</span>
            </div>
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
      )}
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
          confirmationChannel={appointment.confirmationChannel || (appointment as any).confirmation_channel || 'EMAIL'}
          onConfirmationChannelChange={(nextChannel) => {
            appointment.confirmationChannel = nextChannel;
            (appointment as any).confirmation_channel = nextChannel;
          }}
          isSubmitting={view.isPending}
          noFooter
          noForm
          onServiceSelect={() => {}}
          onDoctorSelect={(doctorId) => view.setRescheduleDoctor(doctorId)}
          onDateSelect={(date) => view.setRescheduleDate(date)}
          onStartTimeChange={(time) => view.setRescheduleTime(time)}
          onEndTimeChange={(time) => view.setRescheduleEndTime?.(time)}
          onJustificationChange={(nextReason) => setReason(nextReason)}
          onSubmit={handleSubmit}
          onBack={onClose}
        />
      ) : (
        <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">Reason for Resolution <span className="text-destructive">*</span></span>
              <span className="text-xs text-muted-foreground">Add a reason for resolving this no-show before confirming.</span>
            </div>
            <div className="relative flex items-center">
              <select
                value={reasonMode}
                onChange={(e) => handleReasonSelect(e.target.value)}
                className="w-full px-4 pr-10 py-2.5 appearance-none rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                required
              >
                <option value="" disabled>Select a Reason</option>
                {reasonOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'CUSTOM' ? 'Other / Custom Reason...' : option}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            </div>
            {reasonMode === 'CUSTOM' && (
              <Textarea
                placeholder="Enter resolution reason..."
                value={customReason}
                onChange={(event) => handleCustomReasonChange(event.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border min-h-[60px] resize-none"
                required
              />
            )}
        </div>
      )}
    </form>
  );
}

function StandaloneReschedule({ view, onClose }: { view: any; onClose: () => void }) {
  const appointment = view.rescheduleAppt;
  if (!appointment) return null;

  const isFormComplete = isRescheduleFormComplete({
    serviceId: view.rescheduleService || appointment.serviceId,
    doctorId: view.rescheduleDoctor || appointment.doctorId,
    date: view.rescheduleDate,
    startTime: view.rescheduleTime,
    endTime: view.rescheduleEndTime || '',
    justification: view.rescheduleJustification || '',
  });

  return (
    <div className="flex flex-col gap-4">
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
        confirmationChannel={appointment.confirmationChannel || (appointment as any).confirmation_channel || 'EMAIL'}
        onConfirmationChannelChange={(channel) => {
          appointment.confirmationChannel = channel;
          (appointment as any).confirmation_channel = channel;
        }}
        isSubmitting={view.isPending}
        noFooter
        onServiceSelect={(sId) => view.setRescheduleService?.(sId)}
        onDoctorSelect={(docId) => view.setRescheduleDoctor(docId)}
        onDateSelect={(d) => view.setRescheduleDate(d)}
        onStartTimeChange={(t) => view.setRescheduleTime(t)}
        onEndTimeChange={(t) => view.setRescheduleEndTime?.(t)}
        onJustificationChange={(j) => view.setRescheduleJustification?.(j)}
        onSubmit={view.handleRescheduleSubmit}
        onBack={onClose}
      />
      <div className="flex gap-2 pt-3 border-t border-card-border/60">
        <Button onClick={view.handleRescheduleSubmit} disabled={view.isPending || !isFormComplete} className="flex-1 h-[42px] text-sm font-medium bg-primary text-white hover:bg-primary/90 rounded-xl disabled:opacity-50">
          {view.isPending ? 'Saving...' : 'Confirm'}
        </Button>
        <Button variant="outline" onClick={onClose} className="flex-1 h-[42px] text-sm font-medium">
          Back
        </Button>
      </div>
    </div>
  );
}

function MessageLogContent({ appointment, view }: { appointment: any; view: any }) {
  const { addToast } = useToast();
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
      addToast(res.error || 'Failed to resend notification.', 'error');
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
          <div className="space-y-2">
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
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center">
              Please finish editing or save your channel changes before confirming check-in.
            </p>
          </div>
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
          {channel === 'NONE' ? (
            <p className="text-xs text-muted-foreground italic">No notification channel selected.</p>
          ) : commEntries.map((entry) => {
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

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">Notification Channel <span className="text-destructive">*</span></span>
            <span className="text-xs text-muted-foreground">Which channel should be used to notify the patient?</span>
          </div>
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

      {isEditingChannel && (
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center">
          Please finish editing or save your channel changes before completing checkout.
        </p>
      )}

      <div className="p-4 border bg-amber-500/5 border-amber-500/20 rounded-2xl">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Completion Notice</span>
        <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
          Confirming will complete the visit and send a Thank You & Review Request message via the selected channel.
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 h-[42px] text-sm font-medium border border-input bg-background text-foreground hover:bg-accent transition-colors rounded-xl">
          Cancel
        </button>
        <button
          onClick={() => view.handleCheckoutComplete(appointment.id)}
          disabled={view.isPending || isEditingChannel}
          className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40"
        >
          {view.isPending ? 'Sending...' : 'Confirm & Send'}
        </button>
      </div>
    </div>
  );
}
