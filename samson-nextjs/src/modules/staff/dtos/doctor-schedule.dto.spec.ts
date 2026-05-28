import { describe, it, expect } from 'vitest';
import { doctorScheduleSchema } from './doctor-schedule.dto';

describe('doctorScheduleSchema', () => {
    const validData = {
        doctorId: '123e4567-e89b-12d3-a456-426614174000',
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
    };

    it('should validate a correct schedule', () => {
        const result = doctorScheduleSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should fail if startTime is after endTime', () => {
        const data = { ...validData, startTime: '18:00', endTime: '17:00' };
        const result = doctorScheduleSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('End time must be after start time');
        }
    });

    it('should fail if time format is completely invalid', () => {
        const data = { ...validData, startTime: '9 AM' };
        const result = doctorScheduleSchema.safeParse(data);
        expect(result.success).toBe(false);
    });
});
