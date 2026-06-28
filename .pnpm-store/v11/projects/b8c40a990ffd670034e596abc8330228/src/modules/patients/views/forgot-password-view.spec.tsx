/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ForgotPasswordView } from './forgot-password-view';
import { useForgotPasswordView } from '../hooks/auth/forgot-password/use-forgot-password-view';
import { vi, describe, it, expect } from 'vitest';

vi.mock('../hooks/auth/forgot-password/use-forgot-password-view', () => ({
  useForgotPasswordView: vi.fn(),
}));

// Mock the form component
vi.mock('../components/auth/forgot-password-form', () => ({
  ForgotPasswordForm: () => <div data-testid="forgot-password-form">Forgot Password Form</div>,
}));

describe('ForgotPasswordView', () => {
  it('should render the view correctly', () => {
    (useForgotPasswordView as any).mockReturnValue({
      form: { register: vi.fn(), formState: { errors: {} }, handleSubmit: vi.fn() },
      isLoading: false,
      onSubmit: vi.fn(),
    });

    render(<ForgotPasswordView />);

    expect(screen.getByText('Reset Password')).toBeDefined();
    expect(screen.getByText(/Enter your email and we'll send you a verification code/i)).toBeDefined();
    expect(screen.getByTestId('forgot-password-form')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Log In' })).toHaveProperty('href', expect.stringContaining('/auth/login'));
  });
});
