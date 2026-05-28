import { describe, it, expect, vi } from 'vitest';
import { UpdateDoctorScheduleUseCase } from './update-doctor-schedule.use-case';
import { StaffScheduleCommands } from '../repositories/staff-schedule.commands';

describe('UpdateDoctorScheduleUseCase', () => {
    it('calls the repository to upsert schedule', async () => {
        const mockCommands = {
            upsertSchedule: vi.fn().mockResolvedValue({ id: 'sched_1' }),
        } as unknown as StaffScheduleCommands;

        const useCase = new UpdateDoctorScheduleUseCase(mockCommands);

        const req = {
            doctorId: 'doc_1',
            dayOfWeek: 'MONDAY',
            startTime: '09:00',
            endTime: '17:00',
        } as any;

        const result = await useCase.execute(req);

        expect(mockCommands.upsertSchedule).toHaveBeenCalledWith(req);
        expect(result.id).toBe('sched_1');
    });
});
