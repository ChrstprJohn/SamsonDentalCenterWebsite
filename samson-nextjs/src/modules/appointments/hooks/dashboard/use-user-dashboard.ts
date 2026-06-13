'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface FilterOption {
  id: string;
  label: string;
}

interface UseUserDashboardReturn {
  scheduled: AppointmentDto[];
  pending: AppointmentDto[];
  history: AppointmentDto[];
  
  filterValue: string;
  setFilterValue: (val: string) => void;
  filterOptions: FilterOption[];
  
  selectedAppt: AppointmentDto | null;
  isCancelModalOpen: boolean;
  cancelReason: string;
  isCancelling: boolean;
  blockedRescheduleAppt: AppointmentDto | null;
  
  // Reliability Metrics
  cancelCount: number;
  noShowCount: number;
  rescheduleCount: number;
  warnExcessiveCancellations: boolean;

  handleRescheduleClick: (appt: AppointmentDto) => void;
  handleCancelClick: (appt: AppointmentDto) => void;
  handleCancelSubmit: (e: React.FormEvent) => Promise<void>;
  closeCancelModal: () => void;
  
  setCancelReason: (reason: string) => void;
  setBlockedRescheduleAppt: (appt: AppointmentDto | null) => void;
}

import { MOCK_APPOINTMENTS } from '../../dtos/shared/mock-appointments';

export function useUserDashboard(
  initialAppointments: AppointmentDto[],
  maxReschedules: number
): UseUserDashboardReturn {
  // Use mock data fallback if no initial database records are loaded yet
  const resolvedInitial = initialAppointments.length > 0 ? initialAppointments : MOCK_APPOINTMENTS;
  const [appointments, setAppointments] = useState<AppointmentDto[]>(resolvedInitial);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentDto | null>(null);
  const [filterValue, setFilterValue] = useState<string>('ALL');

  // Derive filter options dynamically from appointments
  const patientObj = resolvedInitial.find((a) => a.patient)?.patient;
  const mainUserName = patientObj ? `${patientObj.firstName} ${patientObj.lastName}` : 'Christopher Picardo';

  const filterOptions: FilterOption[] = [
    { id: 'ALL', label: 'All' },
    { id: 'SELF', label: mainUserName },
  ];

  // Map to collect unique dependents
  const dependentMap = new Map<string, string>();
  resolvedInitial.forEach((appt) => {
    if (appt.dependent) {
      const fullName = `${appt.dependent.firstName} ${appt.dependent.lastName}`;
      dependentMap.set(appt.dependent.id, fullName);
    }
  });

  dependentMap.forEach((name, depId) => {
    filterOptions.push({ id: depId, label: name });
  });
  
  // Reliability Metrics State (mocked for demo purposes)
  const [cancelCount] = useState(3);
  const [noShowCount] = useState(1);
  const [rescheduleCount] = useState(1);
  const warnExcessiveCancellations = cancelCount >= 3;

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
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsCancelling(false);

    const updated = appointments.map((a) => {
      if (a.id === selectedAppt.id) {
        return {
          ...a,
          status: 'CANCELLED' as const,
          statusReason: cancelReason,
        };
      }
      return a;
    });
    setAppointments(updated);

    addToast('Appointment cancelled successfully.', 'success');
    closeCancelModal();
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filterValue === 'ALL') return true;
    if (filterValue === 'SELF') return !a.dependent;
    return a.dependent?.id === filterValue;
  });

  const scheduled = filteredAppointments.filter(
    (a) => a.status === 'APPROVED' || a.status === 'RESCHEDULE_REQUESTED' || a.status === 'CHECKED_IN'
  );
  const pending = filteredAppointments.filter((a) => a.status === 'PENDING');
  const history = filteredAppointments.filter(
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
    
    filterValue,
    setFilterValue,
    filterOptions,

    selectedAppt,
    isCancelModalOpen,
    cancelReason,
    isCancelling,
    blockedRescheduleAppt,

    cancelCount,
    noShowCount,
    rescheduleCount,
    warnExcessiveCancellations,
    
    handleRescheduleClick,
    handleCancelClick,
    handleCancelSubmit,
    closeCancelModal,
    
    setCancelReason,
    setBlockedRescheduleAppt,
  };
}
