'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useDoctorDashboard } from '../hooks/use-doctor-dashboard';
import { PatientQueueList } from '../components/sub-components/patient-queue-list';
import { ActiveSessionDiagnostics } from '../components/sub-components/active-session-diagnostics';
import { DentalChartTimeline } from '../components/sub-components/dental-chart-timeline';

export function DoctorDashboardView() {
  const {
    queue,
    activeSession,
    setActiveSession,
    clinicalNotes,
    setClinicalNotes,
    selectedServices,
    isSubmitting,
    handleStartTreatment,
    handleServiceToggle,
    handleFinalizeTreatment,
  } = useDoctorDashboard();

  if (activeSession) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center border-b border-card-border pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-primary-start font-bold uppercase tracking-widest">
              Active Clinical Operatory Session
            </span>
            <h2 className="text-2xl font-extrabold text-text-primary">{activeSession.name}</h2>
          </div>
          <Button variant="secondary" onClick={() => setActiveSession(null)}>
            Back to Queue
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <ActiveSessionDiagnostics
            clinicalNotes={clinicalNotes}
            setClinicalNotes={setClinicalNotes}
            selectedServices={selectedServices}
            handleServiceToggle={handleServiceToggle}
            handleFinalizeTreatment={handleFinalizeTreatment}
            isSubmitting={isSubmitting}
          />
          <DentalChartTimeline history={activeSession.history} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary">Patient Queue</h2>
        <p className="text-xs text-text-muted">
          Monitor today's active schedule queue and commence clinical diagnostics sessions.
        </p>
      </div>

      <PatientQueueList queue={queue} handleStartTreatment={handleStartTreatment} />
    </div>
  );
}
