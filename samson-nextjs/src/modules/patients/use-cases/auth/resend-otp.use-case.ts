import { DomainError } from '@/shared/errors';

interface ResendOtpDeps {
  requestPasswordReset: (email: string) => Promise<void>;
  resendAuthOtp: (email: string, type: 'signup') => Promise<void>;
  triggerBackgroundWorkers: () => void;
}

export const resendOtpUseCase = (deps: ResendOtpDeps) => {
  return async (email: string, type: 'signup' | 'recovery') => {
    try {
      if (type === 'recovery') {
        await deps.requestPasswordReset(email);
        // Business Rule: For recovery, we emit an event to the outbox, so we must trigger workers
        deps.triggerBackgroundWorkers();
      } else {
        await deps.resendAuthOtp(email, type);
      }
    } catch (error: any) {
      throw new DomainError(error.message || 'Failed to resend OTP');
    }
  };
};
