/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminDashboard } from './use-admin-dashboard';

const mockAddToast = vi.fn();
vi.mock('@/components/feedback/toast-container', () => ({ useToast: () => ({ addToast: mockAddToast }) }));

const initialConfig = { isBookingOpen: true } as any;

describe('useAdminDashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('adds a service and audit entry', () => {
    const { result } = renderHook(() => useAdminDashboard({ initialConfig }));

    act(() => { result.current.setNewSvcName('Fluoride'); });
    act(() => { result.current.handleAddService({ preventDefault: vi.fn() } as any); });

    expect(result.current.services.at(-1)?.name).toBe('Fluoride');
    expect(result.current.audits[0].action).toBe('SERVICE_ADDED');
  });

  it('adds a doctor and resets the doctor name field', () => {
    const { result } = renderHook(() => useAdminDashboard({ initialConfig }));

    act(() => { result.current.setNewDocName('Dr. Test'); });
    act(() => { result.current.handleAddDoctor({ preventDefault: vi.fn() } as any); });

    expect(result.current.doctors.at(-1)?.name).toBe('Dr. Test');
    expect(result.current.newDocName).toBe('');
  });
});
