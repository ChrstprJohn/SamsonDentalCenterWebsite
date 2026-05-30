import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateStaffAction } from './update-staff.action';
import { authorizeRole } from '@/shared/auth/auth.util';
import { UnauthorizedError } from '@/shared/errors/unauthorized.error';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
vi.mock('../../use-cases/profile/update-staff.use-case', () => {
    return {
        UpdateStaffUseCase: class {
            execute = vi.fn().mockResolvedValue({ id: '123' });
        },
    };
});

describe('updateStaffAction (Unit Test)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockUpdateData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'updated@samson.com',
    };

    it('should return success when input is valid and user is admin', async () => {
        (authorizeRole as any).mockResolvedValue({ id: 'user_123' });
        const result = await updateStaffAction(mockUpdateData);
        expect(result.success).toBe(true);
    });

    it('should return failure if Zod validation fails', async () => {
        const invalidData = { ...mockUpdateData, id: 'not-a-uuid' };
        const result = await updateStaffAction(invalidData as any);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Validation failed');
    });
});
