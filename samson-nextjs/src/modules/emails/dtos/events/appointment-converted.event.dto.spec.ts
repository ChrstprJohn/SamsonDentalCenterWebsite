import { describe, it, expect } from 'vitest';
import { appointmentConvertedEventSchema } from './appointment-converted.event.dto';

describe('appointmentConvertedEventSchema', () => {
  const validPayload = {
    appointmentId: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
    serviceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
    doctorId: '5f89c670-8b1e-4505-8854-3e9a593e82d1',
    date: '2026-06-25',
    startTime: '2026-06-25T09:00:00Z',
    durationMinutes: 60,
    inquiryId: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc6',
    guestName: 'Jane Doe',
    guestEmail: 'jane.doe@example.com',
    guestPhone: '09123456789',
  };

  it('should validate a correct appointment converted event payload', () => {
    const result = appointmentConvertedEventSchema.safeParse(validPayload);
    if (!result.success) {
      console.log('VALIDATION ERROR:', JSON.stringify(result.error.format(), null, 2));
    }
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('should reject invalid UUIDs', () => {
    const invalidPayload = {
      ...validPayload,
      appointmentId: 'invalid-uuid',
    };

    const result = appointmentConvertedEventSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email formats', () => {
    const invalidPayload = {
      ...validPayload,
      guestEmail: 'not-an-email',
    };

    const result = appointmentConvertedEventSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should reject non-positive duration', () => {
    const invalidPayload = {
      ...validPayload,
      durationMinutes: 0,
    };

    const result = appointmentConvertedEventSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
