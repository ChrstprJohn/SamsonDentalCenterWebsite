/**
 * @vitest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserBooking } from './use-user-booking';
import { submitBookingAction } from '../../actions/booking/submit-booking.action';
import { requestRescheduleAction } from '../../actions/status/request-reschedule.action';
import { useToast } from '@/components/feedback/toast-container';

// Mock NextJS navigation search params
const mockGet = vi.fn();
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Mock Toast container hook
const mockAddToast = vi.fn();
vi.mock('@/components/feedback/toast-container', () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

// Mock Server Actions
vi.mock('../../actions/booking/submit-booking.action', () => ({
  submitBookingAction: vi.fn(),
}));

vi.mock('../../actions/status/request-reschedule.action', () => ({
  requestRescheduleAction: vi.fn(),
}));

// Mock useBookingData since it does async operations we don't want to test here
vi.mock('./use-booking-data', () => ({
  useBookingData: () => ({
    availableDates: ['2026-06-25'],
    availableSlots: [
      {
        time: '10:00 AM',
        originalStartTime: '2026-06-25T10:00:00.000Z',
        doctorId: 'doc-1',
        doctorName: 'Dr. Samson',
      },
    ],
    availabilityMap: {},
    doctors: [{ id: 'doc-1', firstName: 'Christopher', lastName: 'Samson' }],
    isLoadingAvailability: false,
    isLoadingDoctors: false,
    setAvailableDates: vi.fn(),
    setAvailableSlots: vi.fn(),
  }),
}));

describe('useUserBooking Hook Specs', () => {
  const mockServices = [
    {
      id: 's-1',
      name: 'Cleaning',
      description: 'Teeth cleaning',
      durationMinutes: 30,
      price: 100,
      serviceType: 'GENERAL' as const,
      isActive: true,
      createdAt: '2026-06-21',
      updatedAt: '2026-06-21',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    mockGet.mockReturnValue(null);
  });

  it('should initialize at step 1 and allow selecting a service', () => {
    const { result } = renderHook(() => useUserBooking(mockServices));

    expect(result.current.currentStep).toBe(1);
    expect(result.current.selectedService).toBeNull();

    act(() => {
      result.current.selectService(mockServices[0]);
    });

    expect(result.current.selectedService).toEqual(mockServices[0]);
  });

  it('should prevent moving to step 2 without selecting a service', () => {
    const { result } = renderHook(() => useUserBooking(mockServices));

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(1);
  });

  it('should handle step transitions when requirements are met', () => {
    const { result } = renderHook(() => useUserBooking(mockServices));

    act(() => {
      result.current.selectService(mockServices[0]);
    });

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(2);

    // Try going to step 3 without selecting date/time slot - should fail/remain at 2
    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStep).toBe(2);

    // Select date and slot
    act(() => {
      result.current.selectDate('2026-06-25');
      result.current.selectSlot({
        time: '10:00 AM',
        originalStartTime: '2026-06-25T10:00:00.000Z',
        doctorId: 'doc-1',
        doctorName: 'Dr. Samson',
      });
    });

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStep).toBe(3);
  });

  it('should validate abuse via userNote check', () => {
    const { result } = renderHook(() => useUserBooking(mockServices));

    act(() => {
      result.current.setUserNote('Some normal note');
    });
    expect(result.current.validateAbuse()).toEqual({ valid: true });

    act(() => {
      result.current.setUserNote('This is spam spam spam text');
    });
    expect(result.current.validateAbuse().valid).toBe(false);
  });

  it('should handle successful booking submission', async () => {
    (submitBookingAction as any).mockResolvedValue({
      success: true,
      data: { appointmentId: 'appt-123' },
    });

    const { result } = renderHook(() => useUserBooking(mockServices));

    // Setup required fields
    act(() => {
      result.current.selectService(mockServices[0]);
      result.current.selectDate('2026-06-25');
      result.current.selectSlot({
        time: '10:00 AM',
        originalStartTime: '2026-06-25T10:00:00.000Z',
        doctorId: 'doc-1',
        doctorName: 'Dr. Samson',
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(submitBookingAction).toHaveBeenCalled();
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.createdAppointmentId).toBe('appt-123');
    expect(mockAddToast).toHaveBeenCalledWith('Appointment scheduled successfully!', 'success');
  });

  it('should handle failed booking submission with toast notification', async () => {
    (submitBookingAction as any).mockResolvedValue({
      success: false,
      error: 'Conflict: Slot already taken',
    });

    const { result } = renderHook(() => useUserBooking(mockServices));

    // Setup required fields
    act(() => {
      result.current.selectService(mockServices[0]);
      result.current.selectDate('2026-06-25');
      result.current.selectSlot({
        time: '10:00 AM',
        originalStartTime: '2026-06-25T10:00:00.000Z',
        doctorId: 'doc-1',
        doctorName: 'Dr. Samson',
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(submitBookingAction).toHaveBeenCalled();
    expect(result.current.isSuccess).toBe(false);
    expect(mockAddToast).toHaveBeenCalledWith('Conflict: Slot already taken', 'error');
  });
});
