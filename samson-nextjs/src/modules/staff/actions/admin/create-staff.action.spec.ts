import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStaffAction } from './create-staff.action';
import { authorizeRole } from '@/shared/auth/auth.util';
import { UnauthorizedError } from '@/shared/errors/unauthorized.error';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
vi.mock('../../use-cases/create-staff.use-case', () => {
    return {
        CreateStaffUseCase: class {
            execute = vi.fn().mockResolvedValue({ id: '123' });
        },
    };
});

describe('createStaffAction (Unit Test)', () => {
    const mockStaffData = {
        firstName: 'Jane',
        middleName: null,
        lastName: 'Smith',
        suffix: null,
        email: 'jane.smith@samson.com',
        role: 'DOCTOR' as const,
        phoneNumber: '+19876543210',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return success when input is valid and user is admin', async () => {
        (authorizeRole as any).mockResolvedValue({ id: 'user_123' });
        const result = await createStaffAction(mockStaffData);
        expect(result.success).toBe(true);
    });

    it('should return failure if Zod validation fails', async () => {
        const invalidData = { ...mockStaffData, email: 'not-an-email' };
        const result = await createStaffAction(invalidData as any);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Validation failed');
    });

    it('should return failure if user is not authenticated', async () => {
        vi.mocked(authorizeRole).mockRejectedValue(new UnauthorizedError('Unauthorized'));
        const result = await createStaffAction(mockStaffData);
        expect(result.success).toBe(false);
    });
});
