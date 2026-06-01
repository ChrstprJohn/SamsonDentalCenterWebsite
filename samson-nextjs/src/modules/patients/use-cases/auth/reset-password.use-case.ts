import { DomainError } from '@/shared/errors';
import { ResetPasswordDto } from '../../dtos/auth/reset-password.dto';

interface ResetPasswordDeps {
  getSessionUser: () => Promise<any>;
  updatePassword: (data: ResetPasswordDto) => Promise<void>;
  signOut: () => Promise<void>;
}

export const resetPasswordUseCase = (deps: ResetPasswordDeps) => {
  return async (data: ResetPasswordDto) => {
    try {
      // 1. Business Logic: Ensure active session exists before updating password
      await deps.getSessionUser();
      
      // 2. Update password
      await deps.updatePassword(data);

      // 3. Invalidate session so user must login manually
      await deps.signOut();
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        throw new DomainError('Unauthorized. Please restart the password reset process.');
      }
      throw new DomainError(error.message || 'Failed to reset password');
    }
  };
};
