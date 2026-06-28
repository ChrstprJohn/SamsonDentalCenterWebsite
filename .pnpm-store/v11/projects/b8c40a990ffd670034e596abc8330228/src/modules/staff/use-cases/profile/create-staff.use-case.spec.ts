import { describe, it, expect, vi } from 'vitest';
import { createStaffUseCase } from './create-staff.use-case';
import { CreateStaffDto } from '../../dtos/profile/create-staff.dto';

describe('CreateStaffUseCase (Functional)', () => {
    const validData: CreateStaffDto = {
        firstName: 'John',
        middleName: null,
        lastName: 'Doe',
        suffix: null,
        email: 'john.doe@samson.com',
        role: 'DOCTOR',
        phoneNumber: '+1234567890',
    };

    it('should successfully delegate the creation of staff to the repository function', async () => {
        // 1. Arrange: Create a mock function
        const mockCreateStaff = vi.fn();
        const mockCreatedStaff = { id: 'user_123', ...validData };
        mockCreateStaff.mockResolvedValue(mockCreatedStaff);

        const execute = createStaffUseCase(mockCreateStaff);

        // 2. Act
        const result = await execute('user_123', validData);

        // 3. Assert
        expect(mockCreateStaff).toHaveBeenCalledWith('user_123', validData);
        expect(result).toEqual(mockCreatedStaff);
    });

    it('should propagate errors if the repository fails', async () => {
        const mockCreateStaff = vi.fn();
        mockCreateStaff.mockRejectedValue(new Error('Database Connection Failed'));

        const execute = createStaffUseCase(mockCreateStaff);

        // 2. Act & Assert
        await expect(execute('user_123', validData)).rejects.toThrow('Database Connection Failed');
    });
});
