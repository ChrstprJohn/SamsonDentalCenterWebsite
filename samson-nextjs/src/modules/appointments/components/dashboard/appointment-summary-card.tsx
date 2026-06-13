'use client';

import React from 'react';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';
import { formatShortDate, formatClinicTime } from '@/shared/utils/date.util';
import { RescheduleDetails } from './sub-components/reschedule-details';
import { StatusReasonBanners } from './sub-components/status-reason-banners';

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

  const dateStr = formatShortDate(appt.date);
  const timeWindow = `${formatClinicTime(appt.startTime)} - ${formatClinicTime(appt.endTime)}`;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending Staff Review';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'CANCELLED':
        return 'Cancelled';
      case 'RESCHEDULE_REQUESTED':
        return 'Reschedule Requested';
      case 'DISPLACED':
        return 'Displaced';
      case 'CHECKED_IN':
        return 'Checked-In';
      case 'TREATMENT_RENDERED':
        return 'Ready for Checkout';
      case 'COMPLETED':
        return 'Completed';
      case 'NO_SHOW':
        return 'No-Show';
      default:
        return status;
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-white/5 mb-4 text-left">
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
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {appt.dependent?.relationship
                  ? appt.dependent.relationship.charAt(0).toUpperCase() + appt.dependent.relationship.slice(1).toLowerCase()
                  : 'N/A'}
              </span>
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
        {appt.status === 'CHECKED_IN' && (
          <div className="md:col-span-2 mt-2 mb-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-900 flex items-center gap-4">
            <span className="text-3xl">🏥</span>
            <div>
              <h6 className="text-sm font-bold text-emerald-600 dark:text-emerald-450 tracking-wide">
                You are Checked-In!
              </h6>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5 font-medium">
                Please wait in the reception area. Your doctor will see you shortly.
              </p>
            </div>
          </div>
        )}

        <RescheduleDetails appt={appt} dateStr={dateStr} timeWindow={timeWindow} />

        {/* Status Details */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Current Status</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{getStatusLabel(appt.status)}</span>
        </div>

        <div className="flex flex-col md:col-span-2">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Reference ID</span>
          <span className="font-mono text-xs text-slate-505 dark:text-slate-400">{appt.id}</span>
        </div>
      </div>

      {/* Unified Status Reason Banners */}
      <StatusReasonBanners appt={appt} />
    </div>
  );
}
