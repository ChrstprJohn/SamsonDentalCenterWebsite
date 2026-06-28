/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSecretary } from './use-secretary';

describe('useSecretary', () => {
  it('updates booking wizard patient state and resets it', () => {
    const { result } = renderHook(() => useSecretary());

    act(() => {
      result.current.setBookingStep(2);
      result.current.setIsNewGuest(true);
      result.current.setGuestForm({ firstName: 'Ada', middleName: '', lastName: 'Lovelace', suffix: '', phoneNumber: '1', email: 'ada@test.com' });
      result.current.resetBookingWizard();
    });

    expect(result.current.bookingStep).toBe(1);
    expect(result.current.isNewGuest).toBe(false);
    expect(result.current.guestForm.firstName).toBe('');
  });

  it('toggles check-in status and writes an audit record', async () => {
    const { result } = renderHook(() => useSecretary());
    const initialAuditCount = result.current.audits.length;

    await act(async () => {
      await result.current.handleCheckInToggle(result.current.appointments[0].id, 'APPROVED');
    });

    expect(result.current.appointments[0].status).toBe('CHECKED_IN');
    expect(result.current.audits).toHaveLength(initialAuditCount + 1);
  });
});
