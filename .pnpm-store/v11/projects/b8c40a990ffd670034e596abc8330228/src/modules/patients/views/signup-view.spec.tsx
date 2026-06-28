/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { SignUpView } from './signup-view';
import { useSignUpView } from '../hooks/auth/sign-up/use-sign-up-view';
import { vi, describe, it, expect } from 'vitest';

vi.mock('../hooks/auth/sign-up/use-sign-up-view', () => ({
  useSignUpView: vi.fn(),
}));

vi.mock('../components/auth/signup-form', () => ({
  SignUpForm: () => <div data-testid="signup-form">SignUp Form</div>,
}));

describe('SignUpView', () => {
  it('should render the view correctly', () => {
    (useSignUpView as any).mockReturnValue({
      register: vi.fn(),
      errors: {},
      handleSubmit: (fn: any) => fn,
      isLoading: false,
      onSubmit: vi.fn(),
    });

    render(<SignUpView />);

    expect(screen.getByText('Create Patient Account')).toBeDefined();
    expect(screen.getByText(/Sign up to schedule and manage your dental appointments/i)).toBeDefined();
    expect(screen.getByTestId('signup-form')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Log In' })).toHaveProperty('href', expect.stringContaining('/auth/login'));
  });
});
