'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, Calendar, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NoShowResolutionModal({ view }: { view: any }) {
  const appointment = view.resolveAppt;
  const [resolution, setResolution] = useState<'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'RESCHEDULE'>('COMPLETED');
  const [reason, setReason] = useState('Secretary forgot to click check-in');
  const [newDate, setNewDate] = useState(view.todayStr || '');
  const [newTime, setNewTime] = useState('10:00');
  const [newDoctorId, setNewDoctorId] = useState(appointment?.doctorId || '');

  useEffect(() => {
    if (appointment) {
      setNewDoctorId(appointment.doctorId || '');
    }
  }, [appointment]);

  if (!appointment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a reason for resolving this no-show.');
      return;
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

        <div className="flex flex-col gap-1">
          <span className="text-xs font-black text-amber-500 uppercase tracking-wider">No-Show Resolution</span>
          <h3 className="text-lg font-extrabold text-text-primary">
            Resolve {appointment.patient?.firstName} {appointment.patient?.lastName}'s Slot
          </h3>
          <p className="text-xs text-text-secondary">
            Original Slot: {appointment.date} ({appointment.startTime?.substring(0, 5)} - {appointment.endTime?.substring(0, 5)})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  resolution === 'RESCHEDULE'
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                    : 'border-card-border bg-card/50 text-text-secondary hover:border-text-muted'
                }`}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reschedule</span>
              </button>
            </div>
          </div>

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

          {resolution === 'RESCHEDULE' && (
            <div className="flex flex-col gap-3 p-3 bg-secondary-bg border border-card-border rounded-2xl">
              <span className="text-xs font-extrabold text-cyan-500">New Slot Details</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-text-muted">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full text-xs p-2 bg-card border border-card-border rounded-xl text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted">Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                    className="w-full text-xs p-2 bg-card border border-card-border rounded-xl text-text-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {resolution === 'COMPLETED' && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-500 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Will complete appointment and send Thank You & Post-Care Review Request message to patient.</span>
            </div>
          )}

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
              type="submit"
              disabled={view.isPending}
              className={`text-xs h-9 px-5 font-bold rounded-xl border-none ${
                resolution === 'COMPLETED'
                  ? 'bg-emerald-500 text-white'
                  : resolution === 'CONFIRMED_NO_SHOW'
                  ? 'bg-red-500 text-white'
                  : 'bg-cyan-500 text-white'
              }`}
            >
              Submit Resolution
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
