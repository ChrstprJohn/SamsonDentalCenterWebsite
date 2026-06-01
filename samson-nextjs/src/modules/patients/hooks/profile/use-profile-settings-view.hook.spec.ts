/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useProfileSettingsView } from './use-profile-settings-view.hook';
import { useToast } from '@/components/feedback/toast-container';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/components/feedback/toast-container', () => ({
  useToast: vi.fn(),
}));

describe('useProfileSettingsView', () => {
  const mockAddToast = vi.fn();
  const initialUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    dob: '1990-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ addToast: mockAddToast });
    vi.useFakeTimers();
  });

  it('should initialize with user data', () => {
    const { result } = renderHook(() => useProfileSettingsView(initialUser));

    expect(result.current.profileDetails.firstName).toBe('John');
    expect(result.current.profileDetails.lastName).toBe('Doe');
    expect(result.current.profileDetails.email).toBe('john@example.com');
  });

  it('should validate before submit', async () => {
    const { result } = renderHook(() => useProfileSettingsView(initialUser));

    act(() => {
      result.current.profileDetails.setFirstName('');
    });

    await act(async () => {
      const e = { preventDefault: vi.fn() } as any;
      await result.current.handleProfileSubmit(e);
    });

    expect(mockAddToast).toHaveBeenCalledWith('Please fill out all mandatory fields.', 'error');
  });

  it('should handle profile submit successfully', async () => {
    const { result } = renderHook(() => useProfileSettingsView(initialUser));

    const submitPromise = act(async () => {
      const e = { preventDefault: vi.fn() } as any;
      await result.current.handleProfileSubmit(e);
    });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await submitPromise;

    expect(mockAddToast).toHaveBeenCalledWith('Profile records updated successfully.', 'success');
  });
});
