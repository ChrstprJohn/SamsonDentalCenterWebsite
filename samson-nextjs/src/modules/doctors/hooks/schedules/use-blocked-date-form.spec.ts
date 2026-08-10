import { describe, it, expect } from 'vitest';
import { blockedDateFormSchema } from './use-blocked-date-form';

describe('blockedDateFormSchema (Unit Test)', () => {
  it('should validate a valid blocked date', () => {
    const validData = {
      date: '2026-12-25',
      reason: 'Christmas Holiday',
    };

    const parsed = blockedDateFormSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it('should fail if reason is less than 3 characters', () => {
    const invalidData = {
      date: '2026-12-25',
      reason: 'No',
    };

    const parsed = blockedDateFormSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it('should fail on an invalid date', () => {
    const invalidData = {
      date: '12-25-2026',
      reason: 'Holiday',
    };

    const parsed = blockedDateFormSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });
});
