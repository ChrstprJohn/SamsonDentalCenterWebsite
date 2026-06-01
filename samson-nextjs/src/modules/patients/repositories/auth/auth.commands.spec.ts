import { describe, it, expect, vi } from 'vitest';
import { verifyOtpCommand, resendAuthOtpCommand } from './auth.commands';

describe('auth.commands', () => {
  describe('verifyOtpCommand', () => {
    it('calls verifyOtp and returns data on success', async () => {
      const mockSupabase = {
        auth: {
          verifyOtp: vi.fn().mockResolvedValue({ data: { session: {} }, error: null }),
        },
      };

      const command = verifyOtpCommand(mockSupabase as any);
      const result = await command('test@example.com', '123456', 'signup');

      expect(result).toEqual({ session: {} });
      expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'signup',
      });
    });

    it('throws an error if verifyOtp fails', async () => {
      const mockSupabase = {
        auth: {
          verifyOtp: vi.fn().mockResolvedValue({ data: null, error: { message: 'Invalid token' } }),
        },
      };

      const command = verifyOtpCommand(mockSupabase as any);

      await expect(command('test@example.com', '123456', 'signup'))
        .rejects.toThrowError('Invalid token');
    });
  });

  describe('resendAuthOtpCommand', () => {
    it('calls resend on success', async () => {
      const mockSupabase = {
        auth: {
          resend: vi.fn().mockResolvedValue({ error: null }),
        },
      };

      const command = resendAuthOtpCommand(mockSupabase as any);
      await command('test@example.com', 'signup');

      expect(mockSupabase.auth.resend).toHaveBeenCalledWith({
        email: 'test@example.com',
        type: 'signup',
      });
    });

    it('throws an error if resend fails', async () => {
      const mockSupabase = {
        auth: {
          resend: vi.fn().mockResolvedValue({ error: { message: 'Too many requests' } }),
        },
      };

      const command = resendAuthOtpCommand(mockSupabase as any);

      await expect(command('test@example.com', 'signup'))
        .rejects.toThrowError('Too many requests');
    });
  });
});
