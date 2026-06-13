import React from 'react';
import { Button } from '@/components/ui/button';
import type { ActivePatient } from '../../hooks/use-doctor-dashboard';

interface PatientQueueListProps {
  queue: ActivePatient[];
  handleStartTreatment: (patient: ActivePatient) => void;
}

export function PatientQueueList({ queue, handleStartTreatment }: PatientQueueListProps) {
  return (
    <div className="flex flex-col gap-4">
      {queue.map((patient) => (
        <div
          key={patient.id}
          className="p-5 rounded-2xl border border-card-border bg-card flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col gap-1">
            <span
              className={`inline-flex self-start px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                patient.status === 'CHECKED_IN'
                  ? 'bg-accent-blue-bg text-accent-blue-text'
                  : 'bg-secondary-bg text-text-secondary'
              }`}
            >
              {patient.status === 'CHECKED_IN' ? 'Ready (Checked-In)' : 'Scheduled'}
            </span>
            <h4 className="text-base font-bold text-text-primary mt-1">{patient.name}</h4>
            <p className="text-xs text-text-muted">⏳ Timing: {patient.time} | Treatment: {patient.serviceName}</p>
          </div>
          <Button
            disabled={patient.status !== 'CHECKED_IN'}
            size="sm"
            onClick={() => handleStartTreatment(patient)}
            className="sm:self-center"
          >
            Start Treatment
          </Button>
        </div>
      ))}

      {queue.length === 0 && (
        <div className="text-center py-12 border border-dashed border-card-border rounded-3xl text-sm text-text-muted">
          All treatments rendered today! No active patients in queue.
        </div>
      )}
    </div>
  );
}
