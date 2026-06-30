import { LoginInput } from '../../dtos/auth/login.dto';
import { DomainError } from '@/shared/errors';

export const loginUseCase = (
  loginCommand: (data: LoginInput) => Promise<any>
) => {
  return async (data: LoginInput) => {
    // Business validation
    if (!data.password) {
      throw new DomainError('Password is required');
    }

    try {
      const result = await loginCommand(data);
      const role = result?.user?.user_metadata?.role || 'PATIENT';
      const isStaff = ['ADMIN', 'SECRETARY', 'DOCTOR'].includes(role);
      
      if (isStaff) {
        throw new DomainError('Access denied: staff members cannot log in to the patient portal');
      }

      return result;
    } catch (error: any) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(error.message || 'Login failed');
    }
  };
};
