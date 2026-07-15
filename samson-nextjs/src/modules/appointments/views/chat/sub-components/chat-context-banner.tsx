'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import Link from 'next/link';
import { Stethoscope, User, Calendar, Clock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = React.useState(true);

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
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="bg-muted/30 border-b border-border/80"
    >
      <CollapsibleTrigger className="w-full px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/40 transition-colors select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/15">
            <Stethoscope className="size-4" />
          </div>
          <div className="text-left">
            <p className="font-bold text-foreground text-sm">{serviceName}</p>
            <p className="text-[10px] text-muted-foreground">Patient: {patientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={status === 'CANCELLED' ? 'error' : status === 'COMPLETED' ? 'default' : 'success'}>
            {status}
          </Badge>
          {isExpanded ? (
            <ChevronUp className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-3.5 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-5 pb-4 pt-1 border-t border-border/40">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="space-y-2">
            <p className="flex items-center gap-1.5">
              <Calendar className="size-3" />
              <span className="text-muted-foreground">Scheduled Date:</span>{' '}
              <strong className="text-foreground">{date}</strong>
            </p>
            <p className="flex items-center gap-1.5">
              <Clock className="size-3" />
              <span className="text-muted-foreground">Time Window:</span>{' '}
              <strong className="text-foreground">
                {formatTime(startTime) || preferredStartTime || 'TBD'}
                {endTime ? ` - ${formatTime(endTime)}` : ''}
              </strong>
            </p>
            <p className="flex items-center gap-1.5">
              <User className="size-3" />
              <span className="text-muted-foreground">Doctor Assigned:</span>{' '}
              <strong className="text-foreground">{doctorName || 'Unassigned'}</strong>
            </p>
          </div>
          <div className="flex sm:justify-end items-end">
            {currentUserRole === 'PATIENT' && !chatToken && (
              <Link href={`/user/appointments/${appointmentId}`}>
                <Button variant="secondary" size="sm">
                  <ExternalLink className="size-3.5 mr-1.5" />
                  View Appointment Detail
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
