'use client';

import React from 'react';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';
import { formatShortDate, formatClinicTime, calculateEndTimeFromIso } from '@/shared/utils/date.util';

interface AppointmentSummaryCardProps {
  appt: AppointmentDto;
}

export function AppointmentSummaryCard({ appt }: AppointmentSummaryCardProps) {
  const isFamily = !!appt.dependent;
  const patientName = isFamily
    ? `${appt.dependent?.firstName} ${appt.dependent?.lastName}`
    : appt.patient
    ? `${appt.patient.firstName} ${appt.patient.lastName}`
    : 'Unknown Patient';

  const bookedBy = appt.patient ? `${appt.patient.firstName} ${appt.patient.lastName}` : 'Unknown';
  
  // Try parsing date/time
  const dateStr = formatShortDate(appt.date);
  // Use standard clinic time utility
  const timeWindow = `${formatClinicTime(appt.startTime)} - ${formatClinicTime(appt.endTime)}`;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pending Staff Review';
      case 'APPROVED': return 'Approved / Scheduled';
      case 'REJECTED': return 'Rejected';
      case 'CANCELLED': return 'Cancelled';
      case 'RESCHEDULE_REQUESTED': return 'Reschedule Requested';
      case 'DISPLACED': return 'Displaced';
      case 'CHECKED_IN': return 'Checked-In';
      case 'TREATMENT_RENDERED': return 'Ready for Checkout';
      case 'COMPLETED': return 'Completed';
      case 'NO_SHOW': return 'No-Show';
      default: return status;
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-white/5 mb-4">
      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 pb-2 border-b border-slate-200 dark:border-white/10">
        Appointment Summary
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm">
        
        {/* Patient Details */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Patient Name</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{patientName}</span>
        </div>

        {isFamily && (
          <>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Relationship</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{appt.dependent?.relationship}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Booked By</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{bookedBy}</span>
            </div>
          </>
        )}

        {/* Clinical Details */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Treatment Service</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{appt.service?.name || 'N/A'}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Assigned Doctor</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {appt.doctor ? `Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}` : 'Unassigned'}
          </span>
        </div>

        {/* Schedule Details */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Appointment Date</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">{dateStr}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Requested Time Window</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">{timeWindow}</span>
        </div>

        {/* Status Details */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Current Status</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{getStatusLabel(appt.status)}</span>
        </div>

        <div className="flex flex-col md:col-span-2">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Reference ID</span>
          <span className="font-mono text-xs text-slate-500">{appt.id}</span>
        </div>
      </div>
    </div>
  );
}
