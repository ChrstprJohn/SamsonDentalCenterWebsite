import { expect, it } from 'vitest';
import { DEFAULT_FOLLOW_UP_FILTERS as defaults, followUpDateRange, matchesFollowUpFilters, parseFollowUpFilters } from './follow-up-filters';

it('uses Philippine midnight and an exclusive next-day boundary', () => {
  const filters = { ...defaults, period: 'TODAY' as const };
  const now = new Date('2026-10-13T16:01:00Z');
  expect(followUpDateRange(filters, now)).toEqual({ from: '2026-10-14T00:00:00+08:00', to: '2026-10-15T00:00:00+08:00' });
  const row = { status: 'COMPLETED', createdAt: '2026-10-13T16:00:00Z', updatedAt: null };
  expect(matchesFollowUpFilters(row, filters, now)).toBe(true);
  expect(matchesFollowUpFilters({ ...row, createdAt: '2026-10-14T16:00:00Z' }, filters, now)).toBe(false);
});

it('includes seven calendar days and starts this month at its first day', () => {
  const now = new Date('2026-10-02T00:00:00Z');
  expect(followUpDateRange({ ...defaults, period: 'WEEK' }, now)?.from).toBe('2026-09-26T00:00:00+08:00');
  expect(followUpDateRange({ ...defaults, period: 'MONTH' }, now)?.from).toBe('2026-10-01T00:00:00+08:00');
});

it('includes the whole last day of a custom range', () => {
  const filters = { ...defaults, period: 'RANGE' as const, from: '2026-08-20', to: '2026-08-21' };
  expect(matchesFollowUpFilters({ status: 'COMPLETED', createdAt: '2026-08-21T15:59:59Z', updatedAt: null }, filters)).toBe(true);
  expect(matchesFollowUpFilters({ status: 'COMPLETED', createdAt: '2026-08-21T16:00:00Z', updatedAt: null }, filters)).toBe(false);
});

it('filters cleared separately from no further action and can use updated dates', () => {
  const row = { status: 'COMPLETED', createdAt: '2020-01-01T00:00:00Z', updatedAt: '2026-10-14T02:00:00Z' };
  const now = new Date('2026-10-14T03:00:00Z');
  const filters = { ...defaults, stage: 'COMPLETED' as const, period: 'TODAY' as const, dateField: 'UPDATED' as const };
  expect(matchesFollowUpFilters(row, filters, now)).toBe(true);
  expect(matchesFollowUpFilters(row, { ...filters, dateField: 'REPORTED' }, now)).toBe(false);
  expect(matchesFollowUpFilters({ ...row, status: 'NO_ACTION_NEEDED' }, filters, now)).toBe(false);
  expect(matchesFollowUpFilters({ ...row, updatedAt: null }, filters, now)).toBe(false);
});

it.each([{ from: '2026-02-30', to: '2026-03-01' }, { from: '2026-10-15', to: '2026-10-14' }, { from: '', to: '' }])('ignores invalid URL ranges: %j', dates => {
  expect(parseFollowUpFilters({ stage: 'COMPLETED', period: 'RANGE', ...dates }).period).toBe('ALL');
});

it('defaults unknown filters and accepts real leap days', () => {
  expect(parseFollowUpFilters({ stage: 'unknown', period: ['TODAY'], dateField: 'bad' })).toEqual(defaults);
  expect(parseFollowUpFilters({ period: 'RANGE', from: '2028-02-29', to: '2028-02-29' }).period).toBe('RANGE');
});
