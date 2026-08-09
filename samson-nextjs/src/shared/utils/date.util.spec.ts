import { describe, it, expect } from 'vitest';
import { formatClinicDate, formatClinicTime, formatTimeString, calculateEndTime, formatShortDate, formatRelativeDay, getTodayLocalDateStr } from './date.util';

describe('Date Utilities', () => {
  it('formats a date object correctly', () => {
    const date = new Date('2026-05-27T10:00:00Z');
    const formatted = formatClinicDate(date);
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('2026');
  });

  it('formats a date string correctly', () => {
    const formatted = formatClinicDate('2026-10-31T00:00:00Z');
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('2026');
  });

  it('formats ISO time string correctly', () => {
    const formatted = formatClinicTime('2026-05-27T14:30:00Z');
    expect(formatted).toBe('2:30 PM');
  });

  it('formats ISO time string with timezone offset correctly', () => {
    const formatted = formatClinicTime('2026-06-22T14:00:00+08:00');
    expect(formatted).toBe('2:00 PM');
  });

  it('formats bare 24h time strings correctly without timezone drift', () => {
    expect(formatClinicTime('14:00:00')).toBe('2:00 PM');
    expect(formatClinicTime('09:00')).toBe('9:00 AM');
    expect(formatClinicTime('00:30')).toBe('12:30 AM');
    expect(formatClinicTime('12:00')).toBe('12:00 PM');
  });

  it('preserves already formatted AM/PM time strings', () => {
    expect(formatClinicTime('2:00 PM – 2:45 PM')).toBe('2:00 PM – 2:45 PM');
    expect(formatClinicTime('9:00 AM')).toBe('9:00 AM');
  });

  it('calculates end time accurately', () => {
    expect(calculateEndTime('09:00', 30)).toBe('09:30');
    expect(calculateEndTime('14:00:00', 45)).toBe('14:45');
  });

  it('formats short date correctly', () => {
    expect(formatShortDate('2026-06-22')).toBe('Jun 22, 2026');
  });

  it('formats relative day from today', () => {
    const today = getTodayLocalDateStr();
    const day = (offset: number) => {
      const d = new Date(today + 'T00:00:00Z');
      d.setUTCDate(d.getUTCDate() + offset);
      return d.toISOString().slice(0, 10);
    };
    expect(formatRelativeDay(day(0))).toBe('Today');
    expect(formatRelativeDay(day(1))).toBe('Tomorrow');
    expect(formatRelativeDay(day(3))).toBe('in 3d');
    expect(formatRelativeDay(day(30))).toBe('in 30d');
    expect(formatRelativeDay(day(31))).toBe('');
    expect(formatRelativeDay(day(-1))).toBe('Yesterday');
    expect(formatRelativeDay(day(-3))).toBe('3 days ago');
    expect(formatRelativeDay('')).toBe('');
    expect(formatRelativeDay('not-a-date')).toBe('');
  });
});
