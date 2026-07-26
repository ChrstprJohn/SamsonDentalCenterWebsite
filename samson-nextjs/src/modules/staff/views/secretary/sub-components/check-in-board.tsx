'use client';

import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
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
  { bg: 'bg-blue-50/80 border-blue-200/80 hover:bg-blue-100/80', accent: 'bg-blue-500', selected: 'ring-2 ring-blue-500/30', text: 'text-blue-950', subtext: 'text-blue-700/90' },
  { bg: 'bg-emerald-50/80 border-emerald-200/80 hover:bg-emerald-100/80', accent: 'bg-emerald-500', selected: 'ring-2 ring-emerald-500/30', text: 'text-emerald-950', subtext: 'text-emerald-700/90' },
  { bg: 'bg-violet-50/80 border-violet-200/80 hover:bg-violet-100/80', accent: 'bg-violet-500', selected: 'ring-2 ring-violet-500/30', text: 'text-violet-950', subtext: 'text-violet-700/90' },
  { bg: 'bg-amber-50/80 border-amber-200/80 hover:bg-amber-100/80', accent: 'bg-amber-500', selected: 'ring-2 ring-amber-500/30', text: 'text-amber-950', subtext: 'text-amber-700/90' },
  { bg: 'bg-rose-50/80 border-rose-200/80 hover:bg-rose-100/80', accent: 'bg-rose-500', selected: 'ring-2 ring-rose-500/30', text: 'text-rose-950', subtext: 'text-rose-700/90' },
];

let doctorColorIdx = 0;
const doctorColorMap = new Map<string, number>();

function getDoctorColor(doctorId: string | undefined | null) {
  if (!doctorId) return DOCTOR_COLORS[0];
  if (doctorColorMap.has(doctorId)) return DOCTOR_COLORS[doctorColorMap.get(doctorId)!];
  const idx = doctorColorIdx % DOCTOR_COLORS.length;
  doctorColorIdx++;
  doctorColorMap.set(doctorId, idx);
  return DOCTOR_COLORS[idx];
}

const COLUMNS = [
  { key: 'approved', title: 'Upcoming Today', empty: 'No arrivals expected.' },
  { key: 'noShow', title: 'No-Show', empty: 'No missed slots today.' },
  { key: 'checkedIn', title: 'Checked In', empty: 'No patients in rooms.' },
  { key: 'completed', title: 'Completed', empty: 'No completed visits today.' },
];

export function CheckInBoard({ view, columns }: { view: any; columns?: any }) {
  const cols = columns || view.columns;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-stretch h-full min-h-0">
      {COLUMNS.map((col) => (
        <VisitColumn key={col.key} col={col} appointments={cols[col.key]} view={view} />
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
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }}>
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
  const anySelected = !!(view.checkInAppt || view.checkoutAppt || view.viewAppt || view.resolveAppt || view.rescheduleAppt);

  return (
    <div
      className={`flex flex-row items-stretch text-left transition-all cursor-pointer select-none overflow-hidden border-b border-border ${
        isSelected ? `${doctorColor.bg} ${doctorColor.selected}` : doctorColor.bg
      } ${doctorColor.text}`}
      onClick={() => view.handleViewApptDetails(appointment)}
    >
      <div className={`w-1 shrink-0 ${isSelected ? 'bg-slate-900' : doctorColor.accent}`} />
      <div className="flex-1 min-w-0 flex flex-col p-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex w-full items-center gap-2">
            <span className="font-medium text-sm leading-tight">
              {appointment.patient?.firstName} {appointment.patient?.lastName}
            </span>
            <span className={`ml-auto text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 shrink-0 ${statusBadge} ${anySelected ? 'hidden' : ''}`}>
              {appointment.status === 'CHECKED_IN' ? 'CHECKED IN' : appointment.status}
            </span>
          </div>
          <span className="font-medium text-xs leading-tight">
            {appointment.service?.name || 'Treatment'}
          </span>
          <span className={`text-xs ${doctorColor.subtext} truncate`}>
            {dateDisplay} &bull; {timeDisplay}
          </span>
          <div className="flex w-full items-center gap-2">
            <span className={`text-[11px] truncate ${doctorColor.subtext}`}>
              Dr. {appointment.doctor?.lastName || ''}
            </span>
            <ChevronRight className={`ml-auto size-5 ${doctorColor.subtext}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
