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
  // 10-minute intervals from 08:00 AM (480 mins) to 05:00 PM (1020 mins)
  const startTimeMins = 480;
  const endTimeMins = 1020;
  const slotDuration = 10;
  const totalSlots = (endTimeMins - startTimeMins) / slotDuration; // 54 slots

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

        // Clamp values to clinic hours
        const clampedStart = Math.max(startTimeMins, Math.min(endTimeMins, startMin));
        const clampedEnd = Math.max(startTimeMins, Math.min(endTimeMins, endMin));

        if (clampedEnd <= clampedStart) return null;

        const startRow = Math.floor((clampedStart - startTimeMins) / slotDuration) + 2; // row 1 is header
        const endRow = (clampedEnd - startTimeMins) / slotDuration + 3;

        return {
          appointment: app,
          col: docIndex + 2, // col 1 is time labels
          startRow,
          endRow,
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
            gridTemplateColumns: `80px repeat(${doctors.length}, minmax(180px, 1fr))`,
            gridTemplateRows: `auto repeat(${totalSlots}, 20px)`,
          }}
        >
          {/* Header Row (Sticky Top) */}
          <div
            className="sticky top-0 left-0 bg-card border-b border-card-border px-2 py-3.5 text-center text-xs font-bold text-text-primary tracking-wide z-30"
            style={{ gridColumn: 1, gridRow: 1 }}
          >
            Time
          </div>
          {doctors.map((doctor, index) => (
            <div
              key={doctor.id}
              className="sticky top-0 bg-card border-l border-b border-card-border px-4 py-3.5 text-center text-xs font-bold text-text-primary tracking-wide truncate z-20"
              style={{ gridColumn: index + 2, gridRow: 1 }}
            >
              Dr. {doctor.firstName} {doctor.lastName}
            </div>
          ))}

          {/* Time lines & Background Grid cells */}
          {Array.from({ length: totalSlots }).map((_, rowIndex) => {
            const minutes = startTimeMins + rowIndex * 10;
            const timeStr = formatMinutesToTime(minutes);
            const isHourMark = minutes % 60 === 0;

            return (
              <React.Fragment key={rowIndex}>
                {/* Time Label column */}
                <div
                  className={`sticky left-0 bg-card border-r border-b border-card-border px-1 text-right text-[10px] font-semibold z-10 transition-colors flex items-center justify-end ${
                    isHourMark ? 'text-text-primary font-bold bg-muted/20' : 'text-text-muted'
                  }`}
                  style={{ gridColumn: 1, gridRow: rowIndex + 2 }}
                >
                  {isHourMark ? timeStr : minutes % 60}
                </div>

                {/* Empty columns behind appointment cards */}
                {doctors.map((doctor, docIndex) => (
                  <div
                    key={doctor.id}
                    className={`border-r border-b border-card-border/40 transition-colors ${
                      isHourMark ? 'bg-muted/5' : 'bg-transparent'
                    }`}
                    style={{ gridColumn: docIndex + 2, gridRow: rowIndex + 2 }}
                  />
                ))}
              </React.Fragment>
            );
          })}

          {/* Booked Appointment Cards on Top */}
          {placedAppointments.map(({ appointment, col, startRow, endRow }) => {
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
                className={`mx-0.5 px-1.5 py-0.5 flex flex-col justify-start items-start text-left text-xs transition-all cursor-pointer shadow-sm border select-none overflow-hidden hover:shadow z-10 ${
                  isSelected
                    ? 'bg-brand/10 border-brand text-brand-dark ring-2 ring-brand/20 font-medium'
                    : 'bg-indigo-50/70 hover:bg-indigo-50 border-indigo-100 text-indigo-950'
                }`}
                style={{
                  gridColumn: col,
                  gridRowStart: startRow,
                  gridRowEnd: endRow,
                }}
              >
                <div className="font-bold truncate text-[11px] leading-tight" title={patientName}>
                  {patientName}
                </div>
                <div className="text-[10px] opacity-80 truncate leading-tight" title={serviceName}>
                  {serviceName}
                </div>
                <div className="text-[9px] opacity-75 font-mono leading-none">
                  {timeRange}
                </div>
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
