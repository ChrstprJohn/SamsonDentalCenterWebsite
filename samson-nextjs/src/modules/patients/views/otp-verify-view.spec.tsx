/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { OTPVerifyView } from './otp-verify-view';
import { useOTPVerifyView, OTP_LENGTH } from '../hooks/auth/otp/use-otp-verify-view.hook';
import { vi, describe, it, expect } from 'vitest';

vi.mock('../hooks/auth/otp/use-otp-verify-view.hook', () => ({
  useOTPVerifyView: vi.fn(),
  OTP_LENGTH: 6,
}));

describe('OTPVerifyView', () => {
  it('should render the view correctly', () => {
    (useOTPVerifyView as any).mockReturnValue({
      code: ['', '', '', '', '', ''],
      isLoading: false,
      countdown: 60,
      email: 'test@example.com',
      inputRefs: { current: [] },
      handleChange: vi.fn(),
      handleKeyDown: vi.fn(),
      handleVerify: vi.fn(),
      handleResend: vi.fn(),
    });

    render(<OTPVerifyView />);

    expect(screen.getByText('Verify Account')).toBeDefined();
    expect(screen.getByText(/We have sent an 6-digit OTP verification code to/i)).toBeDefined();
    expect(screen.getByText('test@example.com')).toBeDefined();
    expect(screen.getByText('Resend code in 60s')).toBeDefined();
  });
});
