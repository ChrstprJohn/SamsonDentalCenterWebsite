import { describe, it, expect } from 'vitest';
import { getAppointmentByIdSchema } from './get-appointment-by-id.dto';

describe('getAppointmentByIdSchema', () => {
  it('validates a correct UUID', () => {
    const valid = 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1';
    const result = getAppointmentByIdSchema.safeParse({ appointmentId: valid });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid UUID', () => {
    const invalid = 'not-a-uuid';
    const result = getAppointmentByIdSchema.safeParse({ appointmentId: invalid });
    expect(result.success).toBe(false);
  });
});
