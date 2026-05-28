import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStaffAction, updateStaffAction, terminateStaffAction } from './admin-staff.actions';
import { authorizeRole } from '@/shared/auth/auth.util';
import { UnauthorizedError } from '@/shared/errors/unauthorized.error'; // Import at top
// 1. Mocks
vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
vi.mock('../use-cases/create-staff.use-case', () => {
    return {
        CreateStaffUseCase: class {
            execute = vi.fn().mockResolvedValue({ id: '123' });
        },
    };
});
vi.mock('../use-cases/update-staff.use-case', () => {
    return {
        UpdateStaffUseCase: class {
            execute = vi.fn().mockResolvedValue({ id: '123' });
        },
    };
});
vi.mock('../use-cases/terminate-staff.use-case', () => {
    return {
        TerminateStaffUseCase: class {
            execute = vi.fn().mockResolvedValue({ success: true });
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
        // 1. Arrange: Mock successful admin authentication
        (authorizeRole as any).mockResolvedValue({ id: 'user_123' });

        // 2. Act: Execute the action
        const result = await createStaffAction(mockStaffData);

        // 3. Assert: Verify success response
        expect(result.success).toBe(true);
    });

    it('should return failure if Zod validation fails', async () => {
        // 1. Arrange: Create invalid payload
        const invalidData = { ...mockStaffData, email: 'not-an-email' };

        // 2. Act
        const result = await createStaffAction(invalidData as any);

        // 3. Assert: Verify validation error mapping
        expect(result.success).toBe(false);
        expect(result.error).toContain('Validation failed');
    });

    it('should return failure if user is not authenticated', async () => {
        // 1. Arrange: Simulate auth service failure
        vi.mocked(authorizeRole).mockRejectedValue(new UnauthorizedError('Unauthorized'));

        // 2. Act
        const result = await createStaffAction(mockStaffData);

        // 3. Assert: Ensure auth failures are handled safely
        expect(result.success).toBe(false);
    });
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
