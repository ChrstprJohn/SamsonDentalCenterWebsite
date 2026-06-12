/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBookingData } from './use-booking-data';
import { getStepTwoDataAction } from '../../actions/availability/get-step-two-data.action';
import { getAvailableTimeSlotsAction } from '../../actions/availability/get-available-time-slots.action';

vi.mock('../../actions/availability/get-step-two-data.action', () => ({
  getStepTwoDataAction: vi.fn(),
}));

vi.mock('../../actions/availability/get-available-time-slots.action', () => ({
  getAvailableTimeSlotsAction: vi.fn(),
}));

describe('useBookingData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch available dates and doctors when a serviceId is provided', async () => {
    (getStepTwoDataAction as any).mockResolvedValue({
      success: true,
      data: {
        doctors: [{ id: 'doc-1', firstName: 'Jane', lastName: 'Doe' }],
        availability: { availableDates: ['2025-01-01', '2025-01-02'], availabilityMap: {} },
      },
    });

    const { result } = renderHook(() => useBookingData('s1', null, undefined));

    expect(result.current.isLoadingAvailability).toBe(true);
    expect(result.current.isLoadingDoctors).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingAvailability).toBe(false);
    });

    expect(result.current.availableDates).toEqual(['2025-01-01', '2025-01-02']);
    expect(result.current.doctors).toEqual([{ id: 'doc-1', firstName: 'Jane', lastName: 'Doe' }]);
    expect(getStepTwoDataAction).toHaveBeenCalled();
  });

  it('should use cached monthly slots before falling back to the server action', async () => {
    (getStepTwoDataAction as any).mockResolvedValue({
      success: true,
      data: {
        doctors: [{ id: 'doc-1', firstName: 'Jane', lastName: 'Doe' }],
        availability: {
          availableDates: ['2025-01-01'],
          availabilityMap: {
            '2025-01-01': [
              {
                startTime: '2025-01-01T09:00:00.000Z',
                endTime: '2025-01-01T09:30:00.000Z',
                doctorId: 'doc-1',
                doctorName: 'Dr. Jane Doe',
              },
            ],
          },
        },
      },
    });

    const { result, rerender } = renderHook(
      ({ selectedDate }: { selectedDate: string | null }) =>
        useBookingData('s1', selectedDate, undefined),
      { initialProps: { selectedDate: null as string | null } }
    );

    await waitFor(() => {
      expect(result.current.availableDates).toEqual(['2025-01-01']);
    });

    rerender({ selectedDate: '2025-01-01' });

    await waitFor(() => {
      expect(result.current.availableSlots).toEqual([
        {
          time: '09:00 AM',
          doctorId: 'doc-1',
          doctorName: 'Dr. Jane Doe',
        },
      ]);
    });

    expect(getAvailableTimeSlotsAction).not.toHaveBeenCalled();
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
