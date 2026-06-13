'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/feedback/toast-container';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

export interface ServiceCrudItem {
  id: string;
  name: string;
  duration: number;
  price: number;
  isActive: boolean;
}

export interface DoctorCrudItem {
  id: string;
  name: string;
  specialization: string;
  schedule: string;
}

export interface AuditLogItem {
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

const INITIAL_SERVICES: ServiceCrudItem[] = [
  { id: 's-1', name: 'Routine Dental Cleaning', duration: 45, price: 99, isActive: true },
  { id: 's-2', name: 'Teeth Whitening (Laser)', duration: 60, price: 299, isActive: true },
  { id: 's-3', name: 'Premium Dental Implants', duration: 90, price: 1499, isActive: true },
];

const INITIAL_DOCTORS: DoctorCrudItem[] = [
  { id: 'doc-1', name: 'Dr. Sarah Samson', specialization: 'Cosmetic & Surgical', schedule: 'Mon-Fri 09:00 - 05:00' },
  { id: 'doc-2', name: 'Dr. James Mercer', specialization: 'General Dentistry', schedule: 'Mon-Thu 09:00 - 05:00' },
];

const MOCK_AUDITS: AuditLogItem[] = [
  { timestamp: '2026-05-31 03:00 PM', actor: 'Root Admin', action: 'CONFIG_UPDATED', details: 'Updated maximum allowed reschedules count to 2.' },
  { timestamp: '2026-05-31 01:45 PM', actor: 'Root Admin', action: 'SERVICE_ADDED', details: 'Added new service: Fluoride Treatment ($50).' },
];

interface UseAdminDashboardProps {
  initialConfig: ClinicConfigResponseDto;
}

export function useAdminDashboard({ initialConfig }: UseAdminDashboardProps) {
  const [config, setConfig] = useState<ClinicConfigResponseDto>(initialConfig);
  const [services, setServices] = useState<ServiceCrudItem[]>(INITIAL_SERVICES);
  const [doctors, setDoctors] = useState<DoctorCrudItem[]>(INITIAL_DOCTORS);
  const [audits, setAudits] = useState<AuditLogItem[]>(MOCK_AUDITS);

  // Edit Forms state
  const [activeTab, setActiveTab] = useState<'CONFIG' | 'SERVICES' | 'DOCTORS' | 'AUDITS'>('CONFIG');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const { addToast } = useToast();

  // Temporary Service Form
  const [newSvcName, setNewSvcName] = useState('');
  const [newSvcDuration, setNewSvcDuration] = useState(30);
  const [newSvcPrice, setNewSvcPrice] = useState(100);

  // Temporary Doctor Form
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpec, setNewDocSpec] = useState('General');
  const [newDocSched, setNewDocSched] = useState('Mon-Fri 09:00 - 05:00');

  const handleConfigSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    // Simulate config save API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSavingConfig(false);

    setAudits((prev) => [
      {
        timestamp: new Date().toLocaleString(),
        actor: 'Root Admin',
        action: 'CONFIG_UPDATED',
        details: `Saved global clinic configurations. Online booking: ${config.isBookingOpen ? 'Active' : 'Maintenance'}.`,
      },
      ...prev,
    ]);

    addToast('Global clinic configurations saved successfully.', 'success');
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSvcName) return;

    const added: ServiceCrudItem = {
      id: `s-${services.length + 1}`,
      name: newSvcName,
      duration: newSvcDuration,
      price: newSvcPrice,
      isActive: true,
    };

    setServices((prev) => [...prev, added]);
    setAudits((prev) => [
      {
        timestamp: new Date().toLocaleString(),
        actor: 'Root Admin',
        action: 'SERVICE_ADDED',
        details: `Added service: ${newSvcName} ($${newSvcPrice}).`,
      },
      ...prev,
    ]);

    addToast(`Added service successfully: ${newSvcName}`, 'success');
    setNewSvcName('');
  };

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;

    const added: DoctorCrudItem = {
      id: `doc-${doctors.length + 1}`,
      name: newDocName,
      specialization: newDocSpec,
      schedule: newDocSched,
    };

    setDoctors((prev) => [...prev, added]);
    setAudits((prev) => [
      {
        timestamp: new Date().toLocaleString(),
        actor: 'Root Admin',
        action: 'DOCTOR_ADDED',
        details: `Created doctor account and schedule for: ${newDocName}.`,
      },
      ...prev,
    ]);

    addToast(`Registered doctor successfully: ${newDocName}`, 'success');
    setNewDocName('');
  };

  return {
    config,
    setConfig,
    services,
    doctors,
    audits,
    activeTab,
    setActiveTab,
    isSavingConfig,
    newSvcName,
    setNewSvcName,
    newSvcDuration,
    setNewSvcDuration,
    newSvcPrice,
    setNewSvcPrice,
    newDocName,
    setNewDocName,
    newDocSpec,
    setNewDocSpec,
    newDocSched,
    setNewDocSched,
    handleConfigSave,
    handleAddService,
    handleAddDoctor,
  };
}
