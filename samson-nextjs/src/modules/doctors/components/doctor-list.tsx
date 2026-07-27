'use client';

import React from 'react';
import { Doctor } from '../hooks/use-doctor-management';
import { DoctorCard } from './doctor-card';

interface DoctorListProps {
  doctors: Doctor[];
  selectedDoctorId: string | null;
  onSelectDoctor: (id: string) => void;
  isAddingNew: boolean;
}

export function DoctorList({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
  isAddingNew,
}: DoctorListProps) {
  if (doctors.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
        <span className="text-xs font-medium text-foreground">No doctors found</span>
        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">Try adjusting your search query or status filter.</p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      style={{ scrollbarWidth: 'thin' }}
      data-lenis-prevent
    >
      <div className="flex flex-col">
        {doctors.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            isSelected={!isAddingNew && doctor.id === selectedDoctorId}
            onClick={() => onSelectDoctor(doctor.id)}
          />
        ))}
      </div>
    </div>
  );
}
