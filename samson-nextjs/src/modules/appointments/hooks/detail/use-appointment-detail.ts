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

  const handleCancelClick = () => {
    setIsCancelModalOpen(true);
    setCancelReason('');
  };

  const handleRescheduleClick = () => {
    if (appt.rescheduleCount >= maxReschedules) {
      setIsRescheduleBlockedModalOpen(true);
      return;
    }
    router.push(`/booking?reschedule=${appt.id}`);
  };

  const handleCancelSubmit = async () => {
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
        router.push('/user/appointments');
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
    handleCancelClick,
    handleRescheduleClick,
    handleCancelSubmit,
  };
}
