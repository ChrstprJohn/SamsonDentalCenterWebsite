'use client';

import { useMemo } from 'react';
import { Eye } from 'lucide-react';
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

const DOCTOR_COLORS = [
  { bg: 'bg-blue-50/70 border-blue-200/70 hover:bg-blue-100/60', accent: 'bg-blue-500', selected: 'ring-2 ring-blue-500/30' },
  { bg: 'bg-emerald-50/70 border-emerald-200/70 hover:bg-emerald-100/60', accent: 'bg-emerald-500', selected: 'ring-2 ring-emerald-500/30' },
  { bg: 'bg-violet-50/70 border-violet-200/70 hover:bg-violet-100/60', accent: 'bg-violet-500', selected: 'ring-2 ring-violet-500/30' },
  { bg: 'bg-amber-50/70 border-amber-200/70 hover:bg-amber-100/60', accent: 'bg-amber-500', selected: 'ring-2 ring-amber-500/30' },
  { bg: 'bg-rose-50/70 border-rose-200/70 hover:bg-rose-100/60', accent: 'bg-rose-500', selected: 'ring-2 ring-rose-500/30' },
];

function getDoctorColor(doctorId: string | undefined | null) {
  if (!doctorId) return DOCTOR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < doctorId.length; i++) hash = (hash * 31 + doctorId.charCodeAt(i)) | 0;
  return DOCTOR_COLORS[Math.abs(hash) % DOCTOR_COLORS.length];
}

const COLUMNS = [
  { key: 'approved', title: 'Upcoming Today', empty: 'No arrivals expected.' },
  { key: 'noShow', title: 'No-Show', empty: 'No missed slots today.' },
  { key: 'checkedIn', title: 'Checked In', empty: 'No patients in rooms.' },
  { key: 'completed', title: 'Completed', empty: 'No completed visits today.' },
];

export function CheckInBoard({ view }: { view: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-stretch h-full min-h-0">
      {COLUMNS.map((col) => (
        <VisitColumn key={col.key} col={col} appointments={view.columns[col.key]} view={view} />
      ))}
    </div>
  );
}

function VisitColumn({ col, appointments, view }: { col: typeof COLUMNS[0]; appointments: AppointmentDto[]; view: any }) {
  return (
    <div className="flex flex-col h-full min-h-0 border-r border-border last:border-r-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/20 shrink-0">
        <span className="text-sm font-medium text-foreground">{col.title}</span>
        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-muted/50 text-muted-foreground">{appointments.length}</span>
      </div>
      <div className="flex flex-col overflow-y-auto flex-1 min-h-0">
          {appointments.map((appointment) => (
            <VisitCard key={appointment.id} appointment={appointment} columnKey={col.key} view={view} />
          ))}
        {appointments.length === 0 && (
          <div className="text-center py-8 px-1.5 text-[10px] text-muted-foreground">{col.empty}</div>
        )}
      </div>
    </div>
  );
}

function VisitCard({ appointment, columnKey, view }: { appointment: AppointmentDto; columnKey: string; view: any }) {
  const checkInGate = view.getCheckInStatus(appointment);
  const doctorColor = useMemo(() => getDoctorColor(appointment.doctorId), [appointment.doctorId]);
  const isSelected =
    view.checkInAppt?.id === appointment.id ||
    view.checkoutAppt?.id === appointment.id ||
    view.viewAppt?.id === appointment.id ||
    view.resolveAppt?.id === appointment.id ||
    view.rescheduleAppt?.id === appointment.id;

  const timeDisplay = `${formatClinicTime(appointment.startTime)} - ${formatClinicTime(appointment.endTime)}`;
  const dateDisplay = formatShortDate(appointment.date);
  const statusBadge = BADGE_STYLES[appointment.status] || 'text-muted-foreground bg-muted/20';

  return (
    <div
      className={`flex flex-row items-stretch text-left transition-all cursor-pointer select-none overflow-hidden border-b border-border ${
        isSelected ? `${doctorColor.bg} ${doctorColor.selected}` : doctorColor.bg
      }`}
      onClick={() => view.handleViewApptDetails(appointment)}
    >
      <div className={`w-1 shrink-0 ${isSelected ? 'bg-slate-900' : doctorColor.accent}`} />
      <div className="flex-1 min-w-0 flex flex-col p-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex w-full items-center gap-2">
            <span className="font-medium text-foreground text-sm leading-tight">
              {appointment.patient?.firstName} {appointment.patient?.lastName}
            </span>
            <span className={`ml-auto text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 shrink-0 ${statusBadge}`}>
              {appointment.status === 'CHECKED_IN' ? 'CHECKED IN' : appointment.status}
            </span>
          </div>
          <span className="font-medium text-xs text-foreground leading-tight">
            {appointment.service?.name || 'Treatment'}
          </span>
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground truncate">
              {dateDisplay} &bull; {timeDisplay}
            </span>
            <span className="text-[11px] text-muted-foreground shrink-0">
              Dr. {appointment.doctor?.lastName || ''}
            </span>
          </div>
        </div>

        <div className="border-b border-border my-2.5" />

        <div className="flex items-stretch gap-2">
          <div className="flex-1 flex flex-col gap-1">
            {columnKey === 'approved' && (
              <button
                onClick={(e) => { e.stopPropagation(); view.setCheckInAppt(appointment); }}
                disabled={!checkInGate.enabled || view.isPending}
                className="w-full h-9 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {checkInGate.enabled ? 'Check In' : checkInGate.message}
              </button>
            )}

            {columnKey === 'noShow' && (
              <button
                onClick={(e) => { e.stopPropagation(); view.setResolveAppt(appointment); }}
                className="w-full h-9 text-xs font-semibold transition-colors bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Resolve No-Show
              </button>
            )}

            {columnKey === 'checkedIn' && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); view.setCheckoutAppt(appointment); }}
                  className="w-full h-9 text-xs font-semibold transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Checkout & Send
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); view.handleUndoCheckIn(appointment.id); }}
                  disabled={view.isPending}
                  className="w-full h-7 text-[10px] font-medium border border-input bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40"
                >
                  Undo Check-In
                </button>
              </>
            )}

            {columnKey === 'completed' && (
              <button
                onClick={(e) => { e.stopPropagation(); view.handleViewApptDetails(appointment); }}
                className="w-full h-9 text-xs font-semibold border border-input bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                View Details
              </button>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); view.handleViewApptDetails(appointment); }}
            className="shrink-0 w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground border border-border/40 hover:border-border transition-colors"
            title="View details"
          >
            <Eye className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
