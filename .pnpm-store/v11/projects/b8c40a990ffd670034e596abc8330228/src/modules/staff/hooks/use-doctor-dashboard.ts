'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/feedback/toast-container';

export interface PatientHistoryRecord {
  date: string;
  serviceName: string;
  notes: string;
}

export interface ActivePatient {
  id: string;
  name: string;
  serviceName: string;
  time: string;
  status: 'SCHEDULED' | 'CHECKED_IN' | 'RENDERED';
  history: PatientHistoryRecord[];
}

export interface AvailableServiceItem {
  id: string;
  name: string;
  price: number;
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

export const CLINIC_SERVICES: AvailableServiceItem[] = [
  { id: 'cs-1', name: 'Tooth Extraction', price: 150 },
  { id: 'cs-2', name: 'Dental Filling', price: 120 },
  { id: 'cs-3', name: 'Standard Scaling & Polish', price: 90 },
];

export function useDoctorDashboard() {
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

  return {
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
  };
}
