'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { User, ExternalLink } from 'lucide-react';

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-border bg-muted/20 gap-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-primary/10 text-primary">
            <User className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{patientName}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {serviceName} &bull; {date} {preferredStartTime ? `at ${preferredStartTime}` : ''}
            </p>
          </div>
          <Badge variant={activeStatuses.includes(status) ? 'success' : 'error'}>
            {status}
          </Badge>
        </div>
      </div>
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
