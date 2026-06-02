'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/feedback/toast-container';

interface PatientHistoryRecord {
  date: string;
  serviceName: string;
  notes: string;
}

interface ActivePatient {
  id: string;
  name: string;
  serviceName: string;
  time: string;
  status: 'SCHEDULED' | 'CHECKED_IN' | 'RENDERED';
  history: PatientHistoryRecord[];
}

const INITIAL_QUEUE: ActivePatient[] = [
  {
    id: 'ap-1',
    name: 'Diana Prince',
    serviceName: 'Orthodontic Braces Fit',
    time: '01:30 PM',
    status: 'CHECKED_IN',
    history: [
      { date: '2026-04-10', serviceName: 'Routine dental clean', notes: 'Plaque scaled. Gums in excellent condition.' },
      { date: '2026-03-01', serviceName: 'Panoramic X-Ray scan', notes: 'Wisdom teeth eruption normal. No extraction required.' },
    ],
  },
  {
    id: 'ap-2',
    name: 'Robert Vance',
    serviceName: 'Teeth Whitening (Laser)',
    time: '11:00 AM',
    status: 'SCHEDULED',
    history: [],
  },
];

interface AvailableServiceItem {
  id: string;
  name: string;
  price: number;
}

const CLINIC_SERVICES: AvailableServiceItem[] = [
  { id: 'cs-1', name: 'Tooth Extraction', price: 150 },
  { id: 'cs-2', name: 'Dental Filling', price: 120 },
  { id: 'cs-3', name: 'Standard Scaling & Polish', price: 90 },
];

export function DoctorDashboardView() {
  const [queue, setQueue] = useState<ActivePatient[]>(INITIAL_QUEUE);
  const [activeSession, setActiveSession] = useState<ActivePatient | null>(null);

  // Form states
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast } = useToast();

  const handleStartTreatment = (patient: ActivePatient) => {
    setActiveSession(patient);
    setClinicalNotes('');
    setSelectedServices([patient.serviceName]); // pre-select main service
  };

  const handleServiceToggle = (name: string) => {
    setSelectedServices((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handleFinalizeTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !clinicalNotes) {
      addToast('Please enter clinical diagnostics notes.', 'error');
      return;
    }

    setIsSubmitting(true);
    // Simulate invoice draft payload generation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    // Dynamic Draft Invoice payload structure
    const draftInvoicePayload = {
      patientName: activeSession.name,
      completedServices: selectedServices,
      clinicalNotes,
      generatedAt: new Date().toISOString(),
    };

    console.log('Generated Draft Invoice Payload:', draftInvoicePayload);

    // Remove from queue / update status to RENDERED
    setQueue((prev) => prev.filter((p) => p.id !== activeSession.id));

    addToast(`Clinical treatment rendered for ${activeSession.name}. Draft invoice queued!`, 'success');
    setActiveSession(null);
  };

  if (activeSession) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center border-b border-card-border pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-primary-start font-bold uppercase tracking-widest">Active Clinical Operatory Session</span>
            <h2 className="text-2xl font-extrabold text-text-primary">{activeSession.name}</h2>
          </div>
          <Button variant="secondary" onClick={() => setActiveSession(null)}>
            Back to Queue
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Diagnostic render form */}
          <form onSubmit={handleFinalizeTreatment} className="lg:col-span-8 bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-lg flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Treatment Details</h3>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="doctor-notes" className="text-xs font-semibold text-text-secondary">Clinician Diagnostics & Treatment Notes</label>
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
              <label className="text-xs font-semibold text-text-secondary">Attach Completed Treatments (Drafts builder)</label>
              <div className="flex flex-col gap-2">
                {CLINIC_SERVICES.map((svc) => (
                  <label key={svc.id} className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-secondary-bg/50 cursor-pointer text-xs">
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

          {/* Patient history timeline */}
          <div className="lg:col-span-4 bg-card border border-card-border rounded-3xl p-6 shadow-lg flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Dental Chart Timeline</h3>
            
            {activeSession.history.length > 0 ? (
              <div className="flex flex-col gap-4 relative pl-4 border-l border-card-border pr-1 max-h-[350px] overflow-y-auto">
                {activeSession.history.map((h, idx) => (
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary">Patient Queue</h2>
        <p className="text-xs text-text-muted">Monitor today's active schedule queue and commence clinical diagnostics sessions.</p>
      </div>

      <div className="flex flex-col gap-4">
        {queue.map((patient) => (
          <div
            key={patient.id}
            className="p-5 rounded-2xl border border-card-border bg-card flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col gap-1">
              <span className={`inline-flex self-start px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                patient.status === 'CHECKED_IN'
                  ? 'bg-accent-blue-bg text-accent-blue-text'
                  : 'bg-secondary-bg text-text-secondary'
              }`}>
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
    </div>
  );
}
