'use client';

import { useMemo } from 'react';
import { ChevronRight, Clock, XCircle, UserCheck, CheckCircle2 } from 'lucide-react';
import { formatClinicTime, formatShortDate } from '@/shared/utils/date.util';
import type { AppointmentDto } from '@/modules/appointments/dtos/exports';

const BADGE_STYLES: Record<string, string> = {
  APPROVED: 'text-blue-600 bg-blue-500/10',
  CHECKED_IN: 'text-cyan-600 bg-cyan-500/10',
  COMPLETED: 'text-emerald-600 bg-emerald-500/10',
  CANCELLED: 'text-rose-600 bg-rose-500/10',
  REJECTED: 'text-rose-600 bg-rose-500/10',
  NO_SHOW: 'text-amber-600 bg-amber-500/10',
  DISPLACED: 'text-amber-600 bg-amber-500/10',
};

const COLUMNS = [
  { key: 'approved', title: 'Upcoming Today', empty: 'No arrivals expected.' },
  { key: 'noShow', title: 'No-Show', empty: 'No missed slots today.' },
  { key: 'checkedIn', title: 'Checked In', empty: 'No patients in rooms.' },
  { key: 'completed', title: 'Completed', empty: 'No completed visits today.' },
];

export function CheckInBoard({ view, columns }: { view: any; columns?: any }) {
  const cols = columns || view.columns;
  return (
    <div className="flex flex-row items-stretch h-full min-h-0 overflow-x-auto min-w-full [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }}>
      {COLUMNS.map((col) => (
        <VisitColumn key={col.key} col={col} appointments={cols[col.key]} view={view} />
      ))}
    </div>
  );
}

function VisitColumn({ col, appointments, view }: { col: typeof COLUMNS[0]; appointments: AppointmentDto[]; view: any }) {
  return (
    <div className="flex flex-col flex-1 min-w-[200px] sm:min-w-[220px] md:min-w-[220px] lg:min-w-0 h-full min-h-0 border-r border-border last:border-r-0">
      {/* Column header — consistent padding matching cards, neutral title */}
      <div className="flex items-center gap-2 p-2.5 xl:p-3 border-b border-border shrink-0">
        <span className="text-xs xl:text-sm font-semibold truncate text-foreground">{col.title}</span>
        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 bg-muted text-muted-foreground">{appointments.length}</span>
      </div>
      <div
        data-lenis-prevent
        className="flex flex-col flex-1 min-h-0 overflow-y-auto !overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        style={{ scrollbarWidth: 'thin' }}
      >
        {appointments.map((appointment) => (
          <VisitCard key={appointment.id} appointment={appointment} view={view} />
        ))}
        {appointments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="size-10 rounded-full bg-muted/30 flex items-center justify-center mb-2.5">
              {col.key === 'approved' && <Clock className="size-5 text-muted-foreground/50" />}
              {col.key === 'noShow' && <XCircle className="size-5 text-muted-foreground/50" />}
              {col.key === 'checkedIn' && <UserCheck className="size-5 text-muted-foreground/50" />}
              {col.key === 'completed' && <CheckCircle2 className="size-5 text-muted-foreground/50" />}
            </div>
            <span className="text-xs font-medium text-foreground">{col.empty}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getPatientDisplayName(app: any): string {
  if (!app) return 'Guest Patient';
  if (app.dependent) {
    return `${app.dependent.firstName || ''} ${app.dependent.lastName || ''}`.trim() || 'Dependent';
  }
  if (app.guestContact) {
    const first = app.guestContact.firstName || '';
    const last = app.guestContact.lastName || '';
    return `${first} ${last}`.trim() || 'Guest Patient';
  }
  if (app.patient) {
    const first = app.patient.firstName || '';
    const last = app.patient.lastName || '';
    return `${first} ${last}`.trim() || 'Patient';
  }
  return 'Guest Patient';
}

function VisitCard({ appointment, view }: {
  appointment: AppointmentDto;
  view: any;
}) {
  const isSelected =
    view.checkInAppt?.id === appointment.id ||
    view.noShowAppt?.id === appointment.id ||
    view.checkoutAppt?.id === appointment.id ||
    view.viewAppt?.id === appointment.id ||
    view.resolveAppt?.id === appointment.id ||
    view.rescheduleAppt?.id === appointment.id;

  const timeDisplay = `${formatClinicTime(appointment.startTime)} - ${formatClinicTime(appointment.endTime)}`;
  const dateDisplay = formatShortDate(appointment.date);
  const statusBadge = BADGE_STYLES[appointment.status] || 'text-muted-foreground bg-muted/20';
  const anySelected = !!(view.checkInAppt || view.noShowAppt || view.checkoutAppt || view.viewAppt || view.resolveAppt || view.rescheduleAppt);
  const isResolvedNoShow = appointment.status === 'NO_SHOW' && !!appointment.noShowResolvedAt;

  return (
    <div
      className={`flex flex-col text-left transition-colors cursor-pointer select-none overflow-hidden border-b border-border p-2.5 xl:p-3 shrink-0 ${
        isSelected
          ? 'bg-muted'
          : 'hover:bg-muted/50'
      } ${isResolvedNoShow ? 'opacity-60' : ''}`}
      onClick={() => view.handleViewApptDetails(appointment)}
    >
      <div className="flex flex-col gap-1 xl:gap-1.5">
        <div className="flex w-full items-center gap-1.5 min-w-0">
          <span className="font-medium text-xs xl:text-sm leading-tight truncate text-foreground">
            {getPatientDisplayName(appointment)}
          </span>
          <span className={`ml-auto text-[8px] sm:text-[8.5px] xl:text-[10px] font-semibold uppercase tracking-tight xl:tracking-wider px-1 py-0.5 rounded-xs shrink-0 ${statusBadge} ${anySelected ? 'hidden xl:inline-block' : ''}`}>
            {appointment.status === 'CHECKED_IN' ? 'CHECKED IN' : appointment.status}
          </span>
          {isResolvedNoShow && (
            <span className="text-[8px] sm:text-[8.5px] xl:text-[10px] font-semibold uppercase tracking-tight xl:tracking-wider px-1 py-0.5 rounded-xs shrink-0 bg-emerald-500/15 text-emerald-600">
              Resolved
            </span>
          )}
        </div>
        <span className="font-medium text-[11px] xl:text-xs leading-tight truncate text-muted-foreground">
          {appointment.service?.name || 'Treatment'}
        </span>
        <span className="text-[10px] xl:text-xs truncate text-muted-foreground">
          {dateDisplay} &bull; {timeDisplay}
        </span>
        <div className="flex w-full items-center gap-1">
          <span className="text-[10px] xl:text-[11px] truncate text-muted-foreground">
            Dr. {appointment.doctor?.lastName || ''}
          </span>
          <ChevronRight className="ml-auto size-4 xl:size-5 shrink-0 text-muted-foreground/60" />
        </div>
      </div>
    </div>
  );
}
