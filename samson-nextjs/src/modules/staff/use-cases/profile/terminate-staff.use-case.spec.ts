import { describe, it, expect, vi } from 'vitest';
import { TerminateStaffUseCase } from './terminate-staff.use-case';
import { StaffProfileCommands } from '../../repositories/profile/staff-profile.commands';

describe('TerminateStaffUseCase', () => {
    it('successfully calls repository to terminate staff', async () => {
        const mockCommands = {
            terminateStaff: vi.fn().mockResolvedValue({ success: true, id: '123' }),
        } as unknown as StaffProfileCommands;

        const useCase = new TerminateStaffUseCase(mockCommands);

        const result = await useCase.execute('123');

        expect(mockCommands.terminateStaff).toHaveBeenCalledWith('123');
        expect(result.success).toBe(true);
    });
});
