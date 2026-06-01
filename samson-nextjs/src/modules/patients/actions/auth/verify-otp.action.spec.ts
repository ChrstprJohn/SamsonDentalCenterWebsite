import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyOtpAction, resendOtpAction } from './verify-otp.action';
import { createClient, createAdminClient } from '@/shared/database/server';

vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
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
      
      const mockAdminSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: '123' } })
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
      vi.mocked(createAdminClient).mockResolvedValue(mockAdminSupabase as any);

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
      
      const mockAdminSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: '123' } })
      };
      
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
      vi.mocked(createAdminClient).mockResolvedValue(mockAdminSupabase as any);

      const response = await verifyOtpAction(input);

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe('Token has expired or is invalid');
      }
    });

    it('returns false if user does not exist in recovery flow', async () => {
      const input = { email: 'john.doe@example.com', token: '123456', type: 'recovery' as const };
      
      const mockAdminSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null }) // User not found
      };
      vi.mocked(createAdminClient).mockResolvedValue(mockAdminSupabase as any);
      vi.mocked(createClient).mockResolvedValue({} as any);

      const response = await verifyOtpAction(input);
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe('User not found');
      }
    });

    it('returns false if recovery session is missing', async () => {
      const input = { email: 'john.doe@example.com', token: '123456', type: 'recovery' as const };
      
      const mockAdminSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: '123' } })
      };
      
      const mockSupabase = {
        auth: {
          verifyOtp: vi.fn().mockResolvedValue({
            data: { user: { email: 'john.doe@example.com' }, session: null },
            error: null,
          }),
        },
      };
      
      vi.mocked(createAdminClient).mockResolvedValue(mockAdminSupabase as any);
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const response = await verifyOtpAction(input);
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toContain('Failed to establish recovery session');
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
