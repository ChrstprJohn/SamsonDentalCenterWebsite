/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBookingData } from './use-booking-data';
import { getAvailableDaysAction } from '../../actions/availability/get-available-days.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { getAvailableTimeSlotsAction } from '../../actions/availability/get-available-time-slots.action';

vi.mock('../../actions/availability/get-available-days.action', () => ({
  getAvailableDaysAction: vi.fn(),
}));

vi.mock('@/modules/staff/actions/management/get-doctors.action', () => ({
  getDoctorsAction: vi.fn(),
}));

vi.mock('../../actions/availability/get-available-time-slots.action', () => ({
  getAvailableTimeSlotsAction: vi.fn(),
}));

describe('useBookingData', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch available dates and doctors when a serviceId is provided', async () => {
    (getDoctorsAction as any).mockResolvedValue({
      success: true,
      data: [{ id: 'doc-1', firstName: 'Jane', lastName: 'Doe' }],
    });
    (getAvailableDaysAction as any).mockResolvedValue({
      success: true,
      data: { availableDates: ['2025-01-01', '2025-01-02'], availabilityMap: {} },
    });

    const { result } = renderHook(() => useBookingData('s1', null, undefined));

    expect(result.current.isLoadingAvailability).toBe(true);
    expect(result.current.isLoadingDoctors).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingDoctors).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.availableDates).toEqual(['2025-01-01', '2025-01-02']);
    });

    expect(result.current.doctors).toEqual([{ id: 'doc-1', firstName: 'Jane', lastName: 'Doe' }]);
    expect(getDoctorsAction).toHaveBeenCalled();
    expect(getAvailableDaysAction).toHaveBeenCalled();
  });

  it.skip('should use cached monthly slots before falling back to the server action (SKIPPED: client-side cache disabled)', async () => {
    (getDoctorsAction as any).mockResolvedValue({
      success: true,
      data: [{ id: 'doc-1', firstName: 'Jane', lastName: 'Doe' }],
    });
    (getAvailableDaysAction as any).mockResolvedValue({
      success: true,
      data: {
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
    (getDoctorsAction as any).mockResolvedValue({
      success: true,
      data: [],
    });
    (getAvailableDaysAction as any).mockResolvedValue({
      success: true,
      data: { availableDates: [], availabilityMap: {} },
    });
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

  it('should not re-fetch doctors when selectedDoctorId changes', async () => {
    (getDoctorsAction as any).mockResolvedValue({
      success: true,
      data: [{ id: 'doc-1', firstName: 'Jane', lastName: 'Doe' }],
    });
    (getAvailableDaysAction as any).mockResolvedValue({
      success: true,
      data: { availableDates: ['2025-01-01'], availabilityMap: {} },
    });

    const { result, rerender } = renderHook(
      ({ doctorId }) => useBookingData('s1', null, doctorId),
      { initialProps: { doctorId: undefined as string | undefined } }
    );

    await waitFor(() => {
      expect(result.current.doctors.length).toBe(1);
    });
    expect(getDoctorsAction).toHaveBeenCalledTimes(1);

    // Change selectedDoctorId to trigger availability reload but NOT doctor list reload
    rerender({ doctorId: 'doc-1' });

    // Wait to allow potential re-fetches to settle or fire
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(getDoctorsAction).toHaveBeenCalledTimes(1);
  });
});
