/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserDashboard } from './use-user-dashboard';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

// Mock dependencies
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/components/feedback/toast-container', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

describe('useUserDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAppt = {
    id: '1',
    patientId: 'p1',
    serviceId: 's1',
    doctorId: 'd1',
    date: '2025-01-01',
    startTime: '2025-01-01T10:00:00Z',
    endTime: '2025-01-01T11:00:00Z',
    status: 'APPROVED',
    rescheduleCount: 0,
  } as AppointmentDto;

  it('should initialize correctly and categorize appointments', () => {
    const pendingAppt = { ...mockAppt, id: '2', status: 'PENDING' } as AppointmentDto;
    const historyAppt = { ...mockAppt, id: '3', status: 'COMPLETED' } as AppointmentDto;

    const { result } = renderHook(() =>
      useUserDashboard([mockAppt, pendingAppt, historyAppt], 2)
    );

    expect(result.current.scheduled).toHaveLength(1);
    expect(result.current.scheduled[0].id).toBe('1');
    expect(result.current.pending).toHaveLength(1);
    expect(result.current.history).toHaveLength(1);
  });

  it('should allow rescheduling if under max limit', () => {
    const { result } = renderHook(() => useUserDashboard([mockAppt], 2));

    act(() => {
      result.current.handleRescheduleClick(mockAppt);
    });

    expect(mockPush).toHaveBeenCalledWith(`/booking?service=${mockAppt.serviceId}&reschedule=true`);
    expect(result.current.blockedRescheduleAppt).toBeNull();
  });

  it('should block rescheduling if over or at max limit', () => {
    const blockedAppt = { ...mockAppt, rescheduleCount: 2 };
    const { result } = renderHook(() => useUserDashboard([blockedAppt], 2));

    act(() => {
      result.current.handleRescheduleClick(blockedAppt);
    });

    expect(result.current.blockedRescheduleAppt).toEqual(blockedAppt);
    expect(mockPush).not.toHaveBeenCalled(); // from this test scope
  });

  it('should handle cancel modal state', () => {
    const { result } = renderHook(() => useUserDashboard([mockAppt], 2));

    act(() => {
      result.current.handleCancelClick(mockAppt);
    });

    expect(result.current.isCancelModalOpen).toBe(true);
    expect(result.current.selectedAppt).toEqual(mockAppt);

    act(() => {
      result.current.closeCancelModal();
    });

    expect(result.current.isCancelModalOpen).toBe(false);
    expect(result.current.selectedAppt).toBeNull();
  });
});
