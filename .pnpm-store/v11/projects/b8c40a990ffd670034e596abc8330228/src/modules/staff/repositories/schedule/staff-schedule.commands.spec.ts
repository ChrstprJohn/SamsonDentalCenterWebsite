import { describe, it, expect, vi } from 'vitest';
import { upsertScheduleCommand } from './staff-schedule.commands';
import { DomainError } from '@/shared/errors';
import { DoctorScheduleDto } from '../../dtos/schedule/doctor-schedule.dto';

describe('StaffScheduleCommands (Functional)', () => {
    const validData: DoctorScheduleDto = {
        doctorId: '123e4567-e89b-12d3-a456-426614174000',
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
    };

    it('successfully upserts a schedule', async () => {
        const mockSupabase = {
            from: vi.fn().mockReturnThis(),
            upsert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'sched_123' }, error: null }),
        };

        const upsertSchedule = upsertScheduleCommand(mockSupabase as any);
        const result = await upsertSchedule(validData);

        expect(result.id).toBe('sched_123');
        expect(mockSupabase.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                doctor_id: validData.doctorId,
                day_of_week: 1, // mapped from MONDAY
                start_time: validData.startTime,
            }),
            { onConflict: 'doctor_id,day_of_week' }
        );
    });

    it('throws DomainError on database error', async () => {
        const mockSupabase = {
            from: vi.fn().mockReturnThis(),
            upsert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }),
        };

        const upsertSchedule = upsertScheduleCommand(mockSupabase as any);
        await expect(upsertSchedule(validData)).rejects.toThrow(DomainError);
    });
});
