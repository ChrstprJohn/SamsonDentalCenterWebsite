// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useServiceForm } from './use-service-form';

vi.mock('../../actions/management/create-service.action', () => ({
  createServiceAction: vi.fn().mockResolvedValue({ data: { id: '1' } }),
}));

vi.mock('../../actions/management/update-service.action', () => ({
  updateServiceAction: vi.fn().mockResolvedValue({ data: { id: '1' } }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe('useServiceForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useServiceForm());
    expect(result.current.form.getValues().name).toBe('');
    expect(result.current.form.getValues().durationMinutes).toBe(30);
  });
});
