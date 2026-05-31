import { describe, it, expect, vi } from 'vitest';
import { updateDoctorScheduleUseCase } from './update-doctor-schedule.use-case';

describe('UpdateDoctorScheduleUseCase (Functional)', () => {
    it('calls the repository to upsert schedule', async () => {
        const mockUpsertSchedule = vi.fn().mockResolvedValue({ id: 'sched_1' });

        const execute = updateDoctorScheduleUseCase(mockUpsertSchedule);

        const req = {
            doctorId: 'doc_1',
            dayOfWeek: 'MONDAY',
            startTime: '09:00',
            endTime: '17:00',
        } as any;

        const result = await execute(req);

        expect(mockUpsertSchedule).toHaveBeenCalledWith(req);
        expect(result.id).toBe('sched_1');
    });
});
