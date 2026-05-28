import { describe, it, expect } from 'vitest';
import { getClinicAppointmentsSchema } from './get-clinic-appointments.dto';

const VALID_DOCTOR_ID = '22222222-2222-4222-a222-222222222222';

describe('getClinicAppointmentsSchema', () => {
  it('should pass with no filters (all optional)', () => {
    const result = getClinicAppointmentsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should pass with a valid date, status, and doctorId', () => {
    const result = getClinicAppointmentsSchema.safeParse({
      date: '2024-12-25',
      status: 'APPROVED',
      doctorId: VALID_DOCTOR_ID,
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      date: '2024-12-25',
      status: 'APPROVED',
      doctorId: VALID_DOCTOR_ID,
    });
  });

  it('should reject an invalid date format', () => {
    const result = getClinicAppointmentsSchema.safeParse({ date: '25-12-2024' });
    expect(result.success).toBe(false);
  });

  it('should reject a non-UUID doctorId', () => {
    const result = getClinicAppointmentsSchema.safeParse({ doctorId: 'not-a-uuid' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Invalid Doctor ID format');
  });

  it('should convert empty string date to undefined', () => {
    const result = getClinicAppointmentsSchema.safeParse({ date: '' });
    expect(result.success).toBe(true);
    expect(result.data?.date).toBeUndefined();
  });

  it('should convert empty string doctorId to undefined', () => {
    const result = getClinicAppointmentsSchema.safeParse({ doctorId: '' });
    expect(result.success).toBe(true);
    expect(result.data?.doctorId).toBeUndefined();
  });

  it('should trim whitespace from status', () => {
    const result = getClinicAppointmentsSchema.safeParse({ status: '  PENDING  ' });
    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('PENDING');
  });
});
