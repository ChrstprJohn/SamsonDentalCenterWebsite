'use client';

import * as React from 'react';
import { formatShortDate, formatTimeString } from '@/shared/utils/date.util';
import { Input } from '@/components/ui/input';

interface PendingRequestListV2Props {
  appointments: any[];
  selectedAppointmentId: string | null;
  isLoading: boolean;
  onSelect: (appointmentId: string) => void;
}

export function PendingRequestListV2(props: PendingRequestListV2Props) {
  const [search, setSearch] = React.useState('');

  const filteredAppointments = React.useMemo(() => {
    return props.appointments.filter((appt) => {
      const patientName = appt.dependent
        ? `${appt.dependent.firstName} ${appt.dependent.lastName}`
        : appt.patient
          ? `${appt.patient.firstName} ${appt.patient.lastName}`
          : 'Guest';
      const serviceName = appt.service?.name || '';

      return (
        patientName.toLowerCase().includes(search.toLowerCase()) ||
        serviceName.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [props.appointments, search]);

  return (
    <div className="hidden md:flex flex-col w-[350px] shrink-0 border-r border-card-border/40 bg-sidebar h-full overflow-hidden">
      <div className="flex flex-col gap-3.5 border-b p-4 shrink-0">
        <div className="flex w-full items-center justify-between">
          <div className="text-base font-medium text-foreground">
            Pending Requests ({filteredAppointments.length})
          </div>
        </div>
        <Input
          placeholder="Type to search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs h-9"
        />
      </div>
      {/* data-lenis-prevent stops Lenis from hijacking nested scroll wheel events */}
      <div className="flex-1 overflow-y-auto" data-lenis-prevent>
        <div className="flex flex-col">
          {props.isLoading ? (
            <div className="py-12 text-center text-text-muted text-xs">Loading pending requests...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-xs">
              No pending requests found.
            </div>
          ) : (
            filteredAppointments.map((appt) => {
              const isSelected = props.selectedAppointmentId === appt.id;
              const patientName = appt.dependent
                ? `${appt.dependent.firstName} ${appt.dependent.lastName}`
                : appt.patient
                  ? `${appt.patient.firstName} ${appt.patient.lastName}`
                  : 'Guest';

              const timeDisplay = appt.preferredStartTime
                ? formatTimeString(appt.preferredStartTime)
                : 'Time Pending';

              return (
                <button
                  key={appt.id}
                  onClick={() => props.onSelect(appt.id)}
                  className={`flex flex-col items-start w-full gap-2 border-b p-4 text-sm leading-tight text-left transition-colors last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                    isSelected
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-foreground'
                  }`}
                >
                  <div className="flex w-full items-center gap-2">
                    <span>{patientName}</span>
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                      {appt.status}
                    </span>
                  </div>
                  <span className="font-semibold text-xs text-text-secondary">
                    {appt.service?.name || 'Treatment'}
                  </span>
                  <span className="text-[10px] text-text-muted font-medium">
                    {formatShortDate(appt.date)} • {timeDisplay}
                  </span>
                  {appt.userNote && (
                    <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces text-text-muted/80 italic bg-secondary-bg/25 p-1.5 rounded border border-card-border/10">
                      &quot;{appt.userNote}&quot;
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
