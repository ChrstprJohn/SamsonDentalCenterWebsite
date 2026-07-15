'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ChatContextBannerProps {
  patientName: string;
  serviceName: string;
  status: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  preferredStartTime: string | null;
  doctorName?: string | null;
  currentUserRole: 'PATIENT' | 'STAFF';
  appointmentId: string;
  chatToken?: string;
}

export function ChatContextBanner({
  patientName,
  serviceName,
  status,
  date,
  startTime,
  endTime,
  preferredStartTime,
  doctorName,
  currentUserRole,
  appointmentId,
  chatToken,
}: ChatContextBannerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return '';
    try {
      if (timeStr.includes('T')) {
        return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        const hour = parseInt(parts[0], 10);
        const minute = parts[1];
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minute} ${ampm}`;
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="bg-slate-950/60 border-b border-slate-800/80 backdrop-blur-md transition-all">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-900/40 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 font-bold border border-blue-500/15 text-sm leading-none">
            🦷
          </div>
          <div>
            <p className="font-bold text-slate-100">{serviceName}</p>
            <p className="text-[10px] text-slate-400">Patient: {patientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 font-semibold text-[10px] bg-slate-800 rounded-md border border-slate-700/50 text-slate-300">
            {status}
          </span>
          <span className="text-slate-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-4 pt-1 border-t border-slate-800/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <p>
              <span className="text-slate-500">Scheduled Date:</span>{' '}
              <strong className="text-slate-200">{date}</strong>
            </p>
            <p>
              <span className="text-slate-500">Time Window:</span>{' '}
              <strong className="text-slate-200">
                {formatTime(startTime) || preferredStartTime || 'TBD'}
                {endTime ? ` - ${formatTime(endTime)}` : ''}
              </strong>
            </p>
            <p>
              <span className="text-slate-500">Doctor Assigned:</span>{' '}
              <strong className="text-slate-200">{doctorName || 'Unassigned'}</strong>
            </p>
          </div>
          <div className="flex sm:justify-end items-end">
            {currentUserRole === 'PATIENT' && !chatToken && (
              <Link href={`/user/appointments/${appointmentId}`}>
                <Button variant="secondary" className="text-xs h-8">
                  View Appointment Detail
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
