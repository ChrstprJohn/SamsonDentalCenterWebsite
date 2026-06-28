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
import { StatusHistoryTimeline } from './sub-components/status-history-timeline';

interface AppointmentDetailViewProps {
  appt: AppointmentDto;
  maxReschedules: number;
}

export function AppointmentDetailView({ appt, maxReschedules }: AppointmentDetailViewProps) {
  const detail = useAppointmentDetail({ appt, maxReschedules });
  const isApproved = detail.currentStatus === 'APPROVED';
  const isPending = detail.currentStatus === 'PENDING';
  const currentAppt = {
    ...appt,
    status: detail.currentStatus,
    statusReason: detail.currentStatusReason,
    statusHistory: detail.currentStatusHistory,
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
      <AppointmentDetailHeader
        isApproved={isApproved}
        isPending={isPending}
        isRescheduleDisabled={appt.rescheduleCount >= maxReschedules}
        onCancel={detail.handleCancelClick}
        onReschedule={detail.handleRescheduleClick}
      />

      <AppointmentStatusHero appt={currentAppt} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
          <AppointmentScheduleCard appt={currentAppt} />
          <AppointmentClinicalCard appt={currentAppt} />
          <StatusHistoryTimeline history={detail.currentStatusHistory} />
        </div>

        <div className="flex flex-col gap-6">
          <AppointmentPatientCard appt={currentAppt} />
          <AppointmentSystemCard appt={currentAppt} maxReschedules={maxReschedules} />
        </div>
      </div>

      <CancelAppointmentModal
        isOpen={detail.isCancelModalOpen}
        selectedAppt={currentAppt}
        cancelReason={detail.cancelReason}
        isCancelling={detail.isCancelling}
        warnExcessiveCancellations={false}
        onReasonChange={detail.setCancelReason}
        onClose={() => detail.setIsCancelModalOpen(false)}
        onSubmit={detail.handleCancelSubmit}
      />

      <RescheduleBlockedModal
        isOpen={detail.isRescheduleBlockedModalOpen}
        maxReschedules={maxReschedules}
        onClose={() => detail.setIsRescheduleBlockedModalOpen(false)}
      />
    </div>
  );
}

interface AppointmentDetailHeaderProps {
  isApproved: boolean;
  isPending: boolean;
  isRescheduleDisabled: boolean;
  onCancel: () => void;
  onReschedule: () => void;
}

function AppointmentDetailHeader({
  isApproved,
  isPending,
  isRescheduleDisabled,
  onCancel,
  onReschedule,
}: AppointmentDetailHeaderProps) {
  return (
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
        <div className="flex gap-3">
          {(isApproved || isPending) && (
            <Button variant="secondary" onClick={onCancel}>
              {isPending ? 'Cancel Request' : 'Cancel'}
            </Button>
          )}
          {isApproved && (
            <Button variant={isRescheduleDisabled ? 'secondary' : 'primary'} onClick={onReschedule}>
              {isRescheduleDisabled ? 'Reschedule Disabled' : 'Reschedule'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
