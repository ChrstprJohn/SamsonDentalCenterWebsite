import { describe, it, expect } from 'vitest';
import { doctorScheduleSchema } from './doctor-schedule.dto';

describe('doctorScheduleSchema', () => {
    const validData = {
        doctorId: '123e4567-e89b-12d3-a456-426614174000',
        dayOfWeek: 'MONDAY', // MONDAY
        startTime: '09:00',
        endTime: '17:00',
    };

    it('should validate a correct schedule without breaks', () => {
        const result = doctorScheduleSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should validate a correct schedule with valid breaks', () => {
        const data = { ...validData, breakStartTime: '12:00', breakEndTime: '13:00' };
        const result = doctorScheduleSchema.safeParse(data);
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

    it('should fail if break end time is before break start time', () => {
        const data = { ...validData, breakStartTime: '13:00', breakEndTime: '12:00' };
        const result = doctorScheduleSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe(
                'Break end time must be after break start time'
            );
        }
    });

    it('should fail if breaks are outside the working hours window', () => {
        const data = { ...validData, breakStartTime: '08:00', breakEndTime: '12:00' };
        const result = doctorScheduleSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe(
                'Break must be entirely within the working hours'
            );
        }
    });

    it('should fail if time format is completely invalid', () => {
        const data = { ...validData, startTime: '9 AM' };
        const result = doctorScheduleSchema.safeParse(data);
        expect(result.success).toBe(false);
    });
});
