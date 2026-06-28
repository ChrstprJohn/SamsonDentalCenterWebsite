/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useResetPasswordView } from './use-reset-password-view';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';
import { useForm } from 'react-hook-form';
import { resetPasswordAction } from '../../../actions/auth/reset-password.action';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/components/feedback/toast-container', () => ({
  useToast: vi.fn(),
}));

vi.mock('../../../actions/auth/reset-password.action', () => ({
  resetPasswordAction: vi.fn(),
}));

vi.mock('react-hook-form', () => ({
  useForm: vi.fn(),
}));

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(),
}));

describe('useResetPasswordView', () => {
  const mockPush = vi.fn();
  const mockAddToast = vi.fn();
  const mockSetError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (useToast as any).mockReturnValue({ addToast: mockAddToast });
    (useForm as any).mockReturnValue({
      setError: mockSetError,
      formState: { errors: {} },
    });
  });

  it('should handle successful password reset', async () => {
    (resetPasswordAction as any).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useResetPasswordView());

    await act(async () => {
      await result.current.onSubmit({ password: 'NewPassword123!', confirmPassword: 'NewPassword123!' });
    });

    expect(resetPasswordAction).toHaveBeenCalledWith({ password: 'NewPassword123!', confirmPassword: 'NewPassword123!' });
    expect(mockAddToast).toHaveBeenCalledWith(
      'Password successfully reset! You can now log in.',
      'success'
    );
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should handle failed password reset with field errors', async () => {
    (resetPasswordAction as any).mockResolvedValue({
      success: false,
      error: 'Invalid password',
      fieldErrors: { password: ['Password too weak'] },
    });

    const { result } = renderHook(() => useResetPasswordView());

    await act(async () => {
      await result.current.onSubmit({ password: 'weak', confirmPassword: 'weak' });
    });

    expect(mockAddToast).toHaveBeenCalledWith('Invalid password', 'error');
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockSetError).toHaveBeenCalledWith('password', {
      type: 'server',
      message: 'Password too weak',
    });
  });
});
