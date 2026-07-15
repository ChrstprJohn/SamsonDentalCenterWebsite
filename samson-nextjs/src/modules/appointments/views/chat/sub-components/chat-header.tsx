'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-border bg-sidebar gap-4 shrink-0">
        <h2 className="text-base font-medium text-foreground">
          {currentUserRole === 'PATIENT' ? 'Samson Dental Center Help Desk' : patientName}
        </h2>
      {currentUserRole === 'PATIENT' && !chatToken && (
        <Link href={`/user/appointments/${appointmentId}`}>
          <Button variant="secondary" size="sm">
            <ExternalLink className="size-3.5 mr-1.5" />
            View Appointment
          </Button>
        </Link>
      )}
    </div>
  );
}
