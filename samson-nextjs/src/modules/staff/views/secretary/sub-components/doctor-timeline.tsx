'use client';

import React, { useMemo } from 'react';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import { formatClinicTime } from '@/shared/utils/date.util';

const COLORS_LIST = [
  { bg: 'bg-blue-50/80', border: 'border-blue-200/80', hover: 'hover:bg-blue-100/90', accent: 'bg-blue-500', text: 'text-blue-950', subtext: 'text-blue-700/90' },
  { bg: 'bg-emerald-50/80', border: 'border-emerald-200/80', hover: 'hover:bg-emerald-100/90', accent: 'bg-emerald-500', text: 'text-emerald-950', subtext: 'text-emerald-700/90' },
  { bg: 'bg-violet-50/80', border: 'border-violet-200/80', hover: 'hover:bg-violet-100/90', accent: 'bg-violet-500', text: 'text-violet-950', subtext: 'text-violet-700/90' },
  { bg: 'bg-amber-50/80', border: 'border-amber-200/80', hover: 'hover:bg-amber-100/90', accent: 'bg-amber-500', text: 'text-amber-950', subtext: 'text-amber-700/90' },
  { bg: 'bg-rose-50/80', border: 'border-rose-200/80', hover: 'hover:bg-rose-100/90', accent: 'bg-rose-500', text: 'text-rose-950', subtext: 'text-rose-700/90' },
];

const getDoctorColor = (doctorId: string) => {
  if (!doctorId) return COLORS_LIST[0];
  let hash = 0;
  for (let i = 0; i < doctorId.length; i++) {
    hash = doctorId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS_LIST.length;
  return COLORS_LIST[index];
};

interface DoctorTimelineProps {
  doctors: any[];
  appointments: AppointmentDto[];
  isLoading: boolean;
  selectedAppointmentId?: string;
  onSelectAppointment: (appointment: AppointmentDto) => void;
  viewMode: 'day' | 'week';
  selectedDate: string;
}

export function DoctorTimeline({
  doctors,
  appointments,
  isLoading,
  selectedAppointmentId,
  onSelectAppointment,
  viewMode = 'day',
  selectedDate,
}: DoctorTimelineProps) {
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
    if (appointment.dependent) {
      const holder = appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Unknown';
      return `${appointment.dependent.firstName} ${appointment.dependent.lastName} (Dep. of ${holder})`;
    }
    if (appointment.source === 'STAFF_CREATED' && !appointment.patientId) {
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

  // Pre-calculate positions of appointments
  const placedAppointments = useMemo(() => {
    return appointments
      .filter((app) => ['APPROVED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW'].includes(app.status))
      .map((app) => {
        if (!app.doctorId) return null;
        const docIndex = doctors.findIndex((d) => d.id === app.doctorId);
        if (docIndex === -1) return null;

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

          if (doctors.length > 0) {
            width = `${100 / doctors.length}%`;
            left = `${(docIndex * 100) / doctors.length}%`;
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
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [appointments, doctors, viewMode, daysOfWeek]);

  if (viewMode === 'day' && doctors.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border border-card-border bg-card/50 rounded-3xl">
        <p className="text-xs text-text-muted">No active doctors selected.</p>
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
            gridTemplateColumns: `35px repeat(${columnsCount}, minmax(${viewMode === 'week' ? '140px' : '180px'}, 1fr)) 35px`,
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
              const count = appointments.filter((app) => app.date === day.dateStr && doctors.some(d => d.id === app.doctorId)).length;
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
              const count = appointments.filter((app) => app.doctorId === doctor.id).length;
              return (
                <div
                  key={doctor.id}
                  className="sticky top-0 bg-card border-r border-r-slate-300 border-b border-border px-4 py-2 text-center text-xs font-bold text-text-primary truncate z-20"
                  style={{ gridColumn: index + 2, gridRow: 1 }}
                >
                  Dr. {doctor.firstName} {doctor.lastName} ({count})
                </div>
              );
            })
          )}

          <div
            className="sticky top-0 right-0 bg-card border-l border-l-slate-300 border-b border-border px-0.5 py-2 text-center text-xs font-bold text-text-primary tracking-wide z-30"
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
                  className={`sticky left-0 bg-card border-r border-r-slate-300 z-10 transition-colors flex items-start justify-end px-0.5 text-right h-full ${
                    isHourMark ? 'text-foreground bg-muted/20 text-[11px]' : 'text-text-secondary font-normal text-[10px]'
                   } ${isLineRow ? 'border-b border-border' : 'border-b border-border/25'}`}
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
                  return (
                    <div
                      key={viewMode === 'week' ? (item as any).dateStr : (item as any).id}
                      className={`border-r border-r-slate-300 transition-colors ${
                        isLineRow ? 'border-b border-border' : 'border-b border-border/25'
                      } ${isHourMark ? 'bg-muted/10' : 'bg-transparent'}`}
                      style={{ gridColumn: colIndex + 2, gridRow: rowIndex + 2 }}
                    />
                  );
                })}

                {/* Right Time Label column */}
                <div
                  className={`sticky right-0 bg-card border-l border-l-slate-300 z-10 transition-colors flex items-start justify-start px-0.5 text-left h-full ${
                    isHourMark ? 'text-foreground bg-muted/20 text-[11px]' : 'text-text-secondary font-normal text-[10px]'
                   } ${isLineRow ? 'border-b border-border' : 'border-b border-border/25'}`}
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
                className="z-10"
                style={{
                  gridColumn: col,
                  gridRow: `2 / span ${totalSlots}`,
                  position: 'relative',
                  pointerEvents: 'none',
                }}
              >
                {colCards.map(({ appointment, topPercent, heightPercent, isSmallCard, left, width }) => {
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
                      <div className={`flex-1 min-w-0 flex flex-col justify-start h-full min-h-0 ${isSmallCard ? 'py-0.5 px-0.5 gap-px' : 'py-1 px-1 gap-[3px]'}`}>
                        {/* Row 1: Name (left) + Time/Status (right) */}
                        <div className="flex justify-between items-start gap-1 w-full">
                          <div className={`truncate ${isSmallCard ? 'text-[11px]' : 'text-sm'} leading-none ${isSelected ? 'font-medium' : 'font-normal'} ${color.text}`} title={patientName}>
                            {patientName}
                          </div>
                          {!isSmallCard && appointment.status && viewMode === 'day' ? (
                            <span className="shrink-0 text-[9px] leading-none font-semibold uppercase tracking-wider opacity-75">
                              {appointment.status}
                            </span>
                          ) : isSmallCard && timeRange && !(viewMode === 'week' && doctors.length > 1) ? (
                            <span className={`text-[9px] leading-none shrink-0 font-normal ${color.subtext}`}>
                              {timeRange.toLowerCase().replace(/ /g, '')}
                            </span>
                          ) : null}
                        </div>

                        {/* Row 2: Service */}
                        <div className={`truncate ${isSmallCard ? 'text-[10px]' : 'text-[11px]'} leading-none font-normal ${color.subtext}`} title={serviceName}>
                          {serviceName}
                        </div>

                        {/* Row 3: Time for large cards; Status for small cards */}
                        {!isSmallCard && timeRange && !(viewMode === 'week' && doctors.length > 1) && (
                          <div className={`truncate text-[10px] leading-none font-normal opacity-80 ${color.subtext}`}>
                            {timeRange.toLowerCase().replace(/ /g, '')}
                          </div>
                        )}
                        {isSmallCard && appointment.status && viewMode === 'day' && (
                          <div className="flex justify-end w-full">
                            <span className="text-[8px] leading-none font-semibold uppercase tracking-wider opacity-70">
                              {appointment.status}
                            </span>
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
