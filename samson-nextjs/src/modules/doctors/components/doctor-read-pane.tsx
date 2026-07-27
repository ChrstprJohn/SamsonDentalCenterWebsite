'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Doctor } from '../hooks/use-doctor-management';
import { formatTimeString } from '@/shared/utils/date.util';
import { UserRound, Pencil } from 'lucide-react';


interface Service {
  id: string;
  name: string;
}

interface DoctorReadPaneProps {
  doctor: Doctor | null;
  allServices?: Service[];
  onEdit: () => void;
  onStatusToggle: (status: string) => void;
}

export function DoctorReadPane({ doctor, allServices = [], onEdit, onStatusToggle }: DoctorReadPaneProps) {
  if (!doctor) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
          <UserRound className="size-6 text-muted-foreground/60" />
        </div>
        <p className="text-xs font-medium text-foreground">No doctor selected</p>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px]">
          Select a doctor from the roster to view details.
        </p>
      </div>
    );
  }

  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}${doctor.suffix ? ` ${doctor.suffix}` : ''}`;
  const assignedServices = allServices.filter((s) => doctor.services?.includes(s.id));

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <div
        className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        style={{ scrollbarWidth: 'thin' }}
        data-lenis-prevent
      >
        {/* Header Profile Section */}
        <div className="w-full py-8 px-5 border-b border-card-border/40 bg-muted/20 flex flex-col items-center justify-center text-center">
          {doctor.avatarUrl ? (
            <div className="size-20 shrink-0 rounded-full border-2 border-primary/20 overflow-hidden bg-card shadow-sm mb-3">
              <img src={doctor.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="size-20 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border border-border/60 overflow-hidden mb-3">
              <UserRound className="size-12 text-muted-foreground/70 translate-y-0.5" />
            </div>
          )}
          <h2 className="text-2xl font-bold text-foreground">{fullName}</h2>
        </div>

        {/* Current Status Section */}
        <div className="py-4 px-5 border-b border-card-border/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-medium text-foreground">Current Status</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-7 px-2.5 text-xs gap-1"
            >
              <Pencil className="size-3.5" /> Edit
            </Button>
          </div>
          <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">
            {doctor.status === 'ARCHIVED'
              ? '🔴 Archived (Disabled across all platforms and clinic roster)'
              : '🟢 Active (Available for schedule & internal roster)'}
          </div>
        </div>

        {/* Doctor Information Section */}
        <div className="py-4 px-5 border-b border-card-border/40">
          <span className="text-base font-medium text-foreground block mb-3">Doctor Information</span>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <DoctorField label="First Name" value={doctor.firstName} />
              <DoctorField label="Last Name" value={doctor.lastName} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DoctorField label="Middle Name" value={doctor.middleName || 'N/A'} />
              <DoctorField label="Suffix" value={doctor.suffix || 'N/A'} />
            </div>
          </div>
        </div>

        {/* Doctor Contact Section */}
        <div className="py-4 px-5 border-b border-card-border/40">
          <span className="text-base font-medium text-foreground block mb-3">Doctor Contact</span>
          <div className="flex flex-col gap-3">
            <DoctorField label="Phone Number" value={doctor.phoneNumber || 'N/A'} />
            <DoctorField label="Email Address" value={doctor.email} />
          </div>
        </div>

        {/* Account Credentials Section */}
        <div className="py-4 px-5 border-b border-card-border/40">
          <span className="text-base font-medium text-foreground block mb-3">Account Credentials</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground font-medium">Password Status</span>
            <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">
              {doctor.status === 'FORCE_PASSWORD_CHANGE'
                ? '🟡 Password Reset Required (First Login Pending)'
                : '🟢 Password Configured (Active Account)'}
            </div>
          </div>
        </div>

        {/* Doctor Photo Section */}
        <div className="py-4 px-5">
          <span className="text-base font-medium text-foreground block mb-3">Doctor Photo / Avatar</span>
          {doctor.avatarUrl ? (
            <div className="flex items-center gap-3 p-3 border border-card-border rounded-xl bg-muted/50">
              <img
                src={doctor.avatarUrl}
                alt="Current doctor photo"
                className="w-12 h-12 rounded-full object-cover border border-card-border"
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">Current Doctor Photo</span>
                <span className="text-[11px] text-muted-foreground">Active profile avatar displayed across clinic portals.</span>
              </div>
            </div>
          ) : (
            <div className="w-full px-4 py-3 rounded-xl border bg-muted/50 text-xs text-muted-foreground border-card-border cursor-default italic">
              No photo uploaded yet. Click &quot;Edit&quot; to upload a doctor photo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DoctorField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground leading-5 border-card-border cursor-default truncate">
        {value}
      </div>
    </div>
  );
}

