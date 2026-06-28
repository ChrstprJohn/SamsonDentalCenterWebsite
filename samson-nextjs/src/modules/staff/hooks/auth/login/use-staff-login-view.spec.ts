/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStaffLoginView } from './use-staff-login-view';
import { staffLoginAction } from '../../../actions/auth/staff-login.action';

const mockPush = vi.fn();
const mockAddToast = vi.fn();
const mockGet = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet }),
}));
vi.mock('@/components/feedback/toast-container', () => ({ useToast: () => ({ addToast: mockAddToast }) }));
vi.mock('../../../actions/auth/staff-login.action', () => ({ staffLoginAction: vi.fn() }));

describe('useStaffLoginView', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects admins to the admin portal after successful login', async () => {
    mockGet.mockReturnValue(null);
    vi.mocked(staffLoginAction).mockResolvedValueOnce({
      success: true,
      data: { user: { user_metadata: { role: 'ADMIN' } } },
    } as any);
    const { result } = renderHook(() => useStaffLoginView());

    await act(async () => {
      await result.current.onSubmit({ email: 'admin@test.com', password: 'password123' });
    });

    expect(mockAddToast).toHaveBeenCalledWith('Logged in successfully!', 'success');
    expect(mockPush).toHaveBeenCalledWith('/admin');
  });

  it('shows action errors without redirecting', async () => {
    vi.mocked(staffLoginAction).mockResolvedValueOnce({ success: false, error: 'Invalid credentials' } as any);
    const { result } = renderHook(() => useStaffLoginView());

    await act(async () => {
      await result.current.onSubmit({ email: 'staff@test.com', password: 'bad' });
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalled();
  });
});
