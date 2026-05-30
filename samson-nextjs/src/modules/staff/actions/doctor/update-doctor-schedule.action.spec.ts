import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateDoctorScheduleAction } from './update-doctor-schedule.action';
import { authorizeRole } from '@/shared/auth/auth.util';
import { UnauthorizedError } from '@/shared/errors/unauthorized.error';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
vi.mock('../../use-cases/schedule/update-doctor-schedule.use-case', () => {
    return {
        UpdateDoctorScheduleUseCase: class {
            execute = vi.fn().mockResolvedValue({ id: 'sched_1' });
        },
    };
});

describe('updateDoctorScheduleAction (Unit Test)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockData = {
        doctorId: '123e4567-e89b-12d3-a456-426614174000',
        dayOfWeek: 'MONDAY' as const,
        startTime: '09:00',
        endTime: '17:00',
    };

    it('should return success when input is valid and user is admin', async () => {
        (authorizeRole as any).mockResolvedValue({ id: 'user_123' });
        const result = await updateDoctorScheduleAction(mockData as any);
        expect(result.success).toBe(true);
    });

    it('should return failure if Zod validation fails', async () => {
        const invalidData = { ...mockData, startTime: 'invalid' };
        const result = await updateDoctorScheduleAction(invalidData as any);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Validation failed');
    });

    it('should return failure if user is not authenticated', async () => {
        vi.mocked(authorizeRole).mockRejectedValue(new UnauthorizedError('Unauthorized'));
        const result = await updateDoctorScheduleAction(mockData as any);
        expect(result.success).toBe(false);
    });
});
