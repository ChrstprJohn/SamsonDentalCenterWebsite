'use client';

import { Button } from '@/components/ui/button';

export function BookSuccessPanel({ patientLabel, selectedDate, selectedTime, onReset }: { patientLabel: string; selectedDate: string; selectedTime: string; onReset: () => void }) {
  return (
    <div className="border border-card-border bg-card rounded-3xl p-8 max-w-md mx-auto shadow-md flex flex-col gap-6 text-center">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold text-text-primary">Appointment Booked</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          Appointment registered and auto-approved. Email confirmation sent if email was provided.
        </p>
      </div>
      <div className="bg-secondary-bg/20 border border-card-border/60 rounded-2xl p-4 text-xs flex flex-col gap-2 text-left w-full">
        <div><span className="text-text-muted">Patient: </span><span className="font-semibold text-text-primary">{patientLabel}</span></div>
        <div><span className="text-text-muted">Date: </span><span className="font-semibold text-text-primary">{selectedDate} @ {formatTimeLabel(selectedTime)}</span></div>
      </div>
      <Button variant="primary" className="flex-1 text-xs font-bold py-3" onClick={onReset}>Book Another</Button>
    </div>
  );
}

function formatTimeLabel(isoStr: string) {
  try {
    return new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' });
  } catch {
    return isoStr;
  }
}
