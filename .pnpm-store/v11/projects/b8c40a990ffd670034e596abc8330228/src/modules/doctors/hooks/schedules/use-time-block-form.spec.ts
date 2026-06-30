import { describe, it, expect, vi } from 'vitest';
import { timeBlockFormSchema } from './use-time-block-form';

describe('timeBlockFormSchema (Unit Test)', () => {
  const validUuid = '11111111-1111-1111-8111-111111111111';

  it('should successfully validate valid clinic-wide time blocks', () => {
    const validData = {
      scope: 'CLINIC' as const,
      date: '2026-07-04',
      startTime: '08:00',
      endTime: '17:00',
      isAllDay: false,
      reason: 'Independence Day Holiday',
    };

    const parsed = timeBlockFormSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it('should successfully validate valid doctor-specific time blocks', () => {
    const validData = {
      scope: 'DOCTOR' as const,
      doctorId: validUuid,
      date: '2026-07-08',
      startTime: '13:00',
      endTime: '16:00',
      isAllDay: false,
      reason: 'Offsite Dental Conference',
    };

    const parsed = timeBlockFormSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it('should fail if doctorId is missing when scope is DOCTOR', () => {
    const invalidData = {
      scope: 'DOCTOR' as const,
      doctorId: null,
      date: '2026-07-08',
      startTime: '13:00',
      endTime: '16:00',
      isAllDay: false,
      reason: 'Offsite Dental Conference',
    };

    const parsed = timeBlockFormSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issue = parsed.error.issues.find((i) => i.path.includes('doctorId'));
      expect(issue).toBeDefined();
    }
  });

  it('should fail if reason is less than 3 characters', () => {
    const invalidData = {
      scope: 'CLINIC' as const,
      date: '2026-07-04',
      startTime: '08:00',
      endTime: '17:00',
      isAllDay: false,
      reason: 'No',
    };

    const parsed = timeBlockFormSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it('should fail if endTime is before startTime', () => {
    const invalidData = {
      scope: 'CLINIC' as const,
      date: '2026-07-04',
      startTime: '17:00',
      endTime: '08:00',
      isAllDay: false,
      reason: 'Vacation',
    };

    const parsed = timeBlockFormSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });
});
