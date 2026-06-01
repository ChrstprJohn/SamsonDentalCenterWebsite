/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useBookingState } from './use-booking-state';

describe('useBookingState', () => {
  it('should initialize with step 1 and default values', () => {
    const { result } = renderHook(() => useBookingState());
    expect(result.current.currentStep).toBe(1);
    expect(result.current.selectedService).toBeNull();
    expect(result.current.isSlotHoldActive).toBe(false);
  });

  it('should reset wizard state when requested', () => {
    const { result } = renderHook(() => useBookingState());

    act(() => {
      result.current.setCurrentStep(3);
      result.current.setPatientType('NEW_DEPENDENT');
      result.current.setUserNote('test note');
      result.current.resetState();
    });

    expect(result.current.currentStep).toBe(1);
    expect(result.current.patientType).toBe('SELF');
    expect(result.current.userNote).toBe('');
  });

  it('should handle slot hold logic', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBookingState());

    act(() => {
      result.current.startSlotHold();
    });

    expect(result.current.isSlotHoldActive).toBe(true);
    expect(result.current.slotHoldRemaining).toBe(600);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // The effect runs to update the remaining time
    expect(result.current.slotHoldRemaining).toBe(599);

    act(() => {
      result.current.releaseSlotHold();
    });

    expect(result.current.isSlotHoldActive).toBe(false);
    expect(result.current.slotHoldRemaining).toBe(600);
    
    vi.useRealTimers();
  });
});
