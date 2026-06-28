import React from 'react';
import { Button } from '@/components/ui/button';
import { CLINIC_SERVICES } from '../../hooks/use-doctor-dashboard';

interface ActiveSessionDiagnosticsProps {
  clinicalNotes: string;
  setClinicalNotes: (value: string) => void;
  selectedServices: string[];
  handleServiceToggle: (name: string) => void;
  handleFinalizeTreatment: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function ActiveSessionDiagnostics({
  clinicalNotes,
  setClinicalNotes,
  selectedServices,
  handleServiceToggle,
  handleFinalizeTreatment,
  isSubmitting,
}: ActiveSessionDiagnosticsProps) {
  return (
    <form
      onSubmit={handleFinalizeTreatment}
      className="lg:col-span-8 bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-lg flex flex-col gap-6"
    >
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Treatment Details</h3>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="doctor-notes" className="text-xs font-semibold text-text-secondary">
          Clinician Diagnostics & Treatment Notes
        </label>
        <textarea
          id="doctor-notes"
          required
          value={clinicalNotes}
          onChange={(e) => setClinicalNotes(e.target.value)}
          placeholder="Enter procedural remarks, dental charting notes, or recovery instructions..."
          rows={4}
          className="px-3.5 py-2.5 rounded-xl border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
        />
      </div>

      {/* Service Check-grid */}
      <div className="flex flex-col gap-3 mt-2">
        <label className="text-xs font-semibold text-text-secondary">
          Attach Completed Treatments (Drafts builder)
        </label>
        <div className="flex flex-col gap-2">
          {CLINIC_SERVICES.map((svc) => (
            <label
              key={svc.id}
              className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-secondary-bg/50 cursor-pointer text-xs"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(svc.name)}
                  onChange={() => handleServiceToggle(svc.name)}
                />
                <span className="font-bold text-text-primary">{svc.name}</span>
              </div>
              <span className="font-semibold text-text-muted">${svc.price}</span>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="self-start mt-2">
        {isSubmitting ? 'Finalizing Treatment...' : 'Finalize & Queue Invoice'}
      </Button>
    </form>
  );
}
