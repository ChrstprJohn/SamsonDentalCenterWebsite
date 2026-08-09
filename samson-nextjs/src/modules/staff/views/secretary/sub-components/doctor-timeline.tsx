'use client';

import React, { useMemo } from 'react';
import { Stethoscope } from 'lucide-react';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import { formatClinicTime } from '@/shared/utils/date.util';
import { useIsMobile } from '@/shared/hooks/use-mobile';

const COLORS_LIST = [
  { bg: 'bg-blue-50/80', border: 'border-blue-200/80', hover: 'hover:bg-blue-100/90', accent: 'bg-blue-500', text: 'text-blue-950', subtext: 'text-blue-700/90', hex: '#3b82f6' },
  { bg: 'bg-emerald-50/80', border: 'border-emerald-200/80', hover: 'hover:bg-emerald-100/90', accent: 'bg-emerald-500', text: 'text-emerald-950', subtext: 'text-emerald-700/90', hex: '#10b981' },
  { bg: 'bg-violet-50/80', border: 'border-violet-200/80', hover: 'hover:bg-violet-100/90', accent: 'bg-violet-500', text: 'text-violet-950', subtext: 'text-violet-700/90', hex: '#8b5cf6' },
  { bg: 'bg-amber-50/80', border: 'border-amber-200/80', hover: 'hover:bg-amber-100/90', accent: 'bg-amber-500', text: 'text-amber-950', subtext: 'text-amber-700/90', hex: '#f59e0b' },
  { bg: 'bg-rose-50/80', border: 'border-rose-200/80', hover: 'hover:bg-rose-100/90', accent: 'bg-rose-500', text: 'text-rose-950', subtext: 'text-rose-700/90', hex: '#f43f5e' },
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
  isLoading: boolean;
  selectedAppointmentId?: string;
  onSelectAppointment: (appointment: AppointmentDto) => void;
  onSlotClick?: (slot: { doctorId: string; date: string; startTime: string }) => void;
  viewMode: 'day' | 'week';
  selectedDate: string;
}

export function DoctorTimeline({
  doctors,
  appointments,
  isLoading,
  selectedAppointmentId,
  onSelectAppointment,
  onSlotClick,
  viewMode = 'day',
  selectedDate,
}: DoctorTimelineProps) {
  const isMobile = useIsMobile();
  const rightColWidth = isMobile ? '0px' : '35px';

  // 5-minute intervals from 07:50 AM (470 mins) to 05:00 PM (1020 mins)
  const startTimeMins = 470;
  const endTimeMins = 1020;
  const slotDuration = 5;
  const totalSlots = (endTimeMins - startTimeMins) / slotDuration; // 110 slots

  const parseTimeToMinutes = (timeStr: string | null): number | null => {
    if (!timeStr) return null;
    const match = timeStr.match(/(?:T|\b)(\d{2}):(\d{2})/);
    if (!match) return null;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours * 60 + minutes;
  };

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

  const totalMinutes = endTimeMins - startTimeMins; // 540

  // Calculate 5 days from selectedDate
  const daysOfWeek = useMemo(() => {
    if (!selectedDate) return [];
    const date = new Date(selectedDate + 'T00:00:00');

    const days = [];
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 0; i < 5; i++) {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + i);
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

  // Pre-calculate positions of appointments
  const placedAppointments = useMemo(() => {
    const activeStatuses = ['APPROVED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW'];
    const relevant = appointments.filter((app) => activeStatuses.includes(app.status) && app.doctorId && doctors.some(d => d.id === app.doctorId));

    return relevant.map((app) => {
      const docIndex = doctors.findIndex((d) => d.id === app.doctorId);

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
        col = dayIdx + 2;

        const activeDoctors = perDayDoctorIds[app.date] || [];
        const activeCount = activeDoctors.length;
        if (activeCount > 0) {
          const activeIdx = activeDoctors.indexOf(app.doctorId!);
          width = `${100 / activeCount}%`;
          left = `${(activeIdx * 100) / activeCount}%`;
        }
      } else {
        col = docIndex + 2;
      }

        return {
          appointment: app,
          col,
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
  }, [appointments, doctors, viewMode, daysOfWeek]);

  if (doctors.length === 0) {
    return (
      <div className="flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/10 space-y-2 flex">
        <Stethoscope className="size-12 text-muted-foreground/40" />
        <p className="text-sm font-medium">No active doctors selected.</p>
        <p className="text-xs text-muted-foreground">Select doctors from the sidebar to view their schedules.</p>
      </div>
    );
  }

  const columnsCount = viewMode === 'week' ? 5 : doctors.length;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-card overflow-hidden">
      {/* Scrollable Container wrapper */}
      <div className="flex-1 overflow-auto relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" data-lenis-prevent style={{ scrollbarWidth: 'thin' }}>
        <div
          className="grid relative"
          style={{
            gridTemplateColumns: viewMode === 'week'
              ? `35px ${dayFrUnits.map(f => `minmax(140px, ${f}fr)`).join(' ')} ${rightColWidth}`
              : `35px repeat(${doctors.length}, minmax(180px, 1fr)) ${rightColWidth}`,
            gridTemplateRows: `auto repeat(${totalSlots}, 10px)`,
          }}
        >
          {/* Header Row (Sticky Top) */}
          <div
            className="sticky top-0 left-0 bg-card border-r border-r-slate-300 border-b border-border px-0.5 py-2 text-center text-xs font-bold text-text-primary tracking-wide z-30 h-full"
            style={{ gridColumn: 1, gridRow: 1 }}
          >
            &nbsp;
          </div>

          {viewMode === 'week' ? (
            daysOfWeek.map((day, index) => {
              const count = appointments.filter((app) => app.date === day.dateStr && doctors.some(d => d.id === app.doctorId) && ['APPROVED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW'].includes(app.status)).length;
              return (
                <div
                  key={day.dateStr}
                  className="sticky top-0 bg-card border-r border-r-slate-300 border-b border-border px-4 py-2 text-center text-sm font-normal text-sidebar-foreground truncate z-20"
                  style={{ gridColumn: index + 2, gridRow: 1 }}
                >
                  {day.shortLabel} ({count})
                </div>
              );
            })
          ) : (
            doctors.map((doctor, index) => {
              const count = appointments.filter((app) => app.doctorId === doctor.id && ['APPROVED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW'].includes(app.status)).length;
              const color = getDoctorColor(doctor.id, index);
              return (
                <div
                  key={doctor.id}
                  className="sticky top-0 bg-card border-r border-r-slate-300 border-b border-border px-4 py-2 text-center text-xs font-bold text-text-primary z-20"
                  style={{ gridColumn: index + 2, gridRow: 1 }}
                >
                  <span className="inline-flex items-center justify-center gap-1.5 truncate">
                    <span className={`size-2 rounded-full shrink-0 ${color.accent}`} />
                    Dr. {doctor.firstName} {doctor.lastName} ({count})
                  </span>
                </div>
              );
            })
          )}

          <div
            className="sticky top-0 right-0 bg-card border-l border-l-slate-300 border-b border-border px-0.5 py-2 text-center text-xs font-bold text-text-primary tracking-wide z-30 max-md:hidden"
            style={{ gridColumn: columnsCount + 2, gridRow: 1 }}
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
                  {isTenMinMark && minutes >= 480 ? (
                    <span style={{ transform: 'translateY(-50%)', display: 'inline-block', lineHeight: 1 }}>
                      {isHourMark ? timeStr : minutes % 60}
                    </span>
                  ) : ''}
                </div>

                {/* Empty columns behind appointment cards */}
                {(viewMode === 'week' ? daysOfWeek : doctors).map((item, colIndex) => {
                  const doctorId = viewMode === 'day' ? (item as any).id : '';
                  const date = viewMode === 'week' ? (item as any).dateStr : selectedDate;
                  return (
                    <div
                      key={viewMode === 'week' ? (item as any).dateStr : (item as any).id}
                      className={`border-r border-r-slate-300 transition-colors ${
                        isLineRow ? 'border-b border-border' : 'border-b border-border/25'
                      } ${isHourMark ? 'bg-muted/10' : 'bg-transparent'} ${onSlotClick ? 'cursor-crosshair' : ''}`}
                      style={{ gridColumn: colIndex + 2, gridRow: rowIndex + 2 }}
                      onClick={(e) => {
                        if (!onSlotClick) return;
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
                   style={{ gridColumn: columnsCount + 2, gridRow: rowIndex + 2 }}
                >
                  {isTenMinMark && minutes >= 480 ? (
                    <span style={{ transform: 'translateY(-50%)', display: 'inline-block', lineHeight: 1 }}>
                      {isHourMark ? timeStr : minutes % 60}
                    </span>
                  ) : ''}
                </div>
              </React.Fragment>
            );
          })}

          {/* Card overlay per column — absolute positioned at exact minute */}
          {(viewMode === 'week' ? daysOfWeek : doctors).map((item, colIndex) => {
            const col = colIndex + 2;
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
                {colCards.map(({ appointment, topPercent, heightPercent, isSmallCard, left, width, activeDoctorCount, durationMins }) => {
                  const isSelected = selectedAppointmentId === appointment.id;
                  const patientName = formatPatientName(appointment);
                  const serviceName = appointment.service?.name || 'Treatment';
                  const timeRange = appointment.startTime && appointment.endTime
                    ? `${formatClinicTime(appointment.startTime)} - ${formatClinicTime(appointment.endTime)}`
                    : '';
                  const doctorName = viewMode === 'week'
                    ? ` | Dr. ${appointment.doctor?.lastName || ''}`
                    : '';

                  const color = getDoctorColor(appointment.doctorId || '');
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
        <div className="absolute inset-0 bg-card/60 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="text-xs text-text-muted animate-pulse">Updating timeline...</div>
        </div>
      )}
    </div>
  );
}
