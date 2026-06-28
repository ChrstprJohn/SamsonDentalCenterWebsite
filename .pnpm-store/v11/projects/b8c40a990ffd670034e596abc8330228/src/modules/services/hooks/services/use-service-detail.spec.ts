// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useServiceDetail } from './use-service-detail';

vi.mock('../../actions/management/archive-service.action', () => ({
  archiveServiceAction: vi.fn(),
}));

vi.mock('../../actions/management/toggle-service-visibility.action', () => ({
  toggleServiceVisibilityAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe('useServiceDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useServiceDetail({ service: null }));
    expect(result.current.isEditing).toBe(false);
    expect(result.current.isArchiveModalOpen).toBe(false);
  });
});
