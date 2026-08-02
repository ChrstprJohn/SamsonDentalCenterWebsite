'use client';

import { CalendarDays } from 'lucide-react';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import { formatClinicTime, formatShortDate, formatTimeString } from '@/shared/utils/date.util';

const BADGE_STYLES: Record<string, string> = {
  APPROVED: 'text-blue-600 bg-blue-500/10 dark:text-blue-400',
  CHECKED_IN: 'text-cyan-600 bg-cyan-500/10 dark:text-cyan-400',
  COMPLETED: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
  CANCELLED: 'text-rose-600 bg-rose-500/10 dark:text-rose-400',
  REJECTED: 'text-rose-600 bg-rose-500/10 dark:text-rose-400',
  NO_SHOW: 'text-amber-600 bg-amber-500/10 dark:text-amber-400',
  DISPLACED: 'text-amber-600 bg-amber-500/10 dark:text-amber-400',
};

interface AppointmentsTableProps {
  appointments: AppointmentDto[];
  selectedAppointmentId: string | null;
  isLoading: boolean;
  formatPatientName: (appointment: AppointmentDto) => string;
  onSelect: (appointmentId: string) => void;
}

export function AppointmentsTable(props: AppointmentsTableProps) {
  if (props.isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-text-muted p-4">Loading appointments...</div>
    );
  }

  if (props.appointments.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="size-10 rounded-full bg-muted/30 flex items-center justify-center mb-2.5">
          <CalendarDays className="size-5 text-muted-foreground/60" />
        </div>
        <span className="text-xs font-medium text-foreground">No appointments found</span>
        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">Try adjusting your search query or tab filter.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      style={{ scrollbarWidth: 'thin' }}
      data-lenis-prevent
    >
      <div className="flex flex-col">
        {props.appointments.map((appointment) => (
          <AppointmentRow
            key={appointment.id}
            appointment={appointment}
            isSelected={props.selectedAppointmentId === appointment.id}
            formatPatientName={props.formatPatientName}
            onSelect={props.onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function AppointmentRow({ appointment, isSelected, formatPatientName, onSelect }: { appointment: AppointmentDto; isSelected: boolean; formatPatientName: (appointment: AppointmentDto) => string; onSelect: (id: string) => void }) {
  const status = appointment.status;
  const timeDisplay = appointment.startTime && appointment.endTime
    ? `${formatClinicTime(appointment.startTime)} - ${formatClinicTime(appointment.endTime)}`
    : appointment.preferredStartTime
      ? `Pref: ${formatTimeString(appointment.preferredStartTime)}`
      : 'Time Pending';

  const dateDisplay = formatShortDate(appointment.date);

  return (
    <button
      onClick={() => onSelect(appointment.id)}
      className={`flex flex-col items-start w-full gap-2 border-b border-card-border/40 p-4 text-sm leading-tight text-left transition-colors last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
        isSelected
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-foreground'
      }`}
    >
      <div className="flex w-full items-center gap-2">
        <span>{formatPatientName(appointment)}</span>
        <span className={`ml-auto text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${BADGE_STYLES[status] || 'text-muted-foreground bg-muted/20'}`}>
          {status}
        </span>
      </div>
      <span className="font-medium">
        {appointment.service?.name || 'Treatment'}
      </span>
      <div className="w-full flex items-center justify-between gap-2 text-xs">
        <span className="truncate">{dateDisplay} &bull; {timeDisplay}</span>
        <span className="text-[10px] text-muted-foreground shrink-0">{appointment.doctor ? `Dr. ${appointment.doctor.lastName}` : ''}</span>
      </div>
    </button>
  );
}
