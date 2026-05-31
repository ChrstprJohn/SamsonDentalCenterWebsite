import { describe, it, expect, vi } from 'vitest';
import { registerPatientUseCase } from './register-patient.use-case';
import { RegisterPatientDto } from '../../dtos/profile/register-patient.dto';

describe('RegisterPatientUseCase (Functional)', () => {
  it('should successfully register a patient by delegating to the repository function', async () => {
    // 1. Arrange: Setup mock data
    const mockUserId = 'user-123';
    const mockDto: RegisterPatientDto = {
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'A',
      suffix: 'Jr.',
      email: 'john.doe@example.com', 
      dateOfBirth: '1990-01-01',
      phoneNumber: '+1234567890'
    };
    
    const mockCreatedPatient = { id: 'patient-abc', ...mockDto };

    const mockCreatePatient = vi.fn().mockResolvedValue(mockCreatedPatient);
    const execute = registerPatientUseCase(mockCreatePatient);

    // 2. Act
    const result = await execute(mockUserId, mockDto);

    // 3. Assert
    expect(mockCreatePatient).toHaveBeenCalledTimes(1);
    expect(mockCreatePatient).toHaveBeenCalledWith(mockUserId, mockDto);
    expect(result).toEqual(mockCreatedPatient);
  });
});
