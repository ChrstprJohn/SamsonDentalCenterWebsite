import { describe, it, expect, vi } from 'vitest';
import { RegisterPatientUseCase } from './register-patient.use-case';
import { PatientProfileCommands } from '../../repositories/profile/patient-profile.commands';
import { RegisterPatientDto } from '../../dtos/profile/register-patient.dto';

describe('RegisterPatientUseCase', () => {
  it('should successfully register a patient by delegating to the repository', async () => {
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

    // Create a mock of the commands repository
    // We mock only the method we need
    const mockCommands = {
      createPatient: vi.fn().mockResolvedValue(mockCreatedPatient)
    } as unknown as PatientProfileCommands;

    // Inject the fake repository
    const useCase = new RegisterPatientUseCase(mockCommands);

    // 2. Act
    const result = await useCase.execute(mockUserId, mockDto);

    // 3. Assert
    expect(mockCommands.createPatient).toHaveBeenCalledTimes(1);
    expect(mockCommands.createPatient).toHaveBeenCalledWith(mockUserId, mockDto);
    expect(result).toEqual(mockCreatedPatient);
  });
});
