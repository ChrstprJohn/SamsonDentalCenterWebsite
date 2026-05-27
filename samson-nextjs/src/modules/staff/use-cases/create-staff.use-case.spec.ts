import { describe, it, expect, vi } from 'vitest';
import { CreateStaffUseCase } from './create-staff.use-case';
import { StaffProfileCommands } from '../repositories/staff-profile.commands';
import { CreateStaffDto } from '../dtos/create-staff.dto';

describe('CreateStaffUseCase (Unit Test)', () => {
    // 1. Arrange: Create a mock of the repository
    const mockStaffCommands = {
        createStaff: vi.fn(),
    } as unknown as StaffProfileCommands;

    const useCase = new CreateStaffUseCase(mockStaffCommands);

    const validData: CreateStaffDto = {
        firstName: 'John',
        middleName: null,
        lastName: 'Doe',
        suffix: null,
        email: 'john.doe@samson.com',
        role: 'DOCTOR',
        phoneNumber: '+1234567890',
    };

    it('should successfully delegate the creation of staff to the repository', async () => {
        // 1. Configure the mock to return a successful record
        const mockCreatedStaff = { id: 'user_123', ...validData };
        vi.mocked(mockStaffCommands.createStaff).mockResolvedValue(mockCreatedStaff);

        // 2. Act
        const result = await useCase.execute('user_123', validData);

        // 3. Assert
        expect(mockStaffCommands.createStaff).toHaveBeenCalledWith('user_123', validData);
        expect(result).toEqual(mockCreatedStaff);
    });

    it('should propagate errors if the repository fails', async () => {
        // 1. Configure the mock to throw an error
        vi.mocked(mockStaffCommands.createStaff).mockRejectedValue(
            new Error('Database Connection Failed')
        );

        // 2. Act & Assert
        await expect(useCase.execute('user_123', validData)).rejects.toThrow(
            'Database Connection Failed'
        );
    });
});
