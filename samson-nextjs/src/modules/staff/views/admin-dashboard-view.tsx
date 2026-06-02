'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/feedback/toast-container';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

interface AdminDashboardViewProps {
  initialConfig: ClinicConfigResponseDto;
}

interface ServiceCrudItem {
  id: string;
  name: string;
  duration: number;
  price: number;
  isActive: boolean;
}

interface DoctorCrudItem {
  id: string;
  name: string;
  specialization: string;
  schedule: string;
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

const MOCK_AUDITS = [
  { timestamp: '2026-05-31 03:00 PM', actor: 'Root Admin', action: 'CONFIG_UPDATED', details: 'Updated maximum allowed reschedules count to 2.' },
  { timestamp: '2026-05-31 01:45 PM', actor: 'Root Admin', action: 'SERVICE_ADDED', details: 'Added new service: Fluoride Treatment ($50).' },
];

export function AdminDashboardView({ initialConfig }: AdminDashboardViewProps) {
  const [config, setConfig] = useState<ClinicConfigResponseDto>(initialConfig);
  
  // Roster lists
  const [services, setServices] = useState<ServiceCrudItem[]>(INITIAL_SERVICES);
  const [doctors, setDoctors] = useState<DoctorCrudItem[]>(INITIAL_DOCTORS);
  const [audits, setAudits] = useState(MOCK_AUDITS);

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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary">Admin Portal</h2>
        <p className="text-xs text-text-muted">Configure operational thresholds, update clinic hours, and manage service rosters CRUD panels.</p>
      </div>

      {/* 📊 Analytics summary cards */}
      <section className="grid grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl border border-card-border bg-card flex flex-col gap-1">
          <span className="text-3xl font-extrabold text-primary-start">404</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Bookings Passed</span>
        </div>
        <div className="p-5 rounded-2xl border border-card-border bg-card flex flex-col gap-1">
          <span className="text-3xl font-extrabold text-primary-start">{services.length}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Active Services</span>
        </div>
        <div className="p-5 rounded-2xl border border-card-border bg-card flex flex-col gap-1">
          <span className="text-3xl font-extrabold text-primary-start">{doctors.length}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Rostered Doctors</span>
        </div>
      </section>

      {/* Roster Tabs */}
      <div className="flex gap-2 border-b border-card-border pb-2">
        {(['CONFIG', 'SERVICES', 'DOCTORS', 'AUDITS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-primary-start to-primary-end text-white shadow-md shadow-primary-start/10'
                : 'text-text-secondary hover:bg-secondary-bg'
            }`}
          >
            {tab === 'CONFIG' ? '🔧 Global Config' : tab === 'SERVICES' ? '🧼 Manage Services' : tab === 'DOCTORS' ? '👨‍⚕️ Manage Doctors' : '📜 System Audits'}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex flex-col gap-6">
        {activeTab === 'CONFIG' && (
          <form onSubmit={handleConfigSave} className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-lg flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Clinic Operation Rules</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Clinic Name</label>
                <input
                  type="text"
                  required
                  value={config.clinicName}
                  onChange={(e) => setConfig({ ...config, clinicName: e.target.value })}
                  className="px-3.5 py-2 rounded-xl border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Operating Address</label>
                <input
                  type="text"
                  required
                  value={config.address}
                  onChange={(e) => setConfig({ ...config, address: e.target.value })}
                  className="px-3.5 py-2 rounded-xl border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Same-Day Booking Policies</label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="checkbox"
                    checked={config.allowSameDayBooking}
                    onChange={(e) => setConfig({ ...config, allowSameDayBooking: e.target.checked })}
                  />
                  <span className="text-xs text-text-secondary">Allow same-day slot bookings</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Max Reschedules Allowed Per Appointment</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={config.maxReschedules}
                  onChange={(e) => setConfig({ ...config, maxReschedules: parseInt(e.target.value) || 0 })}
                  className="px-3.5 py-2 rounded-xl border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
                />
              </div>
            </div>

            <div className="border-t border-card-border pt-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-text-secondary">Online Scheduler Switch</span>
                  <span className="text-[10px] text-text-muted">Open or close online booking portalwizard wizard</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.isBookingOpen}
                  onChange={(e) => setConfig({ ...config, isBookingOpen: e.target.checked })}
                />
              </div>

              {!config.isBookingOpen && (
                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-semibold text-text-secondary">Scheduler Maintenance Message</label>
                  <textarea
                    required
                    value={config.maintenanceMessage || ''}
                    onChange={(e) => setConfig({ ...config, maintenanceMessage: e.target.value })}
                    placeholder="Enter custom maintenance banner text..."
                    rows={3}
                    className="px-3.5 py-2 rounded-xl border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
                  />
                </div>
              )}
            </div>

            <Button type="submit" disabled={isSavingConfig} className="self-start mt-2">
              {isSavingConfig ? 'Saving Settings...' : 'Save Global Config'}
            </Button>
          </form>
        )}

        {activeTab === 'SERVICES' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* CRUD Table */}
            <div className="lg:col-span-8 border border-card-border rounded-3xl overflow-hidden bg-card">
              <div className="divide-y divide-card-border">
                {services.map((svc) => (
                  <div key={svc.id} className="p-4 flex justify-between items-center text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-text-primary">{svc.name}</span>
                      <span className="text-[10px] text-text-muted">Duration: {svc.duration} mins | Status: {svc.isActive ? 'Active' : 'Archived'}</span>
                    </div>
                    <span className="font-bold text-text-primary">${svc.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Service Panel */}
            <form onSubmit={handleAddService} className="lg:col-span-4 bg-card border border-card-border rounded-3xl p-6 shadow-lg flex flex-col gap-4 text-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Add New Treatment</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Service Name</label>
                <input
                  type="text"
                  required
                  value={newSvcName}
                  onChange={(e) => setNewSvcName(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Duration (m)</label>
                  <input
                    type="number"
                    required
                    value={newSvcDuration}
                    onChange={(e) => setNewSvcDuration(parseInt(e.target.value) || 0)}
                    className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newSvcPrice}
                    onChange={(e) => setNewSvcPrice(parseInt(e.target.value) || 0)}
                    className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary w-full"
                  />
                </div>
              </div>

              <Button type="submit" className="mt-2 w-full">Add Service</Button>
            </form>
          </div>
        )}

        {activeTab === 'DOCTORS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* CRUD Table */}
            <div className="lg:col-span-8 border border-card-border rounded-3xl overflow-hidden bg-card">
              <div className="divide-y divide-card-border">
                {doctors.map((doc) => (
                  <div key={doc.id} className="p-4 flex justify-between items-center text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-text-primary">{doc.name}</span>
                      <span className="text-[10px] text-text-muted">Spec: {doc.specialization}</span>
                    </div>
                    <span className="text-[10px] text-text-muted">{doc.schedule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Doctor Panel */}
            <form onSubmit={handleAddDoctor} className="lg:col-span-4 bg-card border border-card-border rounded-3xl p-6 shadow-lg flex flex-col gap-4 text-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Register Doctor</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Doctor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Name"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Specialization</label>
                <input
                  type="text"
                  required
                  value={newDocSpec}
                  onChange={(e) => setNewDocSpec(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
                />
              </div>

              <Button type="submit" className="mt-2 w-full">Create Account</Button>
            </form>
          </div>
        )}

        {activeTab === 'AUDITS' && (
          <div className="border border-card-border rounded-3xl overflow-hidden bg-card divide-y divide-card-border">
            {audits.map((item, idx) => (
              <div key={idx} className="p-5 flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between items-start">
                  <span className="inline-flex px-2 py-0.5 rounded bg-accent-blue-bg text-accent-blue-text font-bold text-[9px] uppercase tracking-wider">
                    {item.action}
                  </span>
                  <span className="text-[10px] text-text-muted">{item.timestamp}</span>
                </div>
                <p className="text-text-secondary leading-relaxed mt-1">{item.details}</p>
                <span className="text-[10px] text-text-muted">Actor: {item.actor}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
