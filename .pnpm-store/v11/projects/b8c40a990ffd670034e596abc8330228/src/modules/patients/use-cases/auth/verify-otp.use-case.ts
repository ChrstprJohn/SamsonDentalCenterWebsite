import { DomainError } from '@/shared/errors';

interface VerifyOtpDeps {
  checkUserExists: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, token: string, type: 'signup' | 'recovery') => Promise<any>;
}

export const verifyOtpUseCase = (deps: VerifyOtpDeps) => {
  return async (email: string, token: string, type: 'signup' | 'recovery') => {
    // 1. Business Logic: For recovery, ensure user exists before verifying OTP.
    if (type === 'recovery') {
      const exists = await deps.checkUserExists(email);
      if (!exists) {
        throw new DomainError('User not found');
      }
    }

    // 2. Verify OTP
    let sessionData;
    try {
      sessionData = await deps.verifyOtp(email, token, type);
    } catch (error: any) {
      throw new DomainError(error.message || 'Token has expired or is invalid');
    }

    // 3. Business Logic: Ensure session is granted for recovery, and verify identity matching
    if (type === 'recovery' && !sessionData.session) {
      throw new DomainError('Failed to establish recovery session');
    }
    
    if (sessionData.user && sessionData.user.email !== email) {
      throw new DomainError('Identity verification failed: Email mismatch');
    }

    return sessionData;
  };
};
