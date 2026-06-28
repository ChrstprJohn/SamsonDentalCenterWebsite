/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateFinalPrice, useSecretaryDashboard } from './use-secretary-dashboard';

const mockAddToast = vi.fn();
vi.mock('@/components/feedback/toast-container', () => ({ useToast: () => ({ addToast: mockAddToast }) }));

describe('useSecretaryDashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calculates discounted invoice totals without going below zero', () => {
    expect(calculateFinalPrice(100, 15)).toBe(85);
    expect(calculateFinalPrice(100, 150)).toBe(0);
  });

  it('toggles pending selection by id', () => {
    const { result } = renderHook(() => useSecretaryDashboard());

    act(() => result.current.handlePendingSelect('pb-1'));
    expect(result.current.selectedPendingIds).toEqual(['pb-1']);

    act(() => result.current.handlePendingSelect('pb-1'));
    expect(result.current.selectedPendingIds).toEqual([]);
  });
});
