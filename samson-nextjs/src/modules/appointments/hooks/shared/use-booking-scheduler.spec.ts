/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useBookingScheduler } from './use-booking-scheduler';
import { getAvailableDaysAction } from '../../actions/availability/get-available-days.action';
import { getAvailableDoctorsForDateAction } from '../../actions/availability/get-available-doctors-for-date.action';
import { getAvailableTimeSlotsAction } from '../../actions/availability/get-available-time-slots.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';

vi.mock('../../actions/availability/get-available-days.action', () => ({ getAvailableDaysAction: vi.fn() }));
vi.mock('../../actions/availability/get-available-doctors-for-date.action', () => ({ getAvailableDoctorsForDateAction: vi.fn() }));
vi.mock('../../actions/availability/get-available-time-slots.action', () => ({ getAvailableTimeSlotsAction: vi.fn() }));
vi.mock('@/modules/staff/actions/management/get-doctors.action', () => ({ getDoctorsAction: vi.fn() }));

describe('useBookingScheduler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects invalid service input before action calls', async () => {
    const { result } = renderHook(() => useBookingScheduler());

    await act(async () => {
      await result.current.loadDoctorsForService('');
    });

    expect(getDoctorsAction).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Service is required');
  });

  it('loads dates with normalized ANY doctor preference', async () => {
    vi.mocked(getAvailableDaysAction).mockResolvedValueOnce({
      success: true,
      data: { availableDates: ['2026-07-01'], availabilityMap: { '2026-07-01': [] } },
    } as any);
    const { result } = renderHook(() => useBookingScheduler());

    await act(async () => {
      await result.current.loadAvailableDates({ serviceId: 'srv-1', month: '2026-07', doctorId: 'ANY' });
    });

    expect(getAvailableDaysAction).toHaveBeenCalledWith({ serviceId: 'srv-1', month: '2026-07', doctorId: undefined });
    expect(result.current.availableDates).toEqual(['2026-07-01']);
  });

  it('loads doctors and slots for a selected date', async () => {
    vi.mocked(getAvailableDoctorsForDateAction).mockResolvedValueOnce({
      success: true,
      data: [{ doctorId: 'doc-1' }],
    } as any);
    vi.mocked(getAvailableTimeSlotsAction).mockResolvedValueOnce({
      success: true,
      data: { availableSlots: [{ doctorId: 'doc-1', startTime: '2026-07-01T09:00:00.000Z' }] },
    } as any);
    const { result } = renderHook(() => useBookingScheduler());

    await act(async () => {
      await result.current.loadDoctorsForDate({ serviceId: 'srv-1', date: '2026-07-01' });
      await result.current.loadAvailableSlots({ serviceId: 'srv-1', date: '2026-07-01', doctorId: 'doc-1' });
    });

    expect(result.current.availableDoctors).toEqual([{ doctorId: 'doc-1' }]);
    expect(result.current.availableSlots).toEqual([{ doctorId: 'doc-1', startTime: '2026-07-01T09:00:00.000Z' }]);
  });
});
