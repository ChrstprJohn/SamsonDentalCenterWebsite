'use client';

import React from 'react';
import { Doctor } from '../hooks/use-doctor-management';

interface DoctorCardProps {
  doctor: Doctor;
  isSelected: boolean;
  onClick: () => void;
}

export function DoctorCard({ doctor, isSelected, onClick }: DoctorCardProps) {
  const getStatusDetails = (status: Doctor['status'], isActive: boolean) => {
    if (!isActive) {
      return { label: 'INACTIVE', className: 'bg-slate-500/10 text-slate-500 border-slate-500/20' };
    }
    if (status === 'FORCE_PASSWORD_CHANGE') {
      return { label: 'RESET REQ', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    }
    return { label: 'ACTIVE', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
  };

  const statusInfo = getStatusDetails(doctor.status, doctor.isActive);
  const initials = `${doctor.firstName[0] || ''}${doctor.lastName[0] || ''}`.toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500 shadow-md'
          : 'bg-card border-card-border hover:bg-secondary-bg hover:border-slate-300 dark:hover:border-white/20'
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm border border-blue-500/20 shadow-inner shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-xs text-text-primary truncate">
            Dr. {doctor.firstName} {doctor.lastName}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border tracking-wider shrink-0 ${statusInfo.className}`}
          >
            {statusInfo.label}
          </span>
        </div>

        <span className="text-[10px] text-text-muted font-medium truncate">
          {doctor.specialization || 'General Dentist'}
        </span>

        <span className="text-[10px] text-text-muted truncate">
          ✉️ {doctor.email}
        </span>
      </div>
    </div>
  );
}
