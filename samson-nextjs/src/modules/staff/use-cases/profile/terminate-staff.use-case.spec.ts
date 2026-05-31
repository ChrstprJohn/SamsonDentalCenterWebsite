import { describe, it, expect, vi } from 'vitest';
import { terminateStaffUseCase } from './terminate-staff.use-case';

describe('TerminateStaffUseCase (Functional)', () => {
    it('successfully calls repository to terminate staff', async () => {
        const mockTerminateStaff = vi.fn().mockResolvedValue({ success: true, id: '123' });

        const execute = terminateStaffUseCase(mockTerminateStaff);
        const result = await execute('123');

        expect(mockTerminateStaff).toHaveBeenCalledWith('123');
        expect(result.success).toBe(true);
    });
});
