'use client';

import React, { useMemo } from 'react';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import { formatClinicTime } from '@/shared/utils/date.util';

interface DoctorTimelineProps {
  doctors: any[];
  appointments: AppointmentDto[];
  isLoading: boolean;
  selectedAppointmentId?: string;
  onSelectAppointment: (appointment: AppointmentDto) => void;
}

export function DoctorTimeline({
  doctors,
  appointments,
  isLoading,
  selectedAppointmentId,
  onSelectAppointment,
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

  // Pre-calculate positions of appointments
  const placedAppointments = useMemo(() => {
    return appointments
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

        return {
          appointment: app,
          col: docIndex + 2,
          topPercent,
          heightPercent,
          isSmallCard,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [appointments, doctors]);

  if (doctors.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border border-card-border bg-card/50 rounded-3xl">
        <p className="text-xs text-text-muted">No active doctors available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-card overflow-hidden">
      {/* Scrollable Container wrapper */}
      <div className="flex-1 overflow-auto relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" data-lenis-prevent style={{ scrollbarWidth: 'thin' }}>
        <div
          className="grid relative"
          style={{
            gridTemplateColumns: `35px repeat(${doctors.length}, minmax(180px, 1fr)) 35px`,
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
          {doctors.map((doctor, index) => {
            const count = appointments.filter((app) => app.doctorId === doctor.id).length;
            return (
              <div
                key={doctor.id}
                className="sticky top-0 bg-card border-r border-r-slate-300 border-b border-border px-4 py-2 text-center text-sm font-bold text-text-primary tracking-wide truncate z-20"
                style={{ gridColumn: index + 2, gridRow: 1 }}
              >
                Dr. {doctor.firstName} {doctor.lastName} ({count})
              </div>
            );
          })}
          <div
            className="sticky top-0 right-0 bg-card border-l border-l-slate-300 border-b border-border px-0.5 py-2 text-center text-xs font-bold text-text-primary tracking-wide z-30"
            style={{ gridColumn: doctors.length + 2, gridRow: 1 }}
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
                    isHourMark ? 'text-text-primary font-bold bg-muted/20 text-[11px]' : 'text-text-secondary font-normal text-[10px]'
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
                {doctors.map((doctor, docIndex) => {
                  return (
                    <div
                      key={doctor.id}
                      className={`border-r border-r-slate-300 transition-colors ${
                        isLineRow ? 'border-b border-border' : 'border-b border-border/25'
                      } ${isHourMark ? 'bg-muted/10' : 'bg-transparent'}`}
                      style={{ gridColumn: docIndex + 2, gridRow: rowIndex + 2 }}
                    />
                  );
                })}

                {/* Right Time Label column */}
                <div
                  className={`sticky right-0 bg-card border-l border-l-slate-300 z-10 transition-colors flex items-start justify-start px-0.5 text-left h-full ${
                    isHourMark ? 'text-text-primary font-bold bg-muted/20 text-[11px]' : 'text-text-secondary font-normal text-[10px]'
                  } ${isLineRow ? 'border-b border-border' : 'border-b border-border/25'}`}
                  style={{ gridColumn: doctors.length + 2, gridRow: rowIndex + 2 }}
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
          {doctors.map((doctor, docIndex) => {
            const col = docIndex + 2;
            const colCards = placedAppointments.filter(c => c.col === col);
            if (colCards.length === 0) return null;

            return (
              <div
                key={`card-layer-${doctor.id}`}
                className="z-10"
                style={{
                  gridColumn: col,
                  gridRow: `2 / span ${totalSlots}`,
                  position: 'relative',
                  pointerEvents: 'none',
                }}
              >
                {colCards.map(({ appointment, topPercent, heightPercent, isSmallCard }) => {
                  const isSelected = selectedAppointmentId === appointment.id;
                  const patientName = formatPatientName(appointment);
                  const serviceName = appointment.service?.name || 'Treatment';
                  const timeRange = appointment.startTime && appointment.endTime
                    ? `${formatClinicTime(appointment.startTime)} - ${formatClinicTime(appointment.endTime)}`
                    : '';

                  return (
                    <div
                      key={appointment.id}
                      onClick={() => onSelectAppointment(appointment)}
                      className={`absolute pl-0 pr-1.5 py-0 flex flex-row justify-start items-stretch text-left text-xs transition-all cursor-pointer shadow-sm border select-none overflow-hidden hover:shadow ${
                        isSelected
                          ? 'bg-slate-300 border-slate-700 text-slate-950 ring-2 ring-slate-700/20 font-semibold'
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-400 text-slate-950'
                      }`}
                      style={{
                        top: `calc(${topPercent}% + 1px)`,
                        height: `calc(${heightPercent}% - 2px)`,
                        left: '0px',
                        right: '0px',
                        pointerEvents: 'auto',
                      }}
                    >
                      {/* Left Accent Bar */}
                      <div 
                        className={`w-1 shrink-0 mr-1.5 ${
                          isSelected ? 'bg-slate-800' : 'bg-slate-500'
                        }`} 
                      />

                      {/* Content Column */}
                      <div className="flex-1 min-w-0 flex flex-col justify-start py-1 px-1 h-full min-h-0 gap-[2px]">
                        {/* Top Row: Name on Left, Time on Right */}
                        <div className="flex justify-between items-start gap-2 w-full">
                          <div className="font-semibold text-slate-950 truncate text-[12px] leading-none" title={patientName}>
                            {patientName}
                          </div>
                          <div className="text-[9.5px] text-slate-700 font-mono leading-none font-medium shrink-0 pt-[1px]">
                            {timeRange}
                          </div>
                        </div>

                        {/* Bottom Row: Service */}
                        <div className="text-slate-800 truncate text-[11px] leading-none font-medium" title={serviceName}>
                          {serviceName}
                        </div>
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
