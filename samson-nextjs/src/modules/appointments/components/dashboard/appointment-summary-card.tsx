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
      case 'APPROVED': return 'Approved';
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
        {appt.status === 'CHECKED_IN' && (
          <div className="md:col-span-2 mt-2 mb-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-900 flex items-center gap-4">
             <span className="text-3xl">🏥</span>
             <div>
               <h6 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">You are Checked-In!</h6>
               <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5 font-medium">Please wait in the reception area. Your doctor will see you shortly.</p>
             </div>
          </div>
        )}

        {appt.proposedDate && appt.proposedStartTime && appt.proposedEndTime ? (
          <div className={`md:col-span-2 mt-2 p-4 rounded-lg border ${
            appt.status === 'RESCHEDULE_REQUESTED' ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900' :
            appt.statusReason?.includes('approved') ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900' :
            'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
          }`}>
            <h6 className={`text-xs font-bold mb-3 ${
              appt.status === 'RESCHEDULE_REQUESTED' ? 'text-amber-600 dark:text-amber-400' :
              appt.statusReason?.includes('approved') ? 'text-emerald-600 dark:text-emerald-400' :
              'text-rose-600 dark:text-rose-400'
            }`}>
              {appt.status === 'RESCHEDULE_REQUESTED' ? 'Reschedule Request Pending Review' :
               appt.statusReason?.includes('approved') ? 'Reschedule Request Approved' :
               'Reschedule Request Rejected'}
            </h6>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* LEFT SLOT (Original Date) */}
              <div className={`flex flex-col gap-2 p-3 rounded-md border ${
                appt.status === 'RESCHEDULE_REQUESTED' ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 opacity-75' :
                appt.statusReason?.includes('approved') ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5 opacity-50' :
                'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-500/20 shadow-sm ring-1 ring-emerald-500/20'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    appt.statusReason?.includes('rejected') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                  }`}>
                    {appt.statusReason?.includes('approved') ? 'Previous Slot (Replaced)' : 'Secured Current Slot'}
                  </span>
                  {appt.statusReason?.includes('rejected') && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 rounded-full font-bold">ACTIVE</span>
                  )}
                </div>
                <div className={`flex flex-col ${appt.statusReason?.includes('approved') ? 'line-through decoration-slate-400/50' : ''}`}>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide">Date</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {appt.statusReason?.includes('approved') ? formatShortDate(appt.proposedDate) : dateStr}
                  </span>
                </div>
                <div className={`flex flex-col ${appt.statusReason?.includes('approved') ? 'line-through decoration-slate-400/50' : ''}`}>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide">Time</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {appt.statusReason?.includes('approved') ? `${formatClinicTime(appt.proposedStartTime)} - ${formatClinicTime(appt.proposedEndTime)}` : timeWindow}
                  </span>
                </div>
              </div>

              {/* RIGHT SLOT (Proposed Date) */}
              <div className={`flex flex-col gap-2 p-3 rounded-md border ${
                appt.status === 'RESCHEDULE_REQUESTED' ? 'bg-amber-100/50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' :
                appt.statusReason?.includes('approved') ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-500/20 shadow-sm ring-1 ring-emerald-500/20' :
                'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5 opacity-50'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    appt.status === 'RESCHEDULE_REQUESTED' ? 'text-amber-600 dark:text-amber-400' :
                    appt.statusReason?.includes('approved') ? 'text-emerald-600 dark:text-emerald-400' :
                    'text-slate-500'
                  }`}>
                    {appt.statusReason?.includes('approved') ? 'New Secured Slot' :
                     appt.statusReason?.includes('rejected') ? 'Requested Slot (Rejected)' :
                     'Requested New Slot'}
                  </span>
                  {appt.statusReason?.includes('approved') && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 rounded-full font-bold">ACTIVE</span>
                  )}
                </div>
                <div className={`flex flex-col ${appt.statusReason?.includes('rejected') ? 'line-through decoration-slate-400/50' : ''}`}>
                  <span className={`text-[10px] uppercase tracking-wide ${
                    appt.status === 'RESCHEDULE_REQUESTED' ? 'text-amber-700/60 dark:text-amber-300/60' : 'text-slate-400'
                  }`}>Date</span>
                  <span className={`font-medium ${
                    appt.status === 'RESCHEDULE_REQUESTED' ? 'text-amber-900 dark:text-amber-100' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {appt.statusReason?.includes('approved') ? dateStr : formatShortDate(appt.proposedDate)}
                  </span>
                </div>
                <div className={`flex flex-col ${appt.statusReason?.includes('rejected') ? 'line-through decoration-slate-400/50' : ''}`}>
                  <span className={`text-[10px] uppercase tracking-wide ${
                    appt.status === 'RESCHEDULE_REQUESTED' ? 'text-amber-700/60 dark:text-amber-300/60' : 'text-slate-400'
                  }`}>Time</span>
                  <span className={`font-medium ${
                    appt.status === 'RESCHEDULE_REQUESTED' ? 'text-amber-900 dark:text-amber-100' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {appt.statusReason?.includes('approved') ? timeWindow : `${formatClinicTime(appt.proposedStartTime)} - ${formatClinicTime(appt.proposedEndTime)}`}
                  </span>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Appointment Date</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{dateStr}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Requested Time Window</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{timeWindow}</span>
            </div>
          </>
        )}

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

      {/* Unified Status Reason Banners */}
      <div className="mt-4">
        {appt.status === 'APPROVED' && appt.statusReason && (
          <div className="bg-emerald-500/5 p-4 rounded-2xl text-xs border border-emerald-500/10 text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-bold block text-emerald-600 dark:text-emerald-450 mb-1">✅ Approval Remarks:</span>
            {appt.statusReason}
          </div>
        )}

        {appt.status === 'RESCHEDULE_REQUESTED' && appt.statusReason && (
          <div className="bg-amber-500/5 p-4 rounded-2xl text-xs border border-amber-500/10 text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-bold block text-amber-600 dark:text-amber-450 mb-1">🗓️ Request Note:</span>
            {appt.statusReason}
          </div>
        )}

        {appt.status === 'COMPLETED' && appt.statusReason && (
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-xs border border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-bold block text-slate-700 dark:text-slate-300 mb-1">👩‍⚕️ Treatment Remarks:</span>
            {appt.statusReason}
          </div>
        )}

        {appt.status === 'CANCELLED' && appt.statusReason && (
          <div className="bg-rose-500/5 p-4 rounded-2xl text-xs border border-rose-500/10 text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-bold block text-rose-500 dark:text-rose-450 mb-1">❌ Cancellation Reason:</span>
            {appt.statusReason}
          </div>
        )}

        {appt.status === 'REJECTED' && appt.statusReason && (
          <div className="bg-red-500/5 p-4 rounded-2xl text-xs border border-red-500/10 text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-bold block text-red-500 dark:text-red-450 mb-1">🚫 Rejection Reason:</span>
            {appt.statusReason}
          </div>
        )}

        {appt.status === 'DISPLACED' && appt.statusReason && (
          <div className="bg-amber-500/5 p-4 rounded-2xl text-xs border border-amber-500/10 text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-bold block text-amber-500 dark:text-amber-450 mb-1">⚠️ Displacement Cause:</span>
            {appt.statusReason}
          </div>
        )}

        {appt.status === 'NO_SHOW' && (
          <div className="bg-slate-100/50 dark:bg-slate-950 p-4 rounded-2xl text-xs border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 leading-relaxed flex gap-2">
            <span className="text-amber-500">⚠️</span>
            <p>
              <strong>No-Show Warning</strong>: You missed this appointment. Failures to attend without prior cancellation are recorded as negative credibility, which may restrict your reservation permissions.
            </p>
          </div>
        )}

        {appt.status === 'TREATMENT_RENDERED' && (
          <div className="bg-blue-500/5 p-4 rounded-2xl text-xs border border-blue-500/10 text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-bold block text-blue-600 dark:text-blue-400 mb-1">💳 Billing & Checkout:</span>
            Your treatment has been submitted by the doctor. Please proceed to the clinic front desk for final checkout and invoice settlement.
          </div>
        )}
      </div>
    </div>
  );
}
