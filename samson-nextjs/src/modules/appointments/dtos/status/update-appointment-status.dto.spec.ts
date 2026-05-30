import { describe, expect, it } from 'vitest';
import {
    staffUpdateAppointmentStatusSchema,
    userUpdateAppointmentStatusSchema,
} from './update-appointment-status.dto';

const VALID_APPOINTMENT_ID = '123e4567-e89b-12d3-a456-426614174000';
const VALID_DOCTOR_ID = '823e4567-e89b-12d3-a456-426614174001';

// ==========================================
// USER ACTION SCHEMA TESTS
// ==========================================
describe('userUpdateAppointmentStatusSchema', () => {
    const baseValidData = { appointmentId: VALID_APPOINTMENT_ID };

    it('should validate user CANCELLED status with reason', () => {
        expect(
            userUpdateAppointmentStatusSchema.safeParse({
                ...baseValidData,
                status: 'CANCELLED',
                statusReason: 'I cannot make it anymore.',
            }).success
        ).toBe(true);
    });

    it('should reject user CANCELLED status without reason', () => {
        expect(
            userUpdateAppointmentStatusSchema.safeParse({
                ...baseValidData,
                status: 'CANCELLED',
            }).success
        ).toBe(false);
    });

    it('should reject user CANCELLED status if reason is only whitespace strings', () => {
        expect(
            userUpdateAppointmentStatusSchema.safeParse({
                ...baseValidData,
                status: 'CANCELLED',
                statusReason: '     ',
            }).success
        ).toBe(false);
    });
});

// ==========================================
// STAFF ACTION SCHEMA TESTS
// ==========================================
describe('staffUpdateAppointmentStatusSchema', () => {
    const baseValidData = { appointmentId: VALID_APPOINTMENT_ID };

    it('should allow staff APPROVED status without a reason', () => {
        expect(
            staffUpdateAppointmentStatusSchema.safeParse({ ...baseValidData, status: 'APPROVED' })
                .success
        ).toBe(true);
    });

    it('should transform empty string optional reason to undefined values cleanly', () => {
        const result = staffUpdateAppointmentStatusSchema.safeParse({
            ...baseValidData,
            status: 'APPROVED',
            statusReason: '', // Passed by an empty form input
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.statusReason).toBeUndefined();
        }
    });

    it('should reject staff CANCELLED without a reason', () => {
        const result = staffUpdateAppointmentStatusSchema.safeParse({
            ...baseValidData,
            status: 'CANCELLED',
        });
        expect(result.success).toBe(false);
    });

    it('should reject staff CANCELLED if reason resolves to an empty form string conversion', () => {
        const result = staffUpdateAppointmentStatusSchema.safeParse({
            ...baseValidData,
            status: 'CANCELLED',
            statusReason: '',
        });
        expect(result.success).toBe(false);
    });

    it('should allow staff CANCELLED with a reason', () => {
        expect(
            staffUpdateAppointmentStatusSchema.safeParse({
                ...baseValidData,
                status: 'CANCELLED',
                statusReason: 'Patient called to cancel',
            }).success
        ).toBe(true);
    });

    it('should validate direct reschedule with complete metadata including doctor assignment', () => {
        expect(
            staffUpdateAppointmentStatusSchema.safeParse({
                ...baseValidData,
                status: 'APPROVED',
                newDate: '2026-06-01',
                newStartTime: '2026-06-01T09:00:00Z',
                newEndTime: '2026-06-01T10:00:00Z',
                newDoctorId: VALID_DOCTOR_ID,
            }).success
        ).toBe(true);
    });

    it('should reject direct reschedule if missing metadata fields like doctor assignments', () => {
        const result = staffUpdateAppointmentStatusSchema.safeParse({
            ...baseValidData,
            status: 'APPROVED',
            newDate: '2026-06-01',
            newStartTime: '2026-06-01T09:00:00Z',
            newEndTime: '2026-06-01T10:00:00Z',
        });
        expect(result.success).toBe(false);
    });

    it('should reject direct reschedule if start time is equal to or after end time', () => {
        const result = staffUpdateAppointmentStatusSchema.safeParse({
            ...baseValidData,
            status: 'APPROVED',
            newDate: '2026-06-01',
            newStartTime: '2026-06-01T10:00:00Z',
            newEndTime: '2026-06-01T09:00:00Z',
            newDoctorId: VALID_DOCTOR_ID,
        });
        expect(result.success).toBe(false);
    });
});
