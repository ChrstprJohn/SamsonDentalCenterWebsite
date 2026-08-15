'use client';

import React, { useMemo } from 'react';
import { FileText, Pin, Plus, Stethoscope } from 'lucide-react';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import type { CalendarNoteResponseDto } from '@/modules/appointments/dtos/calendar-notes/calendar-note-response.dto';
import { formatClinicTime, formatTimeString } from '@/shared/utils/date.util';
import { getDailyScheduleBounds } from '@/shared/utils/schedule-bounds.util';
import { useIsMobile } from '@/shared/hooks/use-mobile';

const COLORS_LIST = [
  { bg: 'bg-blue-50/80', border: 'border-blue-200/80', hover: 'hover:bg-blue-100/90', accent: 'bg-blue-500', text: 'text-blue-950', subtext: 'text-blue-700/90', hex: '#3b82f6' },
  { bg: 'bg-emerald-50/80', border: 'border-emerald-200/80', hover: 'hover:bg-emerald-100/90', accent: 'bg-emerald-500', text: 'text-emerald-950', subtext: 'text-emerald-700/90', hex: '#10b981' },
  { bg: 'bg-violet-50/80', border: 'border-violet-200/80', hover: 'hover:bg-violet-100/90', accent: 'bg-violet-500', text: 'text-violet-950', subtext: 'text-violet-700/90', hex: '#8b5cf6' },
  { bg: 'bg-amber-50/80', border: 'border-amber-200/80', hover: 'hover:bg-amber-100/90', accent: 'bg-amber-500', text: 'text-amber-950', subtext: 'text-amber-700/90', hex: '#f59e0b' },
  { bg: 'bg-rose-50/80', border: 'border-rose-200/80', hover: 'hover:bg-rose-100/90', accent: 'bg-rose-500', text: 'text-rose-950', subtext: 'text-rose-700/90', hex: '#f43f5e' },
  { bg: 'bg-cyan-50/80', border: 'border-cyan-200/80', hover: 'hover:bg-cyan-100/90', accent: 'bg-cyan-500', text: 'text-cyan-950', subtext: 'text-cyan-700/90', hex: '#06b6d4' },
  { bg: 'bg-orange-50/80', border: 'border-orange-200/80', hover: 'hover:bg-orange-100/90', accent: 'bg-orange-500', text: 'text-orange-950', subtext: 'text-orange-700/90', hex: '#f97316' },
  { bg: 'bg-fuchsia-50/80', border: 'border-fuchsia-200/80', hover: 'hover:bg-fuchsia-100/90', accent: 'bg-fuchsia-500', text: 'text-fuchsia-950', subtext: 'text-fuchsia-700/90', hex: '#d946ef' },
];


export const getDoctorColor = (doctorId: string, index?: number) => {
  if (index !== undefined) return COLORS_LIST[index % COLORS_LIST.length];
  if (!doctorId) return COLORS_LIST[0];
  let hash = 0;
  for (let i = 0; i < doctorId.length; i++) {
    hash = doctorId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % COLORS_LIST.length;
  return COLORS_LIST[idx];
};

interface DoctorTimelineProps {
  doctors: any[];
  appointments: AppointmentDto[];
  notes?: CalendarNoteResponseDto[];
  isLoading: boolean;
  selectedAppointmentId?: string;
  selectedNoteId?: string;
  onSelectAppointment: (appointment: AppointmentDto) => void;
  onSelectNote?: (note: CalendarNoteResponseDto) => void;
  onSlotClick?: (slot: { doctorId: string; date: string; startTime: string }) => void;
  onAddNote?: (data: { date: string; startTime?: string | null; doctorId?: string | null; note: string }) => Promise<boolean>;
  onDeleteNote?: (id: string) => Promise<boolean>;
  viewMode: 'day' | 'week';
  selectedDate: string;
  operatingHours?: ClinicConfigResponseDto['operatingHours'] | null;
  /** Stable color index per doctor id, from the full (unfiltered) doctor list. */
  doctorColorIndex?: Record<string, number>;
}

export function DoctorTimeline({
  doctors,
  appointments,
  notes = [],
  isLoading,
  selectedAppointmentId,
  selectedNoteId,
  onSelectAppointment,
  onSelectNote,
  onSlotClick,
  onAddNote,
  onDeleteNote,
  viewMode = 'day',
  selectedDate,
  operatingHours,
  doctorColorIndex,
}: DoctorTimelineProps) {
  const isMobile = useIsMobile();
  const rightColWidth = isMobile ? '0px' : '35px';

  const parseTimeToMinutes = (timeStr: string | null): number | null => {
    if (!timeStr) return null;
    const match = timeStr.match(/(?:T|\b)(\d{2}):(\d{2})/);
    if (!match) return null;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours * 60 + minutes;
  };

  // Calculate 5 days from selectedDate
  const daysOfWeek = useMemo(() => {
    if (!selectedDate) return [];
    const [year, month, day] = selectedDate.split('-').map(Number);

    const days = [];
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 0; i < 5; i++) {
      const nextDay = new Date(year, month - 1, day + i);
      const y = nextDay.getFullYear();
      const m = String(nextDay.getMonth() + 1).padStart(2, '0');
      const d = String(nextDay.getDate()).padStart(2, '0');
      const dayOfWeekName = weekdays[nextDay.getDay()];
      days.push({
        dateStr: `${y}-${m}-${d}`,
        label: dayOfWeekName,
        shortLabel: `${dayOfWeekName.substring(0, 3)} ${m}/${d}`,
      });
    }
    return days;
  }, [selectedDate]);

  // Dynamic bounds calculation with fallback to 07:50 AM (470m) - 05:00 PM (1020m)
  const { startTimeMins, endTimeMins, unavailableRanges } = useMemo(() => {
    const DEFAULT_START = 470; // 07:50 AM
    const DEFAULT_END = 1020;  // 05:00 PM

    if (!operatingHours) {
      return { startTimeMins: DEFAULT_START, endTimeMins: DEFAULT_END, unavailableRanges: [] };
    }

    if (viewMode === 'day') {
      const bounds = getDailyScheduleBounds(selectedDate, operatingHours);
      if (!bounds.isOpen || !bounds.minTime || !bounds.maxTime) {
        return { startTimeMins: DEFAULT_START, endTimeMins: DEFAULT_END, unavailableRanges: [] };
      }
      const minMins = parseTimeToMinutes(bounds.minTime) ?? 480;
      const maxMins = parseTimeToMinutes(bounds.maxTime) ?? 1020;
      // Start 10 minutes prior to open time for padding (matching standard 07:50 for 08:00 open)
      const calculatedStart = Math.max(0, minMins - 10);
      // End 10 minutes after close so the closing hour label stays visible at the bottom edge
      const calculatedEnd = Math.max(calculatedStart + 60, maxMins + 10);
      return {
        startTimeMins: calculatedStart,
        endTimeMins: calculatedEnd,
        unavailableRanges: bounds.unavailableRanges || [],
      };
    } else {
      // For week view: take earliest minTime and latest maxTime across open days
      let earliestMin: number | null = null;
      let latestMax: number | null = null;

      for (const day of daysOfWeek) {
        const bounds = getDailyScheduleBounds(day.dateStr, operatingHours);
        if (bounds.isOpen && bounds.minTime && bounds.maxTime) {
          const min = parseTimeToMinutes(bounds.minTime);
          const max = parseTimeToMinutes(bounds.maxTime);
          if (min !== null) earliestMin = earliestMin === null ? min : Math.min(earliestMin, min);
          if (max !== null) latestMax = latestMax === null ? max : Math.max(latestMax, max);
        }
      }

      if (earliestMin === null || latestMax === null) {
        return { startTimeMins: DEFAULT_START, endTimeMins: DEFAULT_END, unavailableRanges: [] };
      }

      const calculatedStart = Math.max(0, earliestMin - 10);
      const calculatedEnd = Math.max(calculatedStart + 60, latestMax + 10);
      return {
        startTimeMins: calculatedStart,
        endTimeMins: calculatedEnd,
        unavailableRanges: [],
      };
    }
  }, [operatingHours, selectedDate, viewMode, daysOfWeek]);

  const slotDuration = 5;
  const totalSlots = Math.max(1, Math.round((endTimeMins - startTimeMins) / slotDuration));
  const totalMinutes = endTimeMins - startTimeMins;

  const formatMinutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    if (minutes === 0) {
      return `${displayHours} ${ampm}`;
    }
    const displayMinutes = String(minutes).padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatPatientName = (appointment: AppointmentDto): string => {
    const formatNameWithMiddleAndSuffix = (first?: string | null, middle?: string | null, last?: string | null, suffix?: string | null) => {
      const initial = middle ? ` ${middle.charAt(0).toUpperCase()}.` : '';
      return `${first || ''}${initial} ${last || ''}`.trim() + (suffix ? `, ${suffix}` : '');
    };

    if (appointment.dependent) {
      const holder = appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Unknown';
      return `${appointment.dependent.firstName} ${appointment.dependent.lastName} (Dep. of ${holder})`;
    }
    if (appointment.guestContact) {
      return formatNameWithMiddleAndSuffix(
        appointment.guestContact.firstName,
        appointment.guestContact.middleName,
        appointment.guestContact.lastName,
        appointment.guestContact.suffix
      );
    }
    if ((appointment.source === 'STAFF_CREATED' || appointment.source === 'CONVERTED') && !appointment.patientId) {
      return `${appointment.patient?.firstName ?? 'Guest'} ${appointment.patient?.lastName ?? ''} (Guest)`;
    }
    return appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Guest Patient';
  };

  // Per-day active doctors for week view
  const perDayDoctorIds = useMemo(() => {
    if (viewMode !== 'week') return {};
    const activeStatuses = ['APPROVED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW'];
    const result: Record<string, string[]> = {};
    for (const app of appointments) {
      if (!activeStatuses.includes(app.status) || !app.doctorId || !doctors.some(d => d.id === app.doctorId)) continue;
      if (!result[app.date]) result[app.date] = [];
      if (!result[app.date].includes(app.doctorId)) {
        result[app.date].push(app.doctorId);
      }
    }
    return result;
  }, [appointments, doctors, viewMode]);

  // Proportional column widths for week view based on active doctor count per day
  const dayFrUnits = useMemo(() => {
    if (viewMode !== 'week') return [];
    return daysOfWeek.map(day =>
      Math.max(perDayDoctorIds[day.dateStr]?.length || 1, 1)
    );
  }, [daysOfWeek, perDayDoctorIds, viewMode]);

  // Per-day break ranges for week view (each day can have its own break)
  const dayUnavailableRanges = useMemo(() => {
    if (viewMode !== 'week') return {} as Record<string, Array<{ start: string; end: string }>>;
    const map: Record<string, Array<{ start: string; end: string }>> = {};
    for (const day of daysOfWeek) {
      map[day.dateStr] = getDailyScheduleBounds(day.dateStr, operatingHours).unavailableRanges || [];
    }
    return map;
  }, [viewMode, daysOfWeek, operatingHours]);

  // Per-day open state + hours for week view (closed days show disabled column, out-of-hours blocked)
  const dayBounds = useMemo(() => {
    if (viewMode !== 'week') return {} as Record<string, { isOpen: boolean; minMins: number | null; maxMins: number | null }>;
    const map: Record<string, { isOpen: boolean; minMins: number | null; maxMins: number | null }> = {};
    for (const day of daysOfWeek) {
      const b = getDailyScheduleBounds(day.dateStr, operatingHours);
      map[day.dateStr] = {
        isOpen: b.isOpen,
        minMins: b.minTime ? parseTimeToMinutes(b.minTime) : null,
        maxMins: b.maxTime ? parseTimeToMinutes(b.maxTime) : null,
      };
    }
    return map;
  }, [viewMode, daysOfWeek, operatingHours]);

  // Earliest open / latest close across open days — the grid-defining extremes get no out-of-hours strip
  const weekExtremes = useMemo(() => {
    let earliest: number | null = null;
    let latest: number | null = null;
    for (const day of daysOfWeek) {
      const b = dayBounds[day.dateStr];
      if (!b?.isOpen || b.minMins === null || b.maxMins === null) continue;
      if (earliest === null || b.minMins < earliest) earliest = b.minMins;
      if (latest === null || b.maxMins > latest) latest = b.maxMins;
    }
    return { earliest, latest };
  }, [dayBounds, daysOfWeek]);
  const placedAppointments = useMemo(() => {
    const activeStatuses = ['APPROVED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW'];
    const relevant = appointments.filter((app) => activeStatuses.includes(app.status) && app.doctorId && doctors.some(d => d.id === app.doctorId));

    return relevant.map((app) => {
      const docIndex = doctors.findIndex((d) => d.id === app.doctorId); // grid column position (filtered order)
      const colorIndex = doctorColorIndex?.[app.doctorId ?? ''] ?? docIndex; // stable color from full list order

      const startMin = parseTimeToMinutes(app.startTime);
      const endMin = parseTimeToMinutes(app.endTime);

      if (startMin === null || endMin === null) return null;

      const clampedStart = Math.max(startTimeMins, Math.min(endTimeMins, startMin));
      const clampedEnd = Math.max(startTimeMins, Math.min(endTimeMins, endMin));

      if (clampedEnd <= clampedStart) return null;

      const topPercent = ((clampedStart - startTimeMins) / totalMinutes) * 100;
      const heightPercent = ((clampedEnd - clampedStart) / totalMinutes) * 100;
      const isSmallCard = (clampedEnd - clampedStart) <= 20;

      let col = -1;
      let left = '0%';
      let width = '100%';

      if (viewMode === 'week') {
        const dayIdx = daysOfWeek.findIndex((d) => d.dateStr === app.date);
        if (dayIdx === -1) return null;
        col = dayIdx + 3; // +3 accounts for: col1=time-left, col2=notes, col3+=days

        const activeDoctors = perDayDoctorIds[app.date] || [];
        const activeCount = activeDoctors.length;
        if (activeCount > 0) {
          const activeIdx = activeDoctors.indexOf(app.doctorId!);
          width = `${100 / activeCount}%`;
          left = `${(activeIdx * 100) / activeCount}%`;
        }
      } else {
        col = docIndex + 3; // +3 accounts for: col1=time-left, col2=notes, col3+=doctors
      }

      return {
        appointment: app,
        col,
        docIndex,
        colorIndex,
        topPercent,
        heightPercent,
        isSmallCard,
        width,
        left,
        activeDoctorCount: viewMode === 'week' ? (perDayDoctorIds[app.date] || []).length : doctors.length,
        durationMins: clampedEnd - clampedStart,
      };
    })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [appointments, doctors, doctorColorIndex, viewMode, daysOfWeek, startTimeMins, endTimeMins, totalMinutes, perDayDoctorIds]);

  const placedNotes = useMemo(() => {
    return notes
      .map((n) => {
        // Filter: in week view, only show notes whose date is in the visible week
        if (viewMode === 'week') {
          const dayIdx = daysOfWeek.findIndex((d) => d.dateStr === n.date);
          if (dayIdx === -1) return null;
        }

        return { note: n };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => {
        // 1. Sort by scheduled date
        const dateA = a.note.date || '';
        const dateB = b.note.date || '';
        if (dateA !== dateB) return dateA.localeCompare(dateB);

        // 2. Sort by startTime if available
        const timeA = a.note.startTime || '';
        const timeB = b.note.startTime || '';
        if (timeA && timeB) {
          const cmp = timeA.localeCompare(timeB);
          if (cmp !== 0) return cmp;
        } else if (timeA && !timeB) {
          return -1;
        } else if (!timeA && timeB) {
          return 1;
        }

        // 3. Fallback to creation timestamp
        const createdA = a.note.createdAt || '';
        const createdB = b.note.createdAt || '';
        return createdA.localeCompare(createdB);
      });
  }, [notes, viewMode, daysOfWeek]);

  if (doctors.length === 0) {
    return (
      <div className="flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/10 space-y-2 flex">
        <Stethoscope className="size-12 text-muted-foreground/40" />
        <p className="text-sm font-medium">No active doctors selected.</p>
        <p className="text-xs text-muted-foreground">Select doctors from the sidebar to view their schedules.</p>
      </div>
    );
  }

  // +1 for the dedicated notes column
  const columnsCount = viewMode === 'week' ? 5 : doctors.length;
  // Total grid columns: 1 time-left + 1 notes + columnsCount doc/day + 1 time-right
  const totalGridCols = columnsCount + 3;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-card overflow-hidden relative">
      {/* Scrollable Container wrapper */}
      <div className="flex-1 overflow-auto relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" data-lenis-prevent style={{ scrollbarWidth: 'thin' }}>
        <div
          className="grid relative"
          style={{
            gridTemplateColumns: viewMode === 'week'
              ? `35px minmax(140px, 1fr) ${dayFrUnits.map(f => `minmax(140px, ${f}fr)`).join(' ')} ${rightColWidth}`
              : `35px minmax(180px, 1fr) repeat(${doctors.length}, minmax(180px, 1fr)) ${rightColWidth}`,
            gridTemplateRows: `auto repeat(${totalSlots}, 10px)`,
          }}
        >
          {/* Header Row — col 1: time gutter */}
          <div
            className="sticky top-0 left-0 bg-card border-r border-r-slate-300 border-b border-border px-0.5 py-2 text-center text-xs font-bold text-text-primary tracking-wide z-30 h-full"
            style={{ gridColumn: 1, gridRow: 1 }}
          >
            &nbsp;
          </div>

          {/* Header Row — col 2: Notes column */}
          <div
            className="sticky top-0 bg-card border-r border-r-slate-300 border-b border-border px-4 py-2 text-center text-xs font-bold text-text-primary z-20 flex items-center justify-center gap-1.5"
            style={{ gridColumn: 2, gridRow: 1 }}
          >
            <FileText className="size-3.5 text-muted-foreground shrink-0" />
            <span>Notes ({placedNotes.length})</span>
          </div>

          {viewMode === 'week' ? (
            daysOfWeek.map((day, index) => {
              const count = appointments.filter((app) => app.date === day.dateStr && doctors.some(d => d.id === app.doctorId) && ['APPROVED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW'].includes(app.status)).length;
              const b = dayBounds[day.dateStr];
              const closed = !b?.isOpen;
              return (
                <div
                  key={day.dateStr}
                  className={`sticky top-0 border-r border-r-slate-300 border-b border-border px-4 py-2 text-center text-sm font-normal truncate z-20 ${closed ? 'bg-muted/40 text-muted-foreground' : 'bg-card text-sidebar-foreground'}`}
                  style={{ gridColumn: index + 3, gridRow: 1 }}
                >
                  {closed ? `${day.shortLabel} · Closed` : `${day.shortLabel} (${count})`}
                </div>
              );
            })
          ) : (
            doctors.map((doctor, index) => {
              const count = appointments.filter((app) => app.doctorId === doctor.id && ['APPROVED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW'].includes(app.status)).length;
              const color = getDoctorColor(doctor.id, doctorColorIndex?.[doctor.id] ?? index);
              return (
                <div
                  key={doctor.id}
                  className="sticky top-0 bg-card border-r border-r-slate-300 border-b border-border px-4 py-2 text-center text-xs font-bold text-text-primary z-20"
                  style={{ gridColumn: index + 3, gridRow: 1 }}
                >
                  <span className="inline-flex items-center justify-center gap-1.5 truncate">
                    <span className={`size-2 rounded-full shrink-0 ${color.accent}`} />
                    Dr. {doctor.lastName} ({count})
                  </span>
                </div>
              );
            })
          )}

          {/* Right time label header */}
          <div
            className="sticky top-0 right-0 bg-card border-l border-l-slate-300 border-b border-border px-0.5 py-2 text-center text-xs font-bold text-text-primary tracking-wide z-30 max-md:hidden"
            style={{ gridColumn: totalGridCols, gridRow: 1 }}
          >
            &nbsp;
          </div>

          {/* Time lines & Background Grid cells */}
          {Array.from({ length: totalSlots }).map((_, rowIndex) => {
            const minutes = startTimeMins + rowIndex * slotDuration;
            const timeStr = formatMinutesToTime(minutes);
            const isHourMark = minutes % 60 === 0;
            const isTenMinMark = minutes % 10 === 0;
            const isLineRow = (minutes + slotDuration) % 10 === 0;

            return (
              <React.Fragment key={rowIndex}>
                {/* Left Time Label column */}
                <div
                  className={"sticky left-0 bg-card border-r border-r-slate-300 z-20 transition-colors flex items-start justify-end px-0.5 text-right h-full " + (isHourMark ? 'text-foreground text-[11px]' : 'text-text-secondary font-normal text-[10px]') + " " + (isLineRow ? 'border-b border-border' : 'border-b border-border/25')}
                   style={{ gridColumn: 1, gridRow: rowIndex + 2 }}
                >
                  {isTenMinMark && minutes >= (startTimeMins + 10) ? (
                    <span style={{ transform: 'translateY(-50%)', display: 'inline-block', lineHeight: 1 }}>
                      {isHourMark ? timeStr : minutes % 60}
                    </span>
                  ) : ''}
                </div>

                {/* Notes column background cell — col 2 */}
                <div
                  className={`border-r border-r-slate-300 transition-colors ${
                    isLineRow ? 'border-b border-border' : 'border-b border-border/25'
                  } ${isHourMark ? 'bg-muted/10' : 'bg-transparent'}`}
                  style={{ gridColumn: 2, gridRow: rowIndex + 2 }}
                />

                {/* Empty columns behind appointment cards — doctor/day cols start at col 3 */}
                {(viewMode === 'week' ? daysOfWeek : doctors).map((item, colIndex) => {
                  const doctorId = viewMode === 'day' ? (item as any).id : '';
                  const date = viewMode === 'week' ? (item as any).dateStr : selectedDate;
                  const b = viewMode === 'week' ? dayBounds[date] : null;
                  const closed = viewMode === 'week' && !b?.isOpen;
                  // Real out-of-hours only — skip the 10-min filler padding rows at grid edges
                  const outOfHours = viewMode === 'week' && !!b?.isOpen && b.minMins !== null && b.maxMins !== null && ((minutes >= startTimeMins + 10 && minutes < b.minMins) || (minutes >= b.maxMins && minutes < endTimeMins - 10));
                  const ranges = viewMode === 'week' ? (dayUnavailableRanges[date] || []) : unavailableRanges;
                  const cellIsBreakTime = ranges.some(
                    (r) => {
                      const s = parseTimeToMinutes(r.start);
                      const e = parseTimeToMinutes(r.end);
                      return s !== null && e !== null && minutes >= s && minutes < e;
                    }
                  );
                  return (
                    <div
                      key={viewMode === 'week' ? (item as any).dateStr : (item as any).id}
                      className={`border-r border-r-slate-300 transition-colors ${
                        isLineRow ? 'border-b border-border' : 'border-b border-border/25'
                      } ${closed ? 'bg-muted/30' : (outOfHours ? 'bg-muted/20' : (cellIsBreakTime ? 'bg-muted/40' : (isHourMark ? 'bg-muted/10' : 'bg-transparent')))} ${onSlotClick && !closed && !outOfHours ? 'cursor-crosshair' : ''}`}
                      style={{ gridColumn: colIndex + 3, gridRow: rowIndex + 2 }}
                      onClick={(e) => {
                        if (!onSlotClick) return;
                        // Non-bookable blocks: break time, closed days, pre-open padding
                        if (cellIsBreakTime) return;
                        const bounds = getDailyScheduleBounds(date, operatingHours);
                        if (!bounds.isOpen || !bounds.minTime || !bounds.maxTime) return;
                        const openMins = parseTimeToMinutes(bounds.minTime);
                        if (openMins !== null && minutes < openMins) return;
                        // Post-close padding rows are dead, same as pre-open padding
                        const closeMins = parseTimeToMinutes(bounds.maxTime);
                        if (closeMins !== null && minutes >= closeMins) return;
                        // Snap to the 5-min slot this row represents
                        const snappedMins = startTimeMins + rowIndex * slotDuration;
                        const h = Math.floor(snappedMins / 60);
                        const m = snappedMins % 60;
                        const startTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                        onSlotClick({ doctorId, date, startTime });
                      }}
                    />
                  );
                })}

                {/* Right Time Label column */}
                <div
                  className={"sticky right-0 bg-card border-l border-l-slate-300 z-20 transition-colors flex items-start justify-start px-0.5 text-left h-full max-md:hidden " + (isHourMark ? 'text-foreground text-[11px]' : 'text-text-secondary font-normal text-[10px]') + " " + (isLineRow ? 'border-b border-border' : 'border-b border-border/25')}
                   style={{ gridColumn: totalGridCols, gridRow: rowIndex + 2 }}
                >
                  {isTenMinMark && minutes >= (startTimeMins + 10) ? (
                    <span style={{ transform: 'translateY(-50%)', display: 'inline-block', lineHeight: 1 }}>
                      {isHourMark ? timeStr : minutes % 60}
                    </span>
                  ) : ''}
                </div>
              </React.Fragment>
            );
          })}

          {/* Break time overlay card — spans all doctor columns in day view, per-day column in week view */}
          {viewMode === 'week' ? (
            daysOfWeek.map((day, dayIdx) => {
              const dayRanges = dayUnavailableRanges[day.dateStr] || [];
              return dayRanges.map((range) => {
                const s = parseTimeToMinutes(range.start);
                const e = parseTimeToMinutes(range.end);
                if (s === null || e === null) return null;
                const startRow = Math.max(2, Math.round((s - startTimeMins) / slotDuration) + 2);
                const endRow = Math.min(totalSlots + 2, Math.round((e - startTimeMins) / slotDuration) + 2);
                if (endRow <= startRow) return null;
                return (
                  <div
                    key={`${day.dateStr}-${range.start}`}
                    className="pointer-events-none z-0 flex flex-col items-center justify-center gap-0.5 border-2 border-dashed border-gray-400/80"
                    style={{
                      gridColumn: dayIdx + 3,
                      gridRow: `${startRow} / ${endRow}`,
                      backgroundImage: 'repeating-linear-gradient(45deg, #f3f4f6 0 10px, #e5e7eb 10px 20px)',
                    }}
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-gray-500">Break Time</span>
                    <span className="text-[10px] font-semibold text-gray-500">{formatMinutesToTime(s)}–{formatMinutesToTime(e)}</span>
                  </div>
                );
              });
            })
          ) : (
            unavailableRanges.map((range) => {
              const s = parseTimeToMinutes(range.start);
              const e = parseTimeToMinutes(range.end);
              if (s === null || e === null) return null;
              const startRow = Math.max(2, Math.round((s - startTimeMins) / slotDuration) + 2);
              const endRow = Math.min(totalSlots + 2, Math.round((e - startTimeMins) / slotDuration) + 2);
              if (endRow <= startRow) return null;
              return (
                <div
                  key={range.start}
                  className="pointer-events-none z-0 flex flex-col items-center justify-center gap-0.5 border-2 border-dashed border-gray-400/80"
                  style={{
                    gridColumn: `3 / ${columnsCount + 3}`,
                    gridRow: `${startRow} / ${endRow}`,
                    backgroundImage: 'repeating-linear-gradient(45deg, #f3f4f6 0 10px, #e5e7eb 10px 20px)',
                  }}
                >
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-gray-500">Break Time</span>
                  <span className="text-[10px] font-semibold text-gray-500">{formatMinutesToTime(s)}–{formatMinutesToTime(e)}</span>
                </div>
              );
            })
          )}

          {/* Closed / outside-hours overlay — same styling as break time for consistency */}
          {viewMode === 'week' && daysOfWeek.map((day, dayIdx) => {
            const b = dayBounds[day.dateStr];
            if (!b) return null;
            if (!b.isOpen) {
              const closedDays = daysOfWeek.filter((d) => !dayBounds[d.dateStr]?.isOpen).map((d) => d.label.substring(0, 3).toUpperCase());
              return (
                <div
                  key={`closed-${day.dateStr}`}
                  className="pointer-events-none z-0 flex flex-col items-center justify-center gap-0.5 border-2 border-dashed border-gray-400/80"
                  style={{
                    gridColumn: dayIdx + 3,
                    gridRow: `2 / ${totalSlots + 2}`,
                    backgroundImage: 'repeating-linear-gradient(45deg, #f3f4f6 0 10px, #e5e7eb 10px 20px)',
                  }}
                >
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-gray-500">Closed</span>
                  <span className="text-[10px] font-semibold text-gray-500">{closedDays.join(', ')}</span>
                </div>
              );
            }
            const strips: { label: string; time: string; startRow: number; endRow: number }[] = [];
            // Skip the grid-defining day(s) — longest hours, no out-of-hours region of their own
            // Time line shows the day's operating hours — the reason the rest is gray
            if (b.minMins !== null && b.maxMins !== null && b.minMins !== weekExtremes.earliest) {
              strips.push({ label: 'Before Opening', time: `${formatMinutesToTime(b.minMins)}–${formatMinutesToTime(b.maxMins)}`, startRow: 2, endRow: Math.min(totalSlots + 2, Math.round((b.minMins - startTimeMins) / slotDuration) + 2) });
            }
            if (b.minMins !== null && b.maxMins !== null && b.maxMins !== weekExtremes.latest) {
              strips.push({ label: 'After Closing', time: `${formatMinutesToTime(b.minMins)}–${formatMinutesToTime(b.maxMins)}`, startRow: Math.max(2, Math.round((b.maxMins - startTimeMins) / slotDuration) + 2), endRow: totalSlots + 2 });
            }
            return strips.map((s) => (
              <div
                key={`${day.dateStr}-${s.label}`}
                className="pointer-events-none z-0 flex flex-col items-center justify-center gap-0.5 border-2 border-dashed border-gray-400/80"
                style={{
                  gridColumn: dayIdx + 3,
                  gridRow: `${s.startRow} / ${s.endRow}`,
                  backgroundImage: 'repeating-linear-gradient(45deg, #f3f4f6 0 10px, #e5e7eb 10px 20px)',
                }}
              >
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-gray-500">{s.label}</span>
                <span className="text-[10px] font-semibold text-gray-500">{s.time}</span>
              </div>
            ));
          })}

          {/* Dedicated Notes Column (col 2) — stacked flow layout so notes never overlap */}
          <div
            className="z-10 flex flex-col gap-1.5 p-1.5 overflow-y-auto w-full"
            style={{
              gridColumn: 2,
              gridRow: `2 / span ${totalSlots}`,
              alignContent: 'start',
            }}
          >
            {placedNotes.map(({ note }) => {
              const isSelected = selectedNoteId === note.id;

              // Parse title and body from note content (split on first double-newline or newline if present)
              const rawNote = note.note || '';
              let title = '';
              let body = '';
              if (rawNote.includes('\n\n')) {
                const parts = rawNote.split(/\n\n([\s\S]*)/);
                title = parts[0]?.trim() || '';
                body = parts[1]?.trim() || '';
              } else if (rawNote.includes('\n')) {
                const parts = rawNote.split(/\n([\s\S]*)/);
                title = parts[0]?.trim() || '';
                body = parts[1]?.trim() || '';
              } else {
                body = rawNote;
              }

              const displayTitle = title;
              const displayBody = body;

              return (
                <div
                  key={`note-${note.id}`}
                  onClick={() => onSelectNote?.(note)}
                  className={`w-full flex flex-col text-left text-xs transition-all cursor-pointer select-none shrink-0 overflow-hidden rounded-none ${
                    isSelected
                      ? 'ring-2 ring-amber-600/90 shadow-md scale-[1.01]'
                      : 'hover:shadow-md shadow-sm border border-amber-300/60'
                  }`}
                  style={{
                    height: '90px',
                    background: '#fde047',
                    boxShadow: isSelected
                      ? '0 6px 16px 0 rgba(120,100,0,0.25), 0 2px 4px 0 rgba(120,100,0,0.12)'
                      : '0 2px 6px 0 rgba(120,100,0,0.12), 0 1px 2px 0 rgba(120,100,0,0.06)',
                  }}
                  title={rawNote}
                >
                  {/* Sticky note top bar / fold line */}
                  <div
                    className="flex items-center justify-between px-2 pt-1.5 pb-1 shrink-0"
                    style={{ borderBottom: '1px solid rgba(161,120,0,0.20)' }}
                  >
                    <div
                      className={`truncate text-sm leading-none capitalize ${isSelected ? 'font-medium' : 'font-normal'}`}
                      style={{ color: '#92400e' }}
                      title={displayTitle}
                    >
                      {displayTitle || <span style={{ color: '#a16207', fontWeight: 400, fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>Untitled note</span>}
                    </div>
                    {/* Decorative pin — display only, no action */}
                    <Pin
                      className="ml-1 shrink-0 size-3 rotate-45"
                      style={{ color: '#a16207', opacity: 0.7 }}
                    />
                  </div>

                  {/* Date & time row — shows the note's scheduled date */}
                  <div className="px-2 pt-1 shrink-0">
                    <span className="text-[10px] font-medium leading-none" style={{ color: '#a16207', opacity: 0.85 }}>
                      {(() => {
                        if (!note.date) return '';
                        const [y, m, d] = note.date.split('-').map(Number);
                        const dateObj = new Date(y, m - 1, d);
                        const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        if (note.startTime) {
                          return `${dateFormatted} · ${formatClinicTime(note.startTime)}`;
                        }
                        return dateFormatted;
                      })()}
                    </span>
                  </div>

                  {/* Note Content Body — always rendered, fallback if empty */}
                  <div className="flex-1 px-2 pt-0.5 overflow-hidden">
                    {displayBody ? (
                      <p className="text-[11px] line-clamp-2 font-normal leading-snug break-words [overflow-wrap:anywhere]" style={{ color: '#78350f' }}>
                        {displayBody}
                      </p>
                    ) : (
                      <p className="text-[11px] italic leading-snug" style={{ color: '#b45309', opacity: 0.6 }}>
                        No description added
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Appointment card overlay — one layer per doctor/day column (cols 3+) */}
          {(viewMode === 'week' ? daysOfWeek : doctors).map((item, colIndex) => {
            const col = colIndex + 3;
            const colCards = placedAppointments.filter(c => c.col === col);
            if (colCards.length === 0) return null;

            return (
              <div
                key={viewMode === 'week' ? `card-layer-${(item as any).dateStr}` : `card-layer-${(item as any).id}`}
                className="z-0"
                style={{
                  gridColumn: col,
                  gridRow: `2 / span ${totalSlots}`,
                  position: 'relative',
                  pointerEvents: 'none',
                }}
              >
                {colCards.map(({ appointment, colorIndex, topPercent, heightPercent, isSmallCard, left, width, activeDoctorCount, durationMins }) => {
                  const isSelected = selectedAppointmentId === appointment.id;
                  const patientName = formatPatientName(appointment);
                  const serviceName = appointment.service?.name || 'Treatment';
                  const timeRange = appointment.startTime && appointment.endTime
                    ? `${formatClinicTime(appointment.startTime)} - ${formatClinicTime(appointment.endTime)}`
                    : '';
                  const doctorName = viewMode === 'week'
                    ? ` | Dr. ${appointment.doctor?.lastName || ''}`
                    : '';

                  const color = getDoctorColor(appointment.doctorId || '', colorIndex);
                  const showTime = viewMode === 'day' || activeDoctorCount <= 1;

                  return (
                    <div
                      key={appointment.id}
                      onClick={() => onSelectAppointment(appointment)}
                      className={`absolute pl-0 pr-1.5 py-0 flex flex-row justify-start items-stretch text-left text-xs transition-all cursor-pointer shadow-sm border select-none overflow-hidden hover:shadow ${
                        isSelected
                          ? `${color.bg} ${color.hover} ${color.border} ${color.text} ring-2 ring-slate-800/10 font-semibold scale-[1.01]`
                          : `${color.bg} ${color.hover} ${color.border} ${color.text}`
                      }`}
                      style={{
                        top: `calc(${topPercent}% + 1px)`,
                        height: `calc(${heightPercent}% - 2px)`,
                        left: left,
                        width: width,
                        pointerEvents: 'auto',
                      }}
                    >
                      {/* Left Accent Bar */}
                      <div 
                        className={`w-1 shrink-0 mr-1.5 ${
                          isSelected ? 'bg-slate-900' : color.accent
                        }`} 
                      />

                      {/* Content Column */}
                      <div className="flex-1 min-w-0 flex flex-col justify-start py-1 px-1 h-full min-h-0 gap-[3px]">
                        {/* Row 1: Name & Time (Time on top-right only if card duration <= 20 mins) */}
                        <div className="flex justify-between items-start gap-2 w-full">
                          <div className={`font-normal truncate text-sm leading-none ${isSelected ? 'font-medium' : ''} ${color.text}`} title={patientName}>
                            {patientName}
                          </div>
                          {timeRange && isSmallCard && showTime && (
                            <span className={`text-[10px] leading-none shrink-0 pt-0.5 font-normal ${color.subtext}`}>
                              {timeRange.toLowerCase().replace(/ /g, '')}
                            </span>
                          )}
                        </div>

                        {/* Row 2: Service */}
                        {durationMins > 15 && (
                          <div className={`truncate text-[11px] leading-none font-normal ${color.subtext}`} title={serviceName}>
                            {serviceName}
                          </div>
                        )}

                        {/* Row 3: Time (Under service name, hidden if duration <= 20m or multiple doctors in week view) */}
                        {timeRange && !isSmallCard && showTime && (
                          <div className={`truncate text-[10px] leading-none font-normal opacity-80 ${color.subtext}`}>
                            {timeRange.toLowerCase().replace(/ /g, '')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      {isLoading && (
        <div className="absolute inset-0 bg-card flex flex-col items-center justify-center gap-3 z-50">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          </div>
          <div className="text-sm font-semibold text-text-primary">Updating timeline...</div>
        </div>
      )}
    </div>
  );
}
