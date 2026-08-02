'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, Info, UserRound } from 'lucide-react';

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
  onBack?: () => void;
  onShowDetail?: () => void;
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
  onBack,
  onShowDetail,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-white shrink-0 min-h-[61px]">
      <div className="flex items-center gap-2 min-w-0">
        {onBack && (
          <button onClick={onBack} className="lg:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0">
            <ArrowLeft className="size-5" />
          </button>
        )}
        {currentUserRole === 'STAFF' && (
          <div className="size-10 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border-2 border-border/60 overflow-hidden">
            <UserRound className="size-8 text-muted-foreground/70 translate-y-0.5" />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <h2 className="text-base font-medium text-foreground truncate">
            {currentUserRole === 'PATIENT' ? 'Samson Dental Center Help Desk' : patientName}
          </h2>
          {currentUserRole === 'STAFF' && (
            <span className="text-[11px] text-muted-foreground truncate">{serviceName || 'Treatment'}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {currentUserRole === 'PATIENT' && !chatToken && (
          <Link href={`/user/appointments/${appointmentId}`}>
            <Button variant="secondary" size="sm">
              <ExternalLink className="size-3.5 mr-1.5" />
              View Appointment
            </Button>
          </Link>
        )}
        {currentUserRole === 'STAFF' && onShowDetail && (
          <button onClick={onShowDetail} className="p-1 text-muted-foreground hover:text-foreground flex flex-col items-center gap-0.5" title="Toggle Appointment Details">
            <Info className="size-5" />
            <span className="text-[10px] leading-none">Detail</span>
          </button>
        )}
      </div>
    </div>
  );
}
