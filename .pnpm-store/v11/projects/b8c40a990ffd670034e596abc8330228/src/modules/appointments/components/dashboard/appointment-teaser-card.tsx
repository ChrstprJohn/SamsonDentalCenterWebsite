import React from 'react';
import Link from 'next/link';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';
import { formatShortDate, formatClinicTime } from '@/shared/utils/date.util';

interface AppointmentTeaserCardProps {
  appt: AppointmentDto;
}

export function AppointmentTeaserCard({ appt }: AppointmentTeaserCardProps) {
  const isFamily = !!appt.dependent;
  const patientName = isFamily
    ? `${appt.dependent?.firstName} ${appt.dependent?.lastName}`
    : appt.patient
    ? `${appt.patient.firstName} ${appt.patient.lastName}`
    : 'Unknown Patient';

  const dateStr = formatShortDate(appt.date);
  const timeWindow = `${formatClinicTime(appt.startTime)} - ${formatClinicTime(appt.endTime)}`;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pending Review';
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'CANCELLED': return 'Cancelled';
      case 'RESCHEDULE_REQUESTED': return 'Reschedule Requested';
      case 'DISPLACED': return 'Displaced';
      case 'CHECKED_IN': return 'Checked-In';
      case 'TREATMENT_RENDERED': return 'Checkout';
      case 'COMPLETED': return 'Completed';
      case 'NO_SHOW': return 'No-Show';
      default: return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'CHECKED_IN':
      case 'COMPLETED':
        return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-650 dark:text-emerald-450';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-455';
      case 'RESCHEDULE_REQUESTED':
      case 'PENDING':
      case 'DISPLACED':
        return 'bg-amber-100 dark:bg-amber-500/10 text-amber-650 dark:text-amber-450';
      case 'TREATMENT_RENDERED':
        return 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-450';
      case 'NO_SHOW':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col gap-4">
      {/* Top Row */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{appt.service?.name || 'Treatment'}</span>
        </div>
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${getStatusStyle(appt.status)}`}>
          {getStatusLabel(appt.status)}
        </span>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Doctor</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {appt.doctor ? `Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}` : 'Unassigned'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Patient</span>
          <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            {patientName}
            {isFamily && (
              <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 rounded-full ml-1">
                {appt.dependent?.relationship
                  ? appt.dependent.relationship.charAt(0).toUpperCase() + appt.dependent.relationship.slice(1).toLowerCase()
                  : 'Family'}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex justify-between items-end border-t border-slate-100 dark:border-white/5 pt-4 mt-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Date & Time</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {dateStr} <span className="text-slate-300 dark:text-slate-600 mx-1">|</span> {timeWindow}
          </span>
        </div>
        
        <Link href={`/user/appointments/${appt.id}`}>
          <div className="inline-flex items-center justify-center rounded-lg text-xs font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700">
            View Details
          </div>
        </Link>
      </div>
    </div>
  );
}
