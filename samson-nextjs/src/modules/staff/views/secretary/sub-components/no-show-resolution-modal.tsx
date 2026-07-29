'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, Calendar, RefreshCw, X, Pencil, Check, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { AppointmentRescheduleForm } from './appointment-reschedule-form';
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

  const [resolution, setResolution] = useState<'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'RESCHEDULE'>('COMPLETED');
  const [reason, setReason] = useState('Secretary forgot to click check-in');
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
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-text-primary">Select Resolution Action</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setResolution('COMPLETED');
                  setReason('Secretary forgot to click check-in');
                }}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  resolution === 'COMPLETED'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                    : 'border-card-border bg-card/50 text-text-secondary hover:border-text-muted'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Mark Completed</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResolution('CONFIRMED_NO_SHOW');
                  setReason('Patient failed to arrive for appointment');
                }}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  resolution === 'CONFIRMED_NO_SHOW'
                    ? 'border-red-500 bg-red-500/10 text-red-500'
                    : 'border-card-border bg-card/50 text-text-secondary hover:border-text-muted'
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                <span>Keep No-Show</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResolution('RESCHEDULE');
                  setReason('Patient arrived late; rescheduling to new slot');
                }}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  (resolution as string) === 'RESCHEDULE'
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                    : 'border-card-border bg-card/50 text-text-secondary hover:border-text-muted'
                }`}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reschedule</span>
              </button>
            </div>
          </div>
          )}

          {/* Notification Channel Block - Only visible on Mark Completed */}
          {resolution === 'COMPLETED' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">Notification Channel</span>
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
              <label className="text-xs font-bold text-text-primary">Reason for Resolution</label>
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

          {resolution === 'RESCHEDULE' && (
            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => view.setResolveAppt(null)}
                className="text-xs h-9 px-4 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleRescheduleFormSubmit}
                disabled={view.isPending}
                className="text-xs h-9 px-5 font-bold rounded-xl border-none bg-primary text-primary-foreground"
              >
                {view.isPending ? 'Saving...' : 'Confirm'}
              </Button>
            </div>
          )}

          {resolution === 'COMPLETED' && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-500 text-xs font-bold">
                <MessageSquare className="h-4 w-4" />
                <span>Automated Patient Communication</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Clicking <strong>Submit Resolution</strong> will finalize this visit and automatically send a <strong>Thank You & Post-Care Review Request</strong> message to the patient.
              </p>
            </div>
          )}

          {resolution === 'CONFIRMED_NO_SHOW' && (
            <div className="p-3 border bg-red-500/5 border-red-500/20 rounded-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-500">No-Show Notice</span>
              <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Clicking Submit Resolution will keep this appointment marked as <strong>Confirmed No-Show</strong> in system audit logs.
              </div>
            </div>
          )}

          {resolution !== 'RESCHEDULE' && (
            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => view.setResolveAppt(null)}
                className="text-xs h-9 px-4 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e as any)}
                disabled={view.isPending}
                className={`text-xs h-9 px-5 font-bold rounded-xl border-none ${
                  resolution === 'COMPLETED'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
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
