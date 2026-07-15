'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, EllipsisVertical } from 'lucide-react';

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
    <div className="flex items-center justify-between p-4 border-b border-border bg-sidebar shrink-0 min-h-[61px]">
      <div className="flex items-center gap-2 min-w-0">
        {onBack && (
          <button onClick={onBack} className="md:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0">
            <ArrowLeft className="size-5" />
          </button>
        )}
        <h2 className="text-base font-medium text-foreground truncate">
          {currentUserRole === 'PATIENT' ? 'Samson Dental Center Help Desk' : patientName}
        </h2>
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
          <button onClick={onShowDetail} className="md:hidden p-1 text-muted-foreground hover:text-foreground">
            <EllipsisVertical className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
