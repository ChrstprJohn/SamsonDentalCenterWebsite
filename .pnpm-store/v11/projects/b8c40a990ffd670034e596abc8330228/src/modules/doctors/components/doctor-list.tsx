'use client';

import React from 'react';
import { Doctor } from '../hooks/use-doctor-management';
import { DoctorCard } from './doctor-card';
import { Button } from '@/components/ui/button';

interface DoctorListProps {
  doctors: Doctor[];
  selectedDoctorId: string | null;
  onSelectDoctor: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onAddDoctorClick: () => void;
  isAddingNew: boolean;
}

export function DoctorList({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddDoctorClick,
  isAddingNew,
}: DoctorListProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-bold tracking-wider uppercase text-text-secondary">
            Roster ({doctors.length})
          </h2>
          <Button
            size="sm"
            onClick={onAddDoctorClick}
            disabled={isAddingNew}
            className="text-[11px] h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            + Add Doctor
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
          <input
            type="text"
            placeholder="🔍 Search name, email, specialization..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
          />

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="HIDDEN">Hidden</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 max-h-[500px]">
        {doctors.length === 0 ? (
          <div className="text-center py-8 text-xs text-text-muted border border-dashed border-card-border rounded-2xl">
            No doctors found matching filters
          </div>
        ) : (
          doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              isSelected={!isAddingNew && doctor.id === selectedDoctorId}
              onClick={() => onSelectDoctor(doctor.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
