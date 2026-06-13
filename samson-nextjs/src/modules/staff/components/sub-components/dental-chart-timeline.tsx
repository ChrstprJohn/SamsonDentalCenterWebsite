import React from 'react';
import type { PatientHistoryRecord } from '../../hooks/use-doctor-dashboard';

interface DentalChartTimelineProps {
  history: PatientHistoryRecord[];
}

export function DentalChartTimeline({ history }: DentalChartTimelineProps) {
  return (
    <div className="lg:col-span-4 bg-card border border-card-border rounded-3xl p-6 shadow-lg flex flex-col gap-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Dental Chart Timeline</h3>

      {history.length > 0 ? (
        <div className="flex flex-col gap-4 relative pl-4 border-l border-card-border pr-1 max-h-[350px] overflow-y-auto">
          {history.map((h, idx) => (
            <div key={idx} className="flex flex-col gap-1 text-xs relative">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary-start border-2 border-card" />
              <span className="text-[10px] text-text-muted">{h.date}</span>
              <span className="font-bold text-text-primary">{h.serviceName}</span>
              <p className="text-text-secondary mt-1 leading-relaxed">{h.notes}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-text-muted border border-dashed border-card-border rounded-2xl">
          No past treatment logs recorded.
        </div>
      )}
    </div>
  );
}
