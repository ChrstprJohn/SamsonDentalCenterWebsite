'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';
import { cancelAppointmentAction } from '../../actions/status/cancel-appointment.action';

interface UseAppointmentDetailProps {
  appt: AppointmentDto;
  maxReschedules: number;
}

export function useAppointmentDetail({ appt, maxReschedules }: UseAppointmentDetailProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRescheduleBlockedModalOpen, setIsRescheduleBlockedModalOpen] = useState(false);

  const [currentStatus, setCurrentStatus] = useState<AppointmentDto['status']>(appt.status);
  const [currentStatusReason, setCurrentStatusReason] = useState<string | null>(appt.statusReason);
  const [currentStatusHistory, setCurrentStatusHistory] = useState<AppointmentDto['statusHistory']>(appt.statusHistory || []);

  const handleCancelClick = () => {
    setIsCancelModalOpen(true);
    setCancelReason('');
  };

  const handleRescheduleClick = () => {
    if (appt.rescheduleCount >= maxReschedules) {
      setIsRescheduleBlockedModalOpen(true);
      return;
    }
    addToast('Online rescheduling is temporarily under maintenance. Please contact clinic staff to move your slot.', 'info');
  };

  const handleCancelSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cancelReason.trim()) {
      addToast('Cancellation reason is required.', 'error');
      return;
    }
    setIsCancelling(true);
    
    try {
      const res = await cancelAppointmentAction({
        appointmentId: appt.id,
        status: 'CANCELLED',
        statusReason: cancelReason,
      });

      if (res.success) {
        addToast('Appointment cancelled successfully.', 'success');
        setIsCancelModalOpen(false);
        
        setCurrentStatus('CANCELLED');
        setCurrentStatusReason(cancelReason);

        const newHistoryItem = {
          id: `local-cancel-${Date.now()}`,
          previousStatus: currentStatus,
          newStatus: 'CANCELLED' as const,
          reason: cancelReason,
          createdAt: new Date().toISOString(),
          actorRole: 'PATIENT',
        };
        setCurrentStatusHistory((prev) => [...prev, newHistoryItem]);

        router.refresh();
      } else {
        addToast(res.error || 'Failed to cancel appointment.', 'error');
      }
    } catch (err) {
      addToast('An unexpected error occurred.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  return {
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
  };
}
