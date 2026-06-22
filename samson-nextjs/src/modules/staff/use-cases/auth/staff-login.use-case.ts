import { StaffLoginDto } from '../../dtos/auth/staff-login.dto';
import { DomainError } from '@/shared/errors';

export const staffLoginUseCase = (
  loginCommand: (data: StaffLoginDto) => Promise<any>
) => {
  return async (data: StaffLoginDto) => {
    // 1. Perform authentication command wrapped in try/catch to convert to DomainError
    let result;
    try {
      result = await loginCommand(data);
      console.log(result)
    } catch (error: any) {
      throw new DomainError(error.message || 'Login failed');
    }

    // 2. Validate role metadata
    const role = result?.user?.user_metadata?.role || 'PATIENT';
    const isStaff = ['ADMIN', 'SECRETARY', 'DOCTOR'].includes(role);

    if (!isStaff) {
      throw new DomainError('Access denied: patients cannot log in to the staff portal');
    }

    return result;
  };
};
