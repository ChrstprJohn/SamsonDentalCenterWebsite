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
      return await loginCommand(data);
    } catch (error: any) {
      throw new DomainError(error.message || 'Login failed');
    }
  };
};
