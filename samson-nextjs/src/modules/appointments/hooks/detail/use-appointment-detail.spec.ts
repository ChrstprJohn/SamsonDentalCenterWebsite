/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppointmentDetail } from './use-appointment-detail';
import { cancelAppointmentAction } from '../../actions/status/cancel-appointment.action';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

const mockAddToast = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: mockRefresh }) }));
vi.mock('@/components/feedback/toast-container', () => ({ useToast: () => ({ addToast: mockAddToast }) }));
vi.mock('../../actions/status/cancel-appointment.action', () => ({ cancelAppointmentAction: vi.fn() }));

const appt = {
  id: 'appt-1',
  patientId: null,
  dependentId: null,
  serviceId: 'service-1',
  doctorId: 'doctor-1',
  date: '2026-07-01',
  startTime: '09:00',
  endTime: '10:00',
  status: 'APPROVED',
  source: 'SELF_BOOKED',
  doctorAssignmentSource: 'SYSTEM',
  userNote: null,
  statusReason: null,
  proposedDate: null,
  proposedStartTime: null,
  proposedEndTime: null,
  proposedDoctorId: null,
  statusHistory: [],
  rescheduleCount: 0,
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
  doctor: null,
  service: null,
  patient: null,
  dependent: null,
} as AppointmentDto;

describe('useAppointmentDetail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('opens cancel modal and blocks empty cancellation reasons', async () => {
    const { result } = renderHook(() => useAppointmentDetail({ appt, maxReschedules: 2 }));

    act(() => result.current.handleCancelClick());
    await act(async () => result.current.handleCancelSubmit());

    expect(result.current.isCancelModalOpen).toBe(true);
    expect(cancelAppointmentAction).not.toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith('Cancellation reason is required.', 'error');
  });

  it('submits cancellation and updates local status history', async () => {
    vi.mocked(cancelAppointmentAction).mockResolvedValueOnce({ success: true } as any);
    const { result } = renderHook(() => useAppointmentDetail({ appt, maxReschedules: 2 }));

    act(() => result.current.setCancelReason('Conflict'));
    await act(async () => result.current.handleCancelSubmit());

    expect(cancelAppointmentAction).toHaveBeenCalledWith({ appointmentId: 'appt-1', status: 'CANCELLED', statusReason: 'Conflict' });
    expect(result.current.currentStatus).toBe('CANCELLED');
    expect(result.current.currentStatusHistory).toHaveLength(1);
    expect(mockRefresh).toHaveBeenCalled();
  });
});
