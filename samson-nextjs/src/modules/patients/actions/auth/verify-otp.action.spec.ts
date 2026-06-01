import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyOtpAction, resendOtpAction } from './verify-otp.action';
import { createClient } from '@/shared/database/server';

vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn(),
}));

describe('verify-otp.action Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('verifyOtpAction', () => {
    it('returns success: true and session data on successful OTP verification', async () => {
      const input = {
        email: 'john.doe@example.com',
        token: '12345678',
        type: 'signup' as const,
      };

      const mockSession = { user: { email: 'john.doe@example.com' }, session: { token: 'session-token' } };
      const mockSupabase = {
        auth: {
          verifyOtp: vi.fn().mockResolvedValue({
            data: mockSession,
            error: null,
          }),
        },
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const response = await verifyOtpAction(input);

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toEqual(mockSession);
      }
      expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
        email: input.email,
        token: input.token,
        type: 'signup',
      });
    });

    it('returns success: false with an error message when OTP verification fails', async () => {
      const input = {
        email: 'john.doe@example.com',
        token: '12345678',
        type: 'signup' as const,
      };

      const mockSupabase = {
        auth: {
          verifyOtp: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Token has expired or is invalid' },
          }),
        },
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const response = await verifyOtpAction(input);

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe('Token has expired or is invalid');
      }
    });
  });

  describe('resendOtpAction', () => {
    it('returns success: true when OTP resending is successful', async () => {
      const email = 'john.doe@example.com';
      const mockSupabase = {
        auth: {
          resend: vi.fn().mockResolvedValue({
            error: null,
          }),
        },
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const response = await resendOtpAction(email);

      expect(response.success).toBe(true);
      expect(mockSupabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: email,
      });
    });

    it('returns success: false with an error message when OTP resending fails', async () => {
      const email = 'john.doe@example.com';
      const mockSupabase = {
        auth: {
          resend: vi.fn().mockResolvedValue({
            error: { message: 'Too many requests' },
          }),
        },
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const response = await resendOtpAction(email);

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe('Too many requests');
      }
    });
  });
});
