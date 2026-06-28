/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResetPasswordView } from './reset-password-view';
import { useResetPasswordView } from '../hooks/auth/reset-password/use-reset-password-view';
import { vi, describe, it, expect } from 'vitest';

vi.mock('../hooks/auth/reset-password/use-reset-password-view', () => ({
  useResetPasswordView: vi.fn(),
}));

vi.mock('../components/auth/reset-password-form', () => ({
  ResetPasswordForm: () => <div data-testid="reset-password-form">Reset Password Form</div>,
}));

describe('ResetPasswordView', () => {
  it('should render the view correctly', () => {
    (useResetPasswordView as any).mockReturnValue({
      form: { register: vi.fn(), formState: { errors: {} }, handleSubmit: vi.fn() },
      isLoading: false,
      onSubmit: vi.fn(),
    });

    render(<ResetPasswordView />);

    expect(screen.getByText('Enter New Password')).toBeDefined();
    expect(screen.getByText(/Enter your new password below/i)).toBeDefined();
    expect(screen.getByTestId('reset-password-form')).toBeDefined();
  });
});
