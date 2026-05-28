import { describe, expect, it } from 'vitest';
import {
    getAvailableDaysSchema,
    getAvailableDaysResponseSchema,
    getAvailableTimeSlotsSchema,
    getAvailableTimeSlotsResponseSchema,
} from './get-availability.dto';

const VALID_SERVICE_ID = '123e4567-e89b-12d3-a456-426614174000';
const VALID_DOCTOR_ID = '823e4567-e89b-12d3-a456-426614174001';

// ==========================================
// 1. MONTHLY CALENDAR AVAILABILITY TESTS
// ==========================================

describe('getAvailableDaysSchema', () => {
    it('should validate typical valid input with Any Doctor (no doctorId) for a month', () => {
        const result = getAvailableDaysSchema.safeParse({
            serviceId: VALID_SERVICE_ID,
            month: '2026-05',
        });
        expect(result.success).toBe(true);
    });

    it('should validate typical valid input with Specific Doctor for a month', () => {
        const result = getAvailableDaysSchema.safeParse({
            serviceId: VALID_SERVICE_ID,
            doctorId: VALID_DOCTOR_ID,
            month: '2026-05',
        });
        expect(result.success).toBe(true);
    });

    it('should normalize empty string doctorId to undefined', () => {
        const result = getAvailableDaysSchema.safeParse({
            serviceId: VALID_SERVICE_ID,
            doctorId: '',
            month: '2026-05',
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.doctorId).toBeUndefined();
        }
    });

    it('should reject invalid formatting tokens', () => {
        expect(
            getAvailableDaysSchema.safeParse({ serviceId: 'not-a-uuid', month: '2026-05' }).success
        ).toBe(false);
        expect(
            getAvailableDaysSchema.safeParse({ serviceId: VALID_SERVICE_ID, month: '2026/05' })
                .success
        ).toBe(false);
        expect(
            getAvailableDaysSchema.safeParse({ serviceId: VALID_SERVICE_ID, month: 'may-2026' })
                .success
        ).toBe(false);
    });
});

describe('getAvailableDaysResponseSchema', () => {
    it('should validate a correct payload with empty or filled available dates lists', () => {
        expect(
            getAvailableDaysResponseSchema.safeParse({
                month: '2026-05',
                serviceId: VALID_SERVICE_ID,
                availableDates: [],
            }).success
        ).toBe(true);

        expect(
            getAvailableDaysResponseSchema.safeParse({
                month: '2026-05',
                serviceId: VALID_SERVICE_ID,
                availableDates: ['2026-05-01', '2026-05-15', '2026-05-28'],
            }).success
        ).toBe(true);
    });

    it('should reject malformed date arrays inside response mapping boundaries', () => {
        expect(
            getAvailableDaysResponseSchema.safeParse({
                month: '2026-05',
                serviceId: VALID_SERVICE_ID,
                availableDates: ['05-28-2026'], // Wrong format structure
            }).success
        ).toBe(false);
    });
});

// ==========================================
// 2. DAILY TIMESLOT AVAILABILITY TESTS
// ==========================================

describe('getAvailableTimeSlotsSchema', () => {
    it('should validate typical valid input with Any Doctor (no doctorId) for a specific day', () => {
        expect(
            getAvailableTimeSlotsSchema.safeParse({
                serviceId: VALID_SERVICE_ID,
                date: '2026-05-28',
            }).success
        ).toBe(true);
    });

    it('should validate typical valid input with Specific Doctor', () => {
        expect(
            getAvailableTimeSlotsSchema.safeParse({
                serviceId: VALID_SERVICE_ID,
                doctorId: VALID_DOCTOR_ID,
                date: '2026-05-28',
            }).success
        ).toBe(true);
    });

    it('should reject invalid UUID or invalid date tokens', () => {
        expect(
            getAvailableTimeSlotsSchema.safeParse({ serviceId: 'not-a-uuid', date: '2026-05-28' })
                .success
        ).toBe(false);
        expect(
            getAvailableTimeSlotsSchema.safeParse({
                serviceId: VALID_SERVICE_ID,
                doctorId: 'invalid-doc',
                date: '2026-05-28',
            }).success
        ).toBe(false);
        expect(
            getAvailableTimeSlotsSchema.safeParse({
                serviceId: VALID_SERVICE_ID,
                date: '28-05-2026',
            }).success
        ).toBe(false);
    });
});

describe('getAvailableTimeSlotsResponseSchema', () => {
    it('should validate an empty slots array when a clinic day has no availability', () => {
        expect(
            getAvailableTimeSlotsResponseSchema.safeParse({
                date: '2026-05-28',
                serviceId: VALID_SERVICE_ID,
                availableSlots: [],
            }).success
        ).toBe(true);
    });

    it('should validate correctly formatted output details with matching slots information', () => {
        expect(
            getAvailableTimeSlotsResponseSchema.safeParse({
                date: '2026-05-28',
                serviceId: VALID_SERVICE_ID,
                availableSlots: [
                    {
                        startTime: '2026-05-28T09:00:00Z',
                        endTime: '2026-05-28T09:30:00Z',
                        doctorId: VALID_DOCTOR_ID,
                        doctorName: 'Dr. Samson',
                    },
                ],
            }).success
        ).toBe(true);
    });
});
