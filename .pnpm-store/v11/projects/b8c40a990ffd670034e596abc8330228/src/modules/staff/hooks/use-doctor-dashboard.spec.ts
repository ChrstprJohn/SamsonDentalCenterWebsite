/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDoctorDashboard } from './use-doctor-dashboard';

const mockAddToast = vi.fn();
vi.mock('@/components/feedback/toast-container', () => ({ useToast: () => ({ addToast: mockAddToast }) }));

describe('useDoctorDashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts a treatment session with the main service selected', () => {
    const { result } = renderHook(() => useDoctorDashboard());
    const patient = result.current.queue[0];

    act(() => result.current.handleStartTreatment(patient));

    expect(result.current.activeSession?.id).toBe(patient.id);
    expect(result.current.selectedServices).toEqual([patient.serviceName]);
  });

  it('requires clinical notes before finalizing treatment', async () => {
    const { result } = renderHook(() => useDoctorDashboard());

    act(() => result.current.handleStartTreatment(result.current.queue[0]));
    await act(async () => result.current.handleFinalizeTreatment({ preventDefault: vi.fn() } as any));

    expect(mockAddToast).toHaveBeenCalledWith('Please enter clinical diagnostics notes.', 'error');
  });
});
