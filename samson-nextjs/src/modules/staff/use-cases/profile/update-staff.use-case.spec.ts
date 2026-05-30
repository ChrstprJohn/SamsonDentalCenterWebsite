import { describe, it, expect, vi } from 'vitest';
import { UpdateStaffUseCase } from './update-staff.use-case';
import { StaffProfileCommands } from '../../repositories/profile/staff-profile.commands';

describe('UpdateStaffUseCase', () => {
    it('successfully calls repository to update staff', async () => {
        const mockCommands = {
            updateStaff: vi.fn().mockResolvedValue({ id: '123', email: 'updated@samson.com' }),
        } as unknown as StaffProfileCommands;

        const useCase = new UpdateStaffUseCase(mockCommands);

        const result = await useCase.execute('123', { email: 'updated@samson.com' });

        expect(mockCommands.updateStaff).toHaveBeenCalledWith('123', {
            email: 'updated@samson.com',
        });
        expect(result.email).toBe('updated@samson.com');
    });
});
