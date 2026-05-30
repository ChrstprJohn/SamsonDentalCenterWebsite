import { describe, it, expect, vi, beforeEach } from 'vitest';
import { terminateStaffAction } from './terminate-staff.action';
import { authorizeRole } from '@/shared/auth/auth.util';
import { UnauthorizedError } from '@/shared/errors/unauthorized.error';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
vi.mock('../../use-cases/profile/terminate-staff.use-case', () => {
    return {
        TerminateStaffUseCase: class {
            execute = vi.fn().mockResolvedValue({ success: true });
        },
    };
});

describe('terminateStaffAction (Unit Test)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return success when user is admin', async () => {
        (authorizeRole as any).mockResolvedValue({ id: 'user_123' });
        const result = await terminateStaffAction('123e4567-e89b-12d3-a456-426614174000');
        expect(result.success).toBe(true);
    });

    it('should return failure if user is not authenticated', async () => {
        vi.mocked(authorizeRole).mockRejectedValue(new UnauthorizedError('Unauthorized'));
        const result = await terminateStaffAction('123e4567-e89b-12d3-a456-426614174000');
        expect(result.success).toBe(false);
    });
});
