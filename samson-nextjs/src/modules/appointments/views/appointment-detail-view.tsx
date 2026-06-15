'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { CancelAppointmentModal } from '../components/dashboard/cancel-appointment-modal';
import { RescheduleBlockedModal } from '../components/dashboard/reschedule-blocked-modal';
import type { AppointmentDto } from '../dtos/shared/appointment.dto';
import { useAppointmentDetail } from '../hooks/detail/use-appointment-detail';
import { AppointmentStatusHero } from '../components/sub-components/appointment-status-hero';
import { AppointmentScheduleCard } from '../components/sub-components/appointment-schedule-card';
import { AppointmentClinicalCard } from '../components/sub-components/appointment-clinical-card';
import { AppointmentPatientCard } from '../components/sub-components/appointment-patient-card';
import { AppointmentSystemCard } from '../components/sub-components/appointment-system-card';

interface AppointmentDetailViewProps {
  appt: AppointmentDto;
  maxReschedules: number;
}

export function AppointmentDetailView({ appt, maxReschedules }: AppointmentDetailViewProps) {
  const {
    isCancelModalOpen,
    setIsCancelModalOpen,
    cancelReason,
    setCancelReason,
    isCancelling,
    isRescheduleBlockedModalOpen,
    setIsRescheduleBlockedModalOpen,
    currentStatus,
    currentStatusReason,
    currentStatusHistory,
    handleCancelClick,
    handleRescheduleClick,
    handleCancelSubmit,
  } = useAppointmentDetail({ appt, maxReschedules });

  // Determine if primary actions should be shown based on client-side status
  const isApproved = currentStatus === 'APPROVED';
  const isPending = currentStatus === 'PENDING';

  // Construct client state wrapper to avoid layout stale data lagging
  const currentAppt = {
    ...appt,
    status: currentStatus,
    statusReason: currentStatusReason,
    statusHistory: currentStatusHistory,
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
      {/* Header & Back Button */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors w-fit"
        >
          <span className="text-lg leading-none">&larr;</span>
          Back to Appointments
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Appointment Profile</h2>
          
          {/* Actions at the top right */}
          <div className="flex gap-3">
            {(isApproved || isPending) && (
              <Button variant="secondary" onClick={handleCancelClick}>
                {isPending ? 'Cancel Request' : 'Cancel'}
              </Button>
            )}
            {isApproved && (
              <Button 
                variant={appt.rescheduleCount >= maxReschedules ? "secondary" : "primary"}
                onClick={handleRescheduleClick}
              >
                {appt.rescheduleCount >= maxReschedules ? 'Reschedule Disabled' : 'Reschedule'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 1. Status Hero Banner */}
      <AppointmentStatusHero appt={currentAppt} />

      {/* 2. Organized Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left/Middle Columns: Schedule, Clinical Details & Status history audit timeline */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <AppointmentScheduleCard appt={currentAppt} />
          <AppointmentClinicalCard appt={currentAppt} />
          <StatusHistoryTimeline history={currentStatusHistory} />
        </div>

        {/* Right Column: Patient Information & Meta */}
        <div className="flex flex-col gap-6">
          <AppointmentPatientCard appt={currentAppt} />
          <AppointmentSystemCard appt={currentAppt} maxReschedules={maxReschedules} />
        </div>
      </div>

      {/* Modals */}
      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        selectedAppt={currentAppt}
        cancelReason={cancelReason}
        isCancelling={isCancelling}
        warnExcessiveCancellations={false}
        onReasonChange={setCancelReason}
        onClose={() => setIsCancelModalOpen(false)}
        onSubmit={handleCancelSubmit}
      />

      <RescheduleBlockedModal
        isOpen={isRescheduleBlockedModalOpen}
        maxReschedules={maxReschedules}
        onClose={() => setIsRescheduleBlockedModalOpen(false)}
      />
    </div>
  );
}

function StatusHistoryTimeline({ history }: { history: AppointmentDto['statusHistory'] }) {
  if (!history || history.length === 0) return null;

  const sorted = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-450';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-455';
      case 'RESCHEDULE_REQUESTED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
        <span className="text-xl">📜</span>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Status Audit Trail</h3>
      </div>
      <div className="relative pl-6 border-l border-slate-150 dark:border-white/5 flex flex-col gap-6 text-xs text-slate-650 dark:text-slate-350">
        {sorted.map((item, idx) => {
          const formattedDate = new Date(item.createdAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          });
          return (
            <div key={item.id || idx} className="relative flex flex-col gap-1.5 text-left">
              <span className="absolute -left-[30px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-white dark:border-slate-950 bg-blue-500 text-[8px] text-white font-black">
                {idx + 1}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeColor(item.newStatus)}`}>
                  {item.newStatus === 'RESCHEDULE_REQUESTED' ? 'Reschedule Requested' : item.newStatus}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{formattedDate}</span>
              </div>
              {item.reason && (
                <p className="text-slate-700 dark:text-slate-300 mt-1 font-medium bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-150 dark:border-white/5 italic">
                  &ldquo;{item.reason}&rdquo;
                </p>
              )}
              <span className="text-[10px] text-slate-450">
                Action by: <span className="font-semibold">{item.actorRole === 'PATIENT' ? 'Patient (You)' : item.actorRole.charAt(0).toUpperCase() + item.actorRole.slice(1).toLowerCase()}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
