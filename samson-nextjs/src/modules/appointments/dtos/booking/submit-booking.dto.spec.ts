import { describe, expect, it } from 'vitest';
import { submitBookingSchema } from './submit-booking.dto';

describe('submitBookingSchema', () => {
    const baseValidData = {
        idempotencyKey: '923e4567-e89b-12d3-a456-426614174002',
        serviceId: '123e4567-e89b-12d3-a456-426614174000',
        doctorId: '823e4567-e89b-12d3-a456-426614174001',
        isPreferredDoctor: false,
        date: '2026-05-28',
        startTime: '2026-05-28T09:00:00Z',
        endTime: '2026-05-28T09:30:00Z',
    };

    // ==========================================
    // 1. SELF BOOKING TESTS
    // ==========================================
    it('should validate base valid booking (Self) and default doctorAssignmentSource to SYSTEM', () => {
        const result = submitBookingSchema.safeParse({ ...baseValidData, patientType: 'SELF' });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.doctorAssignmentSource).toBe('SYSTEM');
        }
    });

    it('should validate booking with doctorAssignmentSource set to USER', () => {
        const result = submitBookingSchema.safeParse({
            ...baseValidData,
            patientType: 'SELF',
            doctorAssignmentSource: 'USER',
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.doctorAssignmentSource).toBe('USER');
        }
    });

    it('should reject invalid doctorAssignmentSource value', () => {
        const result = submitBookingSchema.safeParse({
            ...baseValidData,
            patientType: 'SELF',
            doctorAssignmentSource: 'INVALID_SOURCE',
        });
        expect(result.success).toBe(false);
    });

    it('should strip empty optional strings to undefined', () => {
        const result = submitBookingSchema.safeParse({
            ...baseValidData,
            patientType: 'SELF',
            userNote: '', // Passed as empty form string
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.userNote).toBeUndefined();
        }
    });

    // ==========================================
    // 2. EXISTING DEPENDENT TESTS
    // ==========================================
    it('should validate booking for EXISTING_DEPENDENT with dependentId', () => {
        expect(
            submitBookingSchema.safeParse({
                ...baseValidData,
                patientType: 'EXISTING_DEPENDENT',
                dependentId: '723e4567-e89b-12d3-a456-426614174003',
            }).success
        ).toBe(true);
    });

    it('should reject EXISTING_DEPENDENT without dependentId', () => {
        const result = submitBookingSchema.safeParse({
            ...baseValidData,
            patientType: 'EXISTING_DEPENDENT',
        });
        expect(result.success).toBe(false);
    });

    it('should reject EXISTING_DEPENDENT if dependentId is an empty form string', () => {
        const result = submitBookingSchema.safeParse({
            ...baseValidData,
            patientType: 'EXISTING_DEPENDENT',
            dependentId: '',
        });
        expect(result.success).toBe(false); // Triggers refined check since it converts to undefined
    });

    // ==========================================
    // 3. NEW DEPENDENT TESTS
    // ==========================================
    it('should validate valid booking with full dependent fields (NEW_DEPENDENT)', () => {
        expect(
            submitBookingSchema.safeParse({
                ...baseValidData,
                patientType: 'NEW_DEPENDENT',
                dependentFirstName: 'John',
                dependentLastName: 'Doe',
                dependentBirthday: '2010-01-01',
                dependentSex: 'MALE',
                dependentRelationship: 'CHILD',
            }).success
        ).toBe(true);
    });

    it('should reject NEW_DEPENDENT if required block values are only empty whitespace strings', () => {
        const result = submitBookingSchema.safeParse({
            ...baseValidData,
            patientType: 'NEW_DEPENDENT',
            dependentFirstName: '   ', // Trim blocks empty entries
            dependentLastName: 'Doe',
            dependentBirthday: '2010-01-01',
            dependentSex: 'MALE',
            dependentRelationship: 'CHILD',
        });
        expect(result.success).toBe(false);
    });

    // ==========================================
    // 4. CHRONOLOGICAL MATRIX TESTS
    // ==========================================
    it('should reject booking if start time is equal to end time', () => {
        const result = submitBookingSchema.safeParse({
            ...baseValidData,
            patientType: 'SELF',
            startTime: '2026-05-28T09:30:00Z',
            endTime: '2026-05-28T09:30:00Z',
        });
        expect(result.success).toBe(false);
    });

    it('should reject booking if start time is after end time', () => {
        const result = submitBookingSchema.safeParse({
            ...baseValidData,
            patientType: 'SELF',
            startTime: '2026-05-28T10:00:00Z',
            endTime: '2026-05-28T09:30:00Z',
        });
        expect(result.success).toBe(false);
    });
});
