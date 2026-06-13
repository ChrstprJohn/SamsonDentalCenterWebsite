'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

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
    
    // Simulate API call and redirect
    setTimeout(() => {
      setIsCancelling(false);
      setIsCancelModalOpen(false);
      addToast('Appointment cancelled successfully.', 'success');
      router.push('/user/appointments');
    }, 1000);
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
