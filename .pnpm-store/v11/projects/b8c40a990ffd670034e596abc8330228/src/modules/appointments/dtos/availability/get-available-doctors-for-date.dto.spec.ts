import { describe, it, expect } from 'vitest';
import { getAvailableDoctorsForDateSchema } from './get-available-doctors-for-date.dto';

describe('getAvailableDoctorsForDateSchema', () => {
  it('should accept valid inputs', () => {
    const payload = {
      date: '2026-06-25',
      serviceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
    };
    expect(getAvailableDoctorsForDateSchema.safeParse(payload).success).toBe(true);
  });

  it('should reject invalid date formats', () => {
    const payload = {
      date: '2026/06/25',
      serviceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
    };
    expect(getAvailableDoctorsForDateSchema.safeParse(payload).success).toBe(false);
  });

  it('should reject non-uuid serviceId', () => {
    const payload = {
      date: '2026-06-25',
      serviceId: 'invalid-id',
    };
    expect(getAvailableDoctorsForDateSchema.safeParse(payload).success).toBe(false);
  });
});
