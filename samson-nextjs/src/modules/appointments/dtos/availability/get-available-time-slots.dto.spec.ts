import { describe, expect, it } from 'vitest';
import {
  getAvailableTimeSlotsSchema,
  getAvailableTimeSlotsResponseSchema,
} from './get-available-time-slots.dto';

const VALID_SERVICE_ID = '123e4567-e89b-12d3-a456-426614174000';
const VALID_DOCTOR_ID = '823e4567-e89b-12d3-a456-426614174001';

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
