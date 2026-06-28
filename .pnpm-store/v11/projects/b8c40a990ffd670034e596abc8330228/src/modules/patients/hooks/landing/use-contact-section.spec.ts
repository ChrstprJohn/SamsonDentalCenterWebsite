/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useContactSection } from './use-contact-section';
import { getAvailableDaysAction } from '@/modules/appointments/actions/availability/get-available-days.action';

vi.mock('@/modules/appointments/actions/availability/get-available-days.action', () => ({
  getAvailableDaysAction: vi.fn().mockResolvedValue({ success: true, data: { availableDates: ['2026-07-01'] } }),
}));

describe('useContactSection', () => {
  it('submits contact inquiry extras and marks local success', async () => {
    const submit = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() =>
      useContactSection({ services: [{ id: 'srv-1', name: 'Cleaning' } as any], handleRealInquirySubmit: submit })
    );

    act(() => {
      result.current.setPhone('123');
      result.current.setTargetDate('2026-07-01');
    });
    await act(async () => {
      await result.current.submitInquiry();
    });

    expect(getAvailableDaysAction).toHaveBeenCalled();
    expect(submit).toHaveBeenCalledWith({ phone: '123', pathway: 'srv-1', targetDate: '2026-07-01', notes: '' });
    expect(result.current.submittedLocal).toBe(true);
  });
});
