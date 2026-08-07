'use client';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type React from 'react';
import type { AppointmentDirectoryTab, DoctorFilterItem } from '@/modules/staff/hooks/secretary/use-secretary-appointments';

interface AppointmentsTabsFiltersProps {
  activeTab: AppointmentDirectoryTab;
  onTabChange: (tab: AppointmentDirectoryTab) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  doctorFilter: string;
  setDoctorFilter: (value: string) => void;
  historyStatusFilter: string;
  setHistoryStatusFilter: (value: string) => void;
  doctors: DoctorFilterItem[];
}

export function AppointmentsTabsFilters(props: AppointmentsTabsFiltersProps) {
  return (
    <>
      <div className="flex border-b border-card-border/80">
        {(['upcoming', 'history'] as const).map((tab) => (
          <button key={tab} onClick={() => props.onTabChange(tab)} className={`py-2.5 px-6 text-xs font-semibold border-b-2 transition-all capitalize ${props.activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
            {tab === 'upcoming' ? 'Upcoming (APPROVED)' : 'History Logs (Closed)'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 border border-card-border bg-card rounded-2xl p-4 shadow-sm">
        <Field label="Search Patient / Service">
          <Input type="text" placeholder="Search..." value={props.searchTerm} onChange={(event) => props.setSearchTerm(event.target.value)} className="text-xs w-full" />
        </Field>
        <Field label="Date Filter">
          <input type="date" value={props.dateFilter} onChange={(event) => props.setDateFilter(event.target.value)} className="w-full text-xs bg-card border border-card-border/80 rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </Field>
        <Field label="Doctor Filter">
          <Select value={props.doctorFilter} onChange={(event) => props.setDoctorFilter(event.target.value)} className="text-xs w-full" options={[{ value: '', label: 'All Doctors' }, ...props.doctors.map((doctor) => ({ value: doctor.id, label: `Dr. ${doctor.firstName} ${doctor.lastName}` }))]} />
        </Field>
        {props.activeTab === 'history' && (
          <Field label="Status Filter">
            <Select value={props.historyStatusFilter} onChange={(event) => props.setHistoryStatusFilter(event.target.value)} className="text-xs w-full" options={[{ value: '', label: 'All History' }, { value: 'COMPLETED', label: 'Completed' }, { value: 'CANCELLED', label: 'Cancelled' }, { value: 'REJECTED', label: 'Rejected' }, { value: 'DISPLACED', label: 'Displaced' }, { value: 'NO_SHOW', label: 'No Show' }]} />
          </Field>
        )}
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[10px] uppercase font-bold text-text-muted mb-1 block">{label}</label>{children}</div>;
}
