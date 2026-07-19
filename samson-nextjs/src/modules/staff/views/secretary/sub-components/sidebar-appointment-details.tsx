'use client';

import React from 'react';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import { formatClinicTime, formatShortDate } from '@/shared/utils/date.util';
import { User, Calendar, Clock, Stethoscope, ChevronLeft } from 'lucide-react';

interface SidebarAppointmentDetailsProps {
  appointment: AppointmentDto;
  onClose: () => void;
}

export function SidebarAppointmentDetails({
  appointment,
  onClose,
}: SidebarAppointmentDetailsProps) {
  const formatPatientName = (app: AppointmentDto): string => {
    if (app.dependent) {
      const holder = app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'Unknown';
      return `${app.dependent.firstName} ${app.dependent.lastName} (Dep. of ${holder})`;
    }
    if (app.source === 'STAFF_CREATED' && !app.patientId) {
      return `${app.patient?.firstName ?? 'Guest'} ${app.patient?.lastName ?? ''} (Guest)`;
    }
    return app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'Guest Patient';
  };

  const patientName = formatPatientName(appointment);
  const serviceName = appointment.service?.name || 'Unassigned Service';
  const doctorName = appointment.doctor
    ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
    : 'No Doctor Assigned';

  const timeRange = appointment.startTime && appointment.endTime
    ? `${formatClinicTime(appointment.startTime)} - ${formatClinicTime(appointment.endTime)}`
    : 'Time Pending';

  return (
    <div className="border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-5 animate-fadeIn">
      {/* Header with Back Button */}
      <div className="flex items-center gap-2 pb-3 border-b border-card-border">
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-secondary-bg/50 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          Appointment Details
        </span>
      </div>

      {/* Status Badge */}
      <div className="flex justify-between items-center bg-secondary-bg/10 px-4 py-3 rounded-2xl border border-card-border/60">
        <span className="text-[10px] font-bold text-text-muted uppercase">Status</span>
        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            appointment.status === 'APPROVED'
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
          }`}
        >
          {appointment.status}
        </span>
      </div>

      {/* Patient Name section */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-text-muted">
          <User className="size-3.5 text-text-muted" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Patient Name</span>
        </div>
        <div className="text-sm font-bold text-text-primary pl-5">
          {patientName}
        </div>
      </div>

      {/* Service section */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-text-muted">
          <Stethoscope className="size-3.5 text-text-muted" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Treatment / Service</span>
        </div>
        <div className="text-sm font-semibold text-text-primary pl-5">
          {serviceName}
        </div>
      </div>

      {/* Doctor section */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-text-muted">
          <User className="size-3.5 text-text-muted" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Assigned Doctor</span>
        </div>
        <div className="text-sm font-semibold text-text-primary pl-5">
          {doctorName}
        </div>
      </div>

      {/* Date and Time section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-text-muted">
            <Calendar className="size-3.5 text-text-muted" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Date</span>
          </div>
          <div className="text-xs font-semibold text-text-primary pl-5">
            {formatShortDate(appointment.date)}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-text-muted">
            <Clock className="size-3.5 text-text-muted" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Time Slot</span>
          </div>
          <div className="text-xs font-semibold text-text-primary pl-5 font-mono">
            {timeRange}
          </div>
        </div>
      </div>

      {/* Patient Note */}
      {appointment.userNote && (
        <div className="flex flex-col gap-1.5 pt-2 border-t border-card-border/60">
          <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
            Patient Note
          </span>
          <p className="text-xs text-text-secondary italic bg-secondary-bg/5 p-3 rounded-xl border border-card-border/40">
            "{appointment.userNote}"
          </p>
        </div>
      )}
    </div>
  );
}
