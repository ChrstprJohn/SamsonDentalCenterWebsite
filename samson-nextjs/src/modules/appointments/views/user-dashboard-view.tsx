'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUserDashboard } from '../hooks/dashboard/use-user-dashboard';
import { UpcomingAppointments } from '../components/dashboard/upcoming-appointments';
import { PendingApprovals } from '../components/dashboard/pending-approvals';
import { AppointmentHistory } from '../components/dashboard/appointment-history';
import { CancelAppointmentModal } from '../components/dashboard/cancel-appointment-modal';
import { RescheduleBlockedModal } from '../components/dashboard/reschedule-blocked-modal';
import type { AppointmentDto } from '../dtos/shared/appointment.dto';

interface UserDashboardViewProps {
  initialAppointments: AppointmentDto[];
  maxReschedules: number;
}

export function UserDashboardView({ initialAppointments, maxReschedules }: UserDashboardViewProps) {
  const router = useRouter();
  
  const {
    scheduled,
    pending,
    history,
    selectedAppt,
    isCancelModalOpen,
    cancelReason,
    isCancelling,
    blockedRescheduleAppt,
    handleRescheduleClick,
    handleCancelClick,
    handleCancelSubmit,
    closeCancelModal,
    setCancelReason,
    setBlockedRescheduleAppt,
  } = useUserDashboard(initialAppointments, maxReschedules);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary">Patient Dashboard</h2>
          <p className="text-xs text-text-muted">Oversee, track, reschedule, or cancel your clinic reservations in real-time.</p>
        </div>
        <Button onClick={() => router.push('/booking')}>
          + New Booking
        </Button>
      </div>

      <UpcomingAppointments 
        scheduled={scheduled} 
        maxReschedules={maxReschedules}
        onCancelClick={handleCancelClick}
        onRescheduleClick={handleRescheduleClick}
      />

      <PendingApprovals 
        pending={pending}
        onCancelClick={handleCancelClick}
      />

      <AppointmentHistory history={history} />

      <RescheduleBlockedModal
        isOpen={blockedRescheduleAppt !== null}
        maxReschedules={maxReschedules}
        onClose={() => setBlockedRescheduleAppt(null)}
      />

      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        selectedAppt={selectedAppt}
        cancelReason={cancelReason}
        isCancelling={isCancelling}
        onReasonChange={setCancelReason}
        onClose={closeCancelModal}
        onSubmit={handleCancelSubmit}
      />
    </div>
  );
}
