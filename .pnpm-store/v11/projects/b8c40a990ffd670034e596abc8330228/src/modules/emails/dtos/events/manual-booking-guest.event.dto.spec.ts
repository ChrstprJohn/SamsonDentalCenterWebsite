import { describe, it, expect } from 'vitest';
import { manualBookingGuestEventSchema } from './manual-booking-guest.event.dto';

describe('manualBookingGuestEventSchema', () => {
  const validPayload = {
    appointmentId: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
    serviceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
    doctorId: '5f89c670-8b1e-4505-8854-3e9a593e82d1',
    date: '2026-06-25',
    startTime: '2026-06-25T09:00:00Z',
    durationMinutes: 60,
    guestContactId: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc6',
    guestName: 'Jane Doe',
    guestEmail: 'jane.doe@example.com',
    guestPhone: '+639123456789',
  };

  it('should validate a correct guest manual booking event payload', () => {
    const result = manualBookingGuestEventSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should accept null guestEmail', () => {
    const result = manualBookingGuestEventSchema.safeParse({ ...validPayload, guestEmail: null });
    expect(result.success).toBe(true);
  });

  it('should accept missing guestEmail', () => {
    const { guestEmail: _, ...withoutEmail } = validPayload;
    const result = manualBookingGuestEventSchema.safeParse(withoutEmail);
    expect(result.success).toBe(true);
  });

  it('should reject invalid guestEmail format when provided', () => {
    const result = manualBookingGuestEventSchema.safeParse({ ...validPayload, guestEmail: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUIDs', () => {
    const result = manualBookingGuestEventSchema.safeParse({ ...validPayload, appointmentId: 'invalid-uuid' });
    expect(result.success).toBe(false);
  });

  it('should reject non-positive durationMinutes', () => {
    const result = manualBookingGuestEventSchema.safeParse({ ...validPayload, durationMinutes: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject empty guestName', () => {
    const result = manualBookingGuestEventSchema.safeParse({ ...validPayload, guestName: '' });
    expect(result.success).toBe(false);
  });
});
