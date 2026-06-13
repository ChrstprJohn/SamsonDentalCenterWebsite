'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface UseUserDashboardReturn {
  scheduled: AppointmentDto[];
  pending: AppointmentDto[];
  history: AppointmentDto[];
  
  filterRole: 'ALL' | 'SELF' | 'FAMILY';
  setFilterRole: (role: 'ALL' | 'SELF' | 'FAMILY') => void;
  
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

const MOCK_APPOINTMENTS: AppointmentDto[] = [
  {
    id: 'a-1',
    patientId: 'p-1',
    serviceId: 's-1',
    doctorId: 'd-1',
    date: '2026-06-24',
    startTime: '2026-06-24T10:00:00Z',
    endTime: '2026-06-24T10:45:00Z',
    status: 'APPROVED',
    userNote: 'Orthodontic checkup',
    statusReason: 'Confirmed slot availability.',
    rescheduleCount: 0,
    doctor: { id: 'd-1', firstName: 'Christopher', lastName: 'Samson', prefix: 'Dr.', suffix: 'DDS' },
    service: { id: 's-1', name: 'Orthodontic Consultation', durationMinutes: 45 }
  },
  {
    id: 'a-2',
    patientId: 'p-1',
    serviceId: 's-2',
    doctorId: 'd-1',
    date: '2026-06-28',
    startTime: '2026-06-28T14:00:00Z',
    endTime: '2026-06-28T14:30:00Z',
    status: 'RESCHEDULE_REQUESTED',
    userNote: 'Routine cleaning',
    statusReason: 'Patient requested reschedule: change of work hours.',
    rescheduleCount: 1,
    doctor: { id: 'd-1', firstName: 'Christopher', lastName: 'Samson', prefix: 'Dr.', suffix: 'DDS' },
    service: { id: 's-2', name: 'Teeth Cleaning', durationMinutes: 30 }
  },
  {
    id: 'a-3',
    patientId: 'p-1',
    serviceId: 's-3',
    doctorId: 'd-2',
    date: '2026-06-20',
    startTime: '2026-06-20T11:00:00Z',
    endTime: '2026-06-20T12:00:00Z',
    status: 'CHECKED_IN',
    userNote: 'Severe tooth pain',
    statusReason: 'Patient checked-in at reception.',
    rescheduleCount: 0,
    doctor: { id: 'd-2', firstName: 'Jane', lastName: 'Doe', prefix: 'Dr.', suffix: 'DMD' },
    service: { id: 's-3', name: 'Root Canal Therapy', durationMinutes: 60 }
  },
  {
    id: 'a-4',
    patientId: 'p-1',
    serviceId: 's-4',
    doctorId: 'd-1',
    date: '2026-06-30',
    startTime: '2026-06-30T09:00:00Z',
    endTime: '2026-06-30T10:00:00Z',
    status: 'PENDING',
    userNote: 'New whitening treatment request',
    statusReason: null,
    rescheduleCount: 0,
    doctor: { id: 'd-1', firstName: 'Christopher', lastName: 'Samson', prefix: 'Dr.', suffix: 'DDS' },
    service: { id: 's-4', name: 'Laser Teeth Whitening', durationMinutes: 60 }
  },
  {
    id: 'a-5',
    patientId: 'p-1',
    serviceId: 's-2',
    doctorId: 'd-2',
    date: '2026-06-05',
    startTime: '2026-06-05T15:00:00Z',
    endTime: '2026-06-05T15:30:00Z',
    status: 'COMPLETED',
    userNote: 'General scaling',
    statusReason: 'Checkout complete, invoice paid.',
    rescheduleCount: 0,
    doctor: { id: 'd-2', firstName: 'Jane', lastName: 'Doe', prefix: 'Dr.', suffix: 'DMD' },
    service: { id: 's-2', name: 'Teeth Cleaning', durationMinutes: 30 }
  },
  {
    id: 'a-6',
    patientId: 'p-1',
    serviceId: 's-1',
    doctorId: 'd-1',
    date: '2026-06-01',
    startTime: '2026-06-01T10:00:00Z',
    endTime: '2026-06-01T10:45:00Z',
    status: 'CANCELLED',
    userNote: 'Initial alignment check',
    statusReason: 'Cancelled by user: Family emergency.',
    rescheduleCount: 0,
    doctor: { id: 'd-1', firstName: 'Christopher', lastName: 'Samson', prefix: 'Dr.', suffix: 'DDS' },
    service: { id: 's-1', name: 'Orthodontic Consultation', durationMinutes: 45 }
  },
  {
    id: 'a-7',
    patientId: 'p-1',
    serviceId: 's-3',
    doctorId: 'd-2',
    date: '2026-05-25',
    startTime: '2026-05-25T13:00:00Z',
    endTime: '2026-05-25T14:00:00Z',
    status: 'REJECTED',
    userNote: 'Emergency checkup',
    statusReason: 'Rejected by staff: Roster conflict / doctor unavailable.',
    rescheduleCount: 0,
    doctor: { id: 'd-2', firstName: 'Jane', lastName: 'Doe', prefix: 'Dr.', suffix: 'DMD' },
    service: { id: 's-3', name: 'Root Canal Therapy', durationMinutes: 60 }
  },
  {
    id: 'a-8',
    patientId: 'p-1',
    serviceId: 's-4',
    doctorId: 'd-1',
    date: '2026-05-20',
    startTime: '2026-05-20T09:00:00Z',
    endTime: '2026-05-20T10:00:00Z',
    status: 'DISPLACED',
    userNote: 'Teeth whitening',
    statusReason: 'Displaced: Clinic closed on holiday schedule.',
    rescheduleCount: 0,
    doctor: { id: 'd-1', firstName: 'Christopher', lastName: 'Samson', prefix: 'Dr.', suffix: 'DDS' },
    service: { id: 's-4', name: 'Laser Teeth Whitening', durationMinutes: 60 }
  },
  {
    id: 'a-9',
    patientId: 'p-1',
    serviceId: 's-2',
    doctorId: 'd-2',
    date: '2026-05-15',
    startTime: '2026-05-15T10:00:00Z',
    endTime: '2026-05-15T10:30:00Z',
    status: 'NO_SHOW',
    userNote: 'Routine scaling',
    statusReason: 'No-show recorded: Patient failed to attend.',
    rescheduleCount: 0,
    doctor: { id: 'd-2', firstName: 'Jane', lastName: 'Doe', prefix: 'Dr.', suffix: 'DMD' },
    service: { id: 's-2', name: 'Teeth Cleaning', durationMinutes: 30 }
  },
  {
    id: 'a-10',
    patientId: 'p-1',
    serviceId: 's-1',
    doctorId: 'd-1',
    date: '2026-06-12',
    startTime: '2026-06-12T16:00:00Z',
    endTime: '2026-06-12T16:45:00Z',
    status: 'TREATMENT_RENDERED',
    userNote: 'Braces adjust',
    statusReason: 'Treatment submitted by doctor; draft invoice created.',
    rescheduleCount: 0,
    doctor: { id: 'd-1', firstName: 'Christopher', lastName: 'Samson', prefix: 'Dr.', suffix: 'DDS' },
    service: { id: 's-1', name: 'Orthodontic Consultation', durationMinutes: 45 }
  }
].map((a) => ({
  ...a,
  createdAt: undefined,
  updatedAt: undefined,
  patient: { id: 'p-1', firstName: 'Christopher', lastName: 'Picardo' },
  dependent: a.id === 'a-2' || a.id === 'a-7' ? {
    id: 'dep-1',
    firstName: 'test2 test2',
    lastName: 'test2 test2',
    relationship: 'Sibling',
  } : null,
} as unknown as AppointmentDto));

export function useUserDashboard(
  initialAppointments: AppointmentDto[],
  maxReschedules: number
): UseUserDashboardReturn {
  // Use mock data fallback if no initial database records are loaded yet
  const resolvedInitial = initialAppointments.length > 0 ? initialAppointments : MOCK_APPOINTMENTS;
  const [appointments, setAppointments] = useState<AppointmentDto[]>(resolvedInitial);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentDto | null>(null);
  
  const [filterRole, setFilterRole] = useState<'ALL' | 'SELF' | 'FAMILY'>('ALL');
  
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
    if (filterRole === 'ALL') return true;
    if (filterRole === 'SELF') return !a.dependent;
    if (filterRole === 'FAMILY') return !!a.dependent;
    return true;
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
    
    filterRole,
    setFilterRole,

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
