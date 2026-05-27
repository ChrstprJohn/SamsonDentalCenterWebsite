import { describe, it, expect } from 'vitest';
import { formatClinicDate, formatClinicTime } from './date.util';

describe('Date Utilities', () => {
  it('formats a date object correctly', () => {
    const date = new Date('2026-05-27T10:00:00Z');
    // Note: This test implies standard timezone is handled by Intl, but in testing we ensure it returns a string
    const formatted = formatClinicDate(date);
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('2026');
  });

  it('formats a date string correctly', () => {
    const formatted = formatClinicDate('2026-10-31T00:00:00Z');
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('2026');
  });

  it('formats time correctly', () => {
    const date = new Date('2026-05-27T14:30:00'); // Local time dependent
    const formatted = formatClinicTime(date);
    expect(typeof formatted).toBe('string');
    expect(formatted).toMatch(/AM|PM/i);
  });
});
