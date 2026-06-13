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
    handleCancelClick,
    handleRescheduleClick,
    handleCancelSubmit,
  } = useAppointmentDetail({ appt, maxReschedules });

  // Determine if primary actions should be shown
  const isApproved = appt.status === 'APPROVED';
  const isPending = appt.status === 'PENDING';

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
      <AppointmentStatusHero appt={appt} />

      {/* 2. Organized Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left/Middle Columns: Schedule & Clinical Details */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <AppointmentScheduleCard appt={appt} />
          <AppointmentClinicalCard appt={appt} />
        </div>

        {/* Right Column: Patient Information & Meta */}
        <div className="flex flex-col gap-6">
          <AppointmentPatientCard appt={appt} />
          <AppointmentSystemCard appt={appt} maxReschedules={maxReschedules} />
        </div>
      </div>

      {/* Modals */}
      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        selectedAppt={appt}
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
