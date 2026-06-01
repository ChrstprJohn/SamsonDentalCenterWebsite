/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useForgotPasswordView } from './use-forgot-password-view.hook';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';
import { useForm } from 'react-hook-form';
import { requestPasswordResetAction } from '../../../actions/auth/request-password-reset.action';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/components/feedback/toast-container', () => ({
  useToast: vi.fn(),
}));

vi.mock('../../../actions/auth/request-password-reset.action', () => ({
  requestPasswordResetAction: vi.fn(),
}));

vi.mock('react-hook-form', () => ({
  useForm: vi.fn(),
}));

// We also need to mock zodResolver since it's imported by the hook
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(),
}));

describe('useForgotPasswordView', () => {
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

  it('should handle successful password reset request', async () => {
    (requestPasswordResetAction as any).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useForgotPasswordView());

    await act(async () => {
      await result.current.onSubmit({ email: 'test@example.com' });
    });

    expect(requestPasswordResetAction).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(mockAddToast).toHaveBeenCalledWith(
      'If an account with that email exists, we sent a reset link.',
      'success'
    );
    expect(mockPush).toHaveBeenCalledWith('/auth/verify-otp?email=test%40example.com&type=recovery');
  });

  it('should handle failed password reset request with field errors', async () => {
    (requestPasswordResetAction as any).mockResolvedValue({
      success: false,
      error: 'Invalid email',
      fieldErrors: { email: ['Email not found'] },
    });

    const { result } = renderHook(() => useForgotPasswordView());

    await act(async () => {
      await result.current.onSubmit({ email: 'invalid@example.com' });
    });

    expect(mockAddToast).toHaveBeenCalledWith('Invalid email', 'error');
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockSetError).toHaveBeenCalledWith('email', {
      type: 'server',
      message: 'Email not found',
    });
  });
});
