'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ChatHeaderProps {
  patientName: string;
  serviceName: string;
  status: string;
  date: string;
  preferredStartTime: string | null;
  currentUserRole: 'PATIENT' | 'STAFF';
  appointmentId: string;
  chatToken?: string;
  activeStatuses: string[];
}

export function ChatHeader({
  patientName,
  serviceName,
  status,
  date,
  preferredStartTime,
  currentUserRole,
  appointmentId,
  chatToken,
  activeStatuses,
}: ChatHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40 gap-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">{patientName}</h2>
          <span
            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              activeStatuses.includes(status)
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {status}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {serviceName} &bull; {date} {preferredStartTime ? `at ${preferredStartTime}` : ''}
        </p>
      </div>
      {currentUserRole === 'PATIENT' && !chatToken && (
        <Link href={`/user/appointments/${appointmentId}`}>
          <Button variant="secondary" className="text-xs">
            View Appointment
          </Button>
        </Link>
      )}
    </div>
  );
}
