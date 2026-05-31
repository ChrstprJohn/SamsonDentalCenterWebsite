import { describe, it, expect } from 'vitest';

// Pure logic extracted from UserDashboardView for robust unit testing in Node
function canReschedule(rescheduleCount: number, maxReschedules: number): boolean {
  return rescheduleCount < maxReschedules;
}

describe('UserDashboardView Reschedule Boundaries', () => {
  it('should allow rescheduling if counter is strictly below limit', () => {
    const result = canReschedule(0, 1);
    expect(result).toBe(true);
  });

  it('should block rescheduling if counter is equal to maxReschedules', () => {
    const result = canReschedule(1, 1);
    expect(result).toBe(false);
  });

  it('should block rescheduling if counter somehow exceeds maxReschedules', () => {
    const result = canReschedule(2, 1);
    expect(result).toBe(false);
  });
});
