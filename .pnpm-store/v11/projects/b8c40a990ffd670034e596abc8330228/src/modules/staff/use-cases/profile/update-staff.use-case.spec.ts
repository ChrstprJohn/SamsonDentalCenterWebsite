import { describe, it, expect, vi } from 'vitest';
import { updateStaffUseCase } from './update-staff.use-case';

describe('UpdateStaffUseCase (Functional)', () => {
    it('successfully calls repository to update staff', async () => {
        const mockUpdateStaff = vi.fn().mockResolvedValue({ id: '123', email: 'updated@samson.com' });

        const execute = updateStaffUseCase(mockUpdateStaff);
        const result = await execute('123', { email: 'updated@samson.com' });

        expect(mockUpdateStaff).toHaveBeenCalledWith('123', {
            email: 'updated@samson.com',
        });
        expect(result.email).toBe('updated@samson.com');
    });
});
