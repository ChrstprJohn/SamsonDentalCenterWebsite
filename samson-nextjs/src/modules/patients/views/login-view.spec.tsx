/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoginView } from './login-view';
import { useLoginView } from '../hooks/auth/login/use-login-view.hook';
import { vi, describe, it, expect } from 'vitest';

vi.mock('../hooks/auth/login/use-login-view.hook', () => ({
  useLoginView: vi.fn(),
}));

vi.mock('../components/auth/login-form', () => ({
  LoginForm: () => <div data-testid="login-form">Login Form</div>,
}));

describe('LoginView', () => {
  it('should render the view correctly', () => {
    (useLoginView as any).mockReturnValue({
      register: vi.fn(),
      errors: {},
      handleSubmit: (fn: any) => fn,
      isLoading: false,
      onSubmit: vi.fn(),
    });

    render(<LoginView />);

    expect(screen.getByText('Welcome Back')).toBeDefined();
    expect(screen.getByText(/Enter your credentials to access your account/i)).toBeDefined();
    expect(screen.getByTestId('login-form')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveProperty('href', expect.stringContaining('/auth/signup'));
  });
});
