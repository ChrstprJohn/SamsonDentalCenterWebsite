/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBookingData } from './use-booking-data';
import { getAvailableDaysAction } from '../../actions/availability/get-available-days.action';
import { getAvailableTimeSlotsAction } from '../../actions/availability/get-available-time-slots.action';

vi.mock('../../actions/availability/get-available-days.action', () => ({
  getAvailableDaysAction: vi.fn(),
}));

vi.mock('../../actions/availability/get-available-time-slots.action', () => ({
  getAvailableTimeSlotsAction: vi.fn(),
}));

describe('useBookingData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch available dates when a serviceId is provided', async () => {
    (getAvailableDaysAction as any).mockResolvedValue({
      success: true,
      data: { availableDates: ['2025-01-01', '2025-01-02'] },
    });

    const { result } = renderHook(() => useBookingData('s1', null, undefined));

    expect(result.current.isLoadingAvailability).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingAvailability).toBe(false);
    });

    expect(result.current.availableDates).toEqual(['2025-01-01', '2025-01-02']);
    expect(getAvailableDaysAction).toHaveBeenCalled();
  });

  it('should fetch available slots when serviceId and date are provided', async () => {
    (getAvailableTimeSlotsAction as any).mockResolvedValue({
      success: true,
      data: {
        availableSlots: [
          { startTime: '2025-01-01T09:00:00Z', doctorId: 'd1', doctorName: 'Dr. Smith' },
        ],
      },
    });

    const { result } = renderHook(() => useBookingData('s1', '2025-01-01', undefined));

    await waitFor(() => {
      expect(result.current.availableSlots.length).toBe(1);
    });

    expect(result.current.availableSlots[0].doctorId).toBe('d1');
    expect(result.current.availableSlots[0].doctorName).toBe('Dr. Smith');
    expect(getAvailableTimeSlotsAction).toHaveBeenCalled();
  });
});
