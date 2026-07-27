'use client';

import React from 'react';
import { Doctor } from '../hooks/use-doctor-management';
import { UserRound } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  isSelected: boolean;
  onClick: () => void;
}

export function DoctorCard({ doctor, isSelected, onClick }: DoctorCardProps) {
  const getStatusDetails = (status: Doctor['status']) => {
    if (status === 'ARCHIVED') {
      return { label: 'ARCHIVED', className: 'text-rose-600 bg-rose-500/10 dark:text-rose-400' };
    }
    if (status === 'HIDDEN') {
      return { label: 'HIDDEN', className: 'text-amber-600 bg-amber-500/10 dark:text-amber-400' };
    }
    if (status === 'FORCE_PASSWORD_CHANGE') {
      return { label: 'RESET REQ', className: 'text-orange-600 bg-orange-500/10 dark:text-orange-400' };
    }
    return { label: 'ACTIVE', className: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' };
  };

  const statusInfo = getStatusDetails(doctor.status);

  return (
    <button
      onClick={onClick}
      className={`flex items-start w-full gap-3 border-b border-card-border/40 p-4 text-sm leading-tight text-left transition-colors last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
        isSelected
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-foreground'
      }`}
    >
      <div className="size-10 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border-2 border-border/60 overflow-hidden">
        <UserRound className="size-8 text-muted-foreground/70 translate-y-0.5" />
      </div>
      <div className="flex flex-col min-w-0 flex-1 gap-1.5">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="font-semibold truncate">
            Dr. {doctor.firstName} {doctor.lastName}
          </span>
          <span className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
        <span className="font-medium text-xs text-text-secondary truncate">
          {doctor.specialization || 'General Dentist'}
        </span>
        <div className="flex w-full items-center justify-between gap-2 min-w-0">
          <span className="truncate text-xs text-muted-foreground">
            {doctor.email}
          </span>
        </div>
      </div>
    </button>
  );
}
