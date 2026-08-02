'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, Calendar, RefreshCw, X, Pencil, Check, MessageSquare, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { AppointmentRescheduleForm, isRescheduleFormComplete } from './appointment-reschedule-form';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';

function getPatientDisplayName(app: any): string {
  if (!app) return 'Patient';
  if (app.dependent) return `${app.dependent.firstName || ''} ${app.dependent.lastName || ''}`.trim() || 'Dependent';
  if (app.guestContact) return `${app.guestContact.firstName || ''} ${app.guestContact.lastName || ''}`.trim() || 'Guest Patient';
  if (app.patient) return `${app.patient.firstName || ''} ${app.patient.lastName || ''}`.trim() || 'Patient';
  return 'Guest Patient';
}

export function NoShowResolutionModal({ view }: { view: any }) {
  const appointment = view.resolveAppt;
  const ch = (appointment?.confirmationChannel || appointment?.confirmation_channel) as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE' || 'EMAIL';

  const [resolution, setResolution] = useState<'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'RESCHEDULE' | 'CHECKED_IN'>('CONFIRMED_NO_SHOW');
  const [reason, setReason] = useState('Patient failed to arrive for appointment');
  const [newDate, setNewDate] = useState(view.todayStr || '');
  const [newTime, setNewTime] = useState('10:00');
  const [newEndTime, setNewEndTime] = useState('10:30');
  const [newDoctorId, setNewDoctorId] = useState(appointment?.doctorId || '');

  const [channel, setChannel] = useState(ch);
  const [draftChannel, setDraftChannel] = useState(ch);
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [isSavingChannel, setIsSavingChannel] = useState(false);

  useEffect(() => {
    if (appointment) {
      setNewDoctorId(appointment.doctorId || '');
      setChannel(ch);
      setDraftChannel(ch);
      setIsEditingChannel(false);
    }
  }, [appointment]);

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

  const handleRescheduleFormSubmit = () => {
    const formatIso = (dateStr: string, timeStr: string) => {
      if (!dateStr || !timeStr) return undefined;
      const timeFormatted = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
      return `${dateStr}T${timeFormatted}Z`;
    };
    const startIso = formatIso(newDate, newTime);
    const endIso = newEndTime
      ? formatIso(newDate, newEndTime)
      : new Date(new Date(startIso!).getTime() + 30 * 60 * 1000).toISOString();
    view.handleResolveNoShowSubmit({
      appointmentId: appointment.id,
      resolution: 'RESCHEDULE',
      reason: reason.trim(),
      newDate,
      newStartTime: startIso,
      newEndTime: endIso,
      newDoctorId,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a reason for resolving this no-show.');
      return;
    }

    if (draftChannel !== channel) {
      await handleSaveChannel();
    }

    const payload: any = {
      appointmentId: appointment.id,
      resolution,
      reason: reason.trim(),
    };

    if (resolution === 'RESCHEDULE') {
      const startIso = newTime.includes(':00') || newTime.split(':').length === 3
        ? `${newDate}T${newTime}Z`
        : `${newDate}T${newTime}:00Z`;
      const endIso = new Date(new Date(startIso).getTime() + 30 * 60 * 1000).toISOString();
      payload.newDate = newDate;
      payload.newStartTime = startIso;
      payload.newEndTime = endIso;
      payload.newDoctorId = newDoctorId;
    }

    view.handleResolveNoShowSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-card-border rounded-3xl p-6 w-full max-w-lg shadow-xl flex flex-col gap-5 relative">
        <button
          onClick={() => view.setResolveAppt(null)}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {resolution !== 'RESCHEDULE' && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-black text-amber-500 uppercase tracking-wider">No-Show Resolution</span>
          <h3 className="text-lg font-extrabold text-text-primary">
            Resolve {getPatientDisplayName(appointment)}'s Slot
          </h3>
          <p className="text-xs text-text-secondary">
            Original Slot: {appointment.date} ({appointment.startTime?.substring(0, 5)} - {appointment.endTime?.substring(0, 5)})
          </p>
        </div>
        )}

        <div className="flex flex-col gap-4">
          {resolution !== 'RESCHEDULE' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-text-primary">Resolution Action <span className="text-destructive">*</span></span>
              <span className="text-xs text-text-secondary">Select an action for resolving this no-show appointment.</span>
            </div>
            <div className="flex flex-col gap-2">
              {/* Keep No-Show */}
              <button
                type="button"
                onClick={() => {
                  setResolution('CONFIRMED_NO_SHOW');
                  setReason('Patient failed to arrive for appointment');
                }}
                className={`w-full p-2.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  resolution === 'CONFIRMED_NO_SHOW'
                    ? 'border-red-500 bg-red-500/10 ring-1 ring-red-500/50'
                    : 'border-card-border bg-card/50 hover:border-text-muted hover:bg-card'
                }`}
              >
                <div className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  resolution === 'CONFIRMED_NO_SHOW' ? 'border-red-500 bg-red-500' : 'border-text-muted'
                }`}>
                  {resolution === 'CONFIRMED_NO_SHOW' && <div className="size-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <AlertCircle className={`size-4 ${resolution === 'CONFIRMED_NO_SHOW' ? 'text-red-500' : 'text-text-secondary'}`} />
                  <span className={`text-xs font-bold ${resolution === 'CONFIRMED_NO_SHOW' ? 'text-red-500' : 'text-text-primary'}`}>
                    Keep No-Show
                  </span>
                </div>
              </button>

              {/* Check In */}
              <button
                type="button"
                onClick={() => {
                  setResolution('CHECKED_IN');
                  setReason('Secretary forgot to check-in patient during active window');
                }}
                className={`w-full p-2.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  resolution === 'CHECKED_IN'
                    ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50'
                    : 'border-card-border bg-card/50 hover:border-text-muted hover:bg-card'
                }`}
              >
                <div className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  resolution === 'CHECKED_IN' ? 'border-blue-500 bg-blue-500' : 'border-text-muted'
                }`}>
                  {resolution === 'CHECKED_IN' && <div className="size-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <UserCheck className={`size-4 ${resolution === 'CHECKED_IN' ? 'text-blue-500' : 'text-text-secondary'}`} />
                  <span className={`text-xs font-bold ${resolution === 'CHECKED_IN' ? 'text-blue-500' : 'text-text-primary'}`}>
                    Check In
                  </span>
                </div>
              </button>

              {/* Checkout */}
              <button
                type="button"
                onClick={() => {
                  setResolution('COMPLETED');
                  setReason('Secretary forgot to click check-in during visit');
                }}
                className={`w-full p-2.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  resolution === 'COMPLETED'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/50'
                    : 'border-card-border bg-card/50 hover:border-text-muted hover:bg-card'
                }`}
              >
                <div className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  resolution === 'COMPLETED' ? 'border-emerald-500 bg-emerald-500' : 'border-text-muted'
                }`}>
                  {resolution === 'COMPLETED' && <div className="size-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <CheckCircle2 className={`size-4 ${resolution === 'COMPLETED' ? 'text-emerald-500' : 'text-text-secondary'}`} />
                  <span className={`text-xs font-bold ${resolution === 'COMPLETED' ? 'text-emerald-500' : 'text-text-primary'}`}>
                    Checkout (Mark Completed)
                  </span>
                </div>
              </button>

              {/* Reschedule */}
              <button
                type="button"
                onClick={() => {
                  setResolution('RESCHEDULE');
                  setReason('');
                }}
                className={`w-full p-2.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  (resolution as string) === 'RESCHEDULE'
                    ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/50'
                    : 'border-card-border bg-card/50 hover:border-text-muted hover:bg-card'
                }`}
              >
                <div className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  (resolution as string) === 'RESCHEDULE' ? 'border-cyan-500 bg-cyan-500' : 'border-text-muted'
                }`}>
                  {(resolution as string) === 'RESCHEDULE' && <div className="size-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <RefreshCw className={`size-4 ${(resolution as string) === 'RESCHEDULE' ? 'text-cyan-500' : 'text-text-secondary'}`} />
                  <span className={`text-xs font-bold ${(resolution as string) === 'RESCHEDULE' ? 'text-cyan-500' : 'text-text-primary'}`}>
                    Reschedule
                  </span>
                </div>
              </button>
              {/* Dynamic Notice Box right after Resolution Action choice */}
              {resolution === 'CHECKED_IN' && (
                <div className="p-3 border bg-blue-500/5 border-blue-500/20 rounded-2xl">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">Late Check-In Notice</span>
                  <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    Clicking <strong>Submit Resolution</strong> will mark this patient as <strong>Checked In</strong> so staff and doctors know they are currently in the clinic.
                  </div>
                </div>
              )}

              {resolution === 'COMPLETED' && (
                <div className="p-3 border bg-amber-500/5 border-amber-500/20 rounded-2xl">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500">Completion Notice</span>
                  <div className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                    This will complete the visit and send the selected post-care message.
                  </div>
                </div>
              )}

              {resolution === 'CONFIRMED_NO_SHOW' && (
                <div className="p-3 border bg-red-500/5 border-red-500/20 rounded-2xl">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-red-500">No-Show Notice</span>
                  <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    Clicking <strong>Submit Resolution</strong> will keep this appointment marked as <strong>Confirmed No-Show</strong> in system audit logs.
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Notification Channel Block - Only visible on Mark Completed */}
          {resolution === 'COMPLETED' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-text-primary">Notification Channel <span className="text-destructive">*</span></span>
                  <span className="text-xs text-text-secondary">Which channel should be used to notify the patient?</span>
                </div>
                {!isEditingChannel ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingChannel(true)} className="h-7 px-2.5 text-xs gap-1">
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setDraftChannel(channel); setIsEditingChannel(false); }} className="h-7 px-2.5 text-xs gap-1">
                      Cancel
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
                <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-text-muted border-card-border cursor-default">
                  {channel === 'EMAIL' ? 'Email' : channel === 'SMS' ? 'SMS' : channel === 'BOTH' ? 'Email & SMS' : 'None'}
                </div>
              )}
            </div>
          )}

          {resolution !== 'RESCHEDULE' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-text-primary">Reason for Resolution <span className="text-destructive">*</span></span>
                <span className="text-xs text-text-secondary">Add a reason for resolving this no-show before confirming.</span>
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                required
                placeholder="Provide reason for audit log..."
                className="w-full text-xs p-3 bg-secondary-bg border border-card-border rounded-2xl text-text-primary outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {resolution === 'RESCHEDULE' && (
            <AppointmentRescheduleForm
              appointment={appointment}
              services={view.servicesList || []}
              serviceId={appointment.serviceId}
              doctorId={newDoctorId || appointment.doctorId}
              doctors={(view.doctorsList || []).map((d: any) => ({
                doctorId: d.id,
                doctorName: `${d.prefix || 'Dr.'} ${d.firstName} ${d.lastName}`,
              }))}
              date={newDate}
              activeServiceId={appointment.serviceId}
              activeDoctorId={appointment.doctorId}
              startTime={newTime}
              endTime={newEndTime}
              justification={reason}
              confirmationChannel={appointment.confirmationChannel || (appointment as any).confirmation_channel || 'EMAIL'}
              onConfirmationChannelChange={(channel) => {
                appointment.confirmationChannel = channel;
                (appointment as any).confirmation_channel = channel;
              }}
              isSubmitting={view.isPending}
              noFooter
              onServiceSelect={() => {}}
              onDoctorSelect={(docId) => setNewDoctorId(docId)}
              onDateSelect={(d) => setNewDate(d)}
              onStartTimeChange={(t) => setNewTime(t)}
              onEndTimeChange={(t) => setNewEndTime(t)}
              onJustificationChange={(j) => setReason(j)}
              onSubmit={handleRescheduleFormSubmit}
              onBack={() => view.setResolveAppt(null)}
            />
          )}

          {resolution === 'RESCHEDULE' && (() => {
            const isFormComplete = isRescheduleFormComplete({
              serviceId: appointment.serviceId,
              doctorId: newDoctorId || appointment.doctorId,
              date: newDate,
              startTime: newTime,
              endTime: newEndTime,
              justification: reason,
            });
            return (
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => view.setResolveAppt(null)}
                  className="text-xs h-9 px-4 rounded-xl"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleRescheduleFormSubmit}
                  disabled={view.isPending || !isFormComplete}
                  className="text-xs h-9 px-5 font-bold rounded-xl border-none bg-primary text-primary-foreground disabled:opacity-50"
                >
                  {view.isPending ? 'Saving...' : 'Confirm'}
                </Button>
              </div>
            );
          })()}



          {resolution !== 'RESCHEDULE' && (
            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => view.setResolveAppt(null)}
                className="text-xs h-9 px-4 rounded-xl"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e as any)}
                disabled={view.isPending}
                className={`text-xs h-9 px-5 font-bold rounded-xl border-none ${
                  resolution === 'CHECKED_IN'
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : resolution === 'COMPLETED'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Submit Resolution
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
