'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface UseUserDashboardReturn {
  scheduled: AppointmentDto[];
  pending: AppointmentDto[];
  history: AppointmentDto[];
  
  selectedAppt: AppointmentDto | null;
  isCancelModalOpen: boolean;
  cancelReason: string;
  isCancelling: boolean;
  blockedRescheduleAppt: AppointmentDto | null;
  
  handleRescheduleClick: (appt: AppointmentDto) => void;
  handleCancelClick: (appt: AppointmentDto) => void;
  handleCancelSubmit: (e: React.FormEvent) => Promise<void>;
  closeCancelModal: () => void;
  
  setCancelReason: (reason: string) => void;
  setBlockedRescheduleAppt: (appt: AppointmentDto | null) => void;
}

export function useUserDashboard(
  initialAppointments: AppointmentDto[],
  maxReschedules: number
): UseUserDashboardReturn {
  const [appointments, setAppointments] = useState<AppointmentDto[]>(initialAppointments);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentDto | null>(null);
  
  // Cancellation Modal states
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Reschedule alert state
  const [blockedRescheduleAppt, setBlockedRescheduleAppt] = useState<AppointmentDto | null>(null);

  const { addToast } = useToast();
  const router = useRouter();

  const handleRescheduleClick = (appt: AppointmentDto) => {
    const currentReschedules = appt.rescheduleCount ?? 0;
    if (currentReschedules >= maxReschedules) {
      setBlockedRescheduleAppt(appt);
      return;
    }

    addToast('Redirecting to scheduler page...', 'info');
    router.push(`/booking?service=${appt.serviceId}&reschedule=true`);
  };

  const handleCancelClick = (appt: AppointmentDto) => {
    setSelectedAppt(appt);
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedAppt(null);
    setCancelReason('');
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt || !cancelReason) return;

    setIsCancelling(true);
    // Simulate API cancellation trigger (Wait for proper patient cancel action later)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsCancelling(false);

    const updated = appointments.map((a) => {
      if (a.id === selectedAppt.id) {
        return {
          ...a,
          status: 'CANCELLED' as const,
          statusReason: cancelReason, // using standard field
        };
      }
      return a;
    });
    setAppointments(updated);

    addToast('Appointment cancelled successfully.', 'success');
    closeCancelModal();
  };

  const scheduled = appointments.filter(
    (a) => a.status === 'APPROVED' || a.status === 'RESCHEDULE_REQUESTED' || a.status === 'CHECKED_IN'
  );
  const pending = appointments.filter((a) => a.status === 'PENDING');
  const history = appointments.filter(
    (a) =>
      a.status === 'COMPLETED' ||
      a.status === 'CANCELLED' ||
      a.status === 'REJECTED' ||
      a.status === 'DISPLACED' ||
      a.status === 'NO_SHOW' ||
      a.status === 'TREATMENT_RENDERED'
  );

  return {
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
  };
}
