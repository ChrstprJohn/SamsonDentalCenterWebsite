import { describe, expect, it } from 'vitest';
import { resolveNoShowSchema } from './resolve-no-show.dto';

describe('resolveNoShowSchema', () => {
  it('validates correct resolve payload', () => {
    const valid = {
      appointmentId: '123e4567-e89b-12d3-a456-426614174000',
      resolution: 'COMPLETED',
      reason: 'Secretary forgot to click check-in',
    };
    expect(resolveNoShowSchema.parse(valid)).toEqual(valid);
  });

  it('fails on invalid resolution type', () => {
    const invalid = {
      appointmentId: '123e4567-e89b-12d3-a456-426614174000',
      resolution: 'INVALID_TYPE',
      reason: 'Forgot check-in',
    };
    expect(() => resolveNoShowSchema.parse(invalid)).toThrow();
  });

  it('fails if reason is too short', () => {
    const invalid = {
      appointmentId: '123e4567-e89b-12d3-a456-426614174000',
      resolution: 'CONFIRMED_NO_SHOW',
      reason: 'no',
    };
    expect(() => resolveNoShowSchema.parse(invalid)).toThrow();
  });
});
