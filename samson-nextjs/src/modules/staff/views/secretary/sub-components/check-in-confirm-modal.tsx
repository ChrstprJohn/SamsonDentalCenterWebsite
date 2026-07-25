'use client';

import { CheckCircle2, UserCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CheckInConfirmModal({ view }: { view: any }) {
  const appointment = view.checkInAppt;

  if (!appointment) return null;

  const handleConfirmCheckIn = () => {
    view.handleCheckIn(appointment.id);
    view.setCheckInAppt(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-card-border rounded-3xl p-6 w-full max-w-md shadow-xl flex flex-col gap-5 relative">
        <button
          onClick={() => view.setCheckInAppt(null)}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-1 text-center items-center">
          <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-2">
            <UserCheck className="h-6 w-6" />
          </div>
          <span className="text-xs font-black text-cyan-500 uppercase tracking-wider">Patient Check-In</span>
          <h3 className="text-lg font-extrabold text-text-primary">
            Check In {appointment.patient?.firstName} {appointment.patient?.lastName}?
          </h3>
          <p className="text-xs text-text-secondary max-w-xs mt-1">
            Scheduled for {appointment.service?.name} with Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}.
          </p>
        </div>

        <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex flex-col gap-1">
          <span className="text-xs font-bold text-cyan-500">Accidental Check-In Safeguard</span>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Patient will be marked as present in clinic and moved to <strong>Checked In</strong> status.
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => view.setCheckInAppt(null)}
            className="text-xs h-9 px-4 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmCheckIn}
            disabled={view.isPending}
            className="text-xs h-9 px-5 font-bold rounded-xl border-none bg-cyan-500 hover:bg-cyan-600 text-white flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Confirm Check-In</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
