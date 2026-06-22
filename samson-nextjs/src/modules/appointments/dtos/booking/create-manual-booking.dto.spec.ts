import { describe, it, expect } from 'vitest';
import { createManualBookingSchema } from './create-manual-booking.dto';

describe('createManualBookingSchema Validation', () => {
  const basePayload = {
    serviceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
    doctorId: '5f89c670-8b1e-4505-8854-3e9a593e82d1',
    date: '2026-06-25',
    startTime: '2026-06-25T10:00:00.000Z',
    endTime: '2026-06-25T10:30:00.000Z',
    patientNote: 'Urgently needs checkup',
    statusReason: 'Call-in request',
  };

  it('should accept valid linked account payload', () => {
    const payload = {
      ...basePayload,
      patientId: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
    };
    expect(createManualBookingSchema.safeParse(payload).success).toBe(true);
  });

  it('should accept valid guest payload with no email', () => {
    const payload = {
      ...basePayload,
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
    };
    expect(createManualBookingSchema.safeParse(payload).success).toBe(true);
  });

  it('should accept valid guest payload with email', () => {
    const payload = {
      ...basePayload,
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      email: 'john.doe@example.com',
    };
    expect(createManualBookingSchema.safeParse(payload).success).toBe(true);
  });

  it('should reject guest payload with missing required fields', () => {
    const payload = {
      ...basePayload,
      firstName: '',
      lastName: 'Doe',
      phoneNumber: '',
    };
    const result = createManualBookingSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email format if provided', () => {
    const payload = {
      ...basePayload,
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      email: 'not-an-email',
    };
    const result = createManualBookingSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should reject chronological violation', () => {
    const payload = {
      ...basePayload,
      patientId: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      startTime: '2026-06-25T10:30:00.000Z',
      endTime: '2026-06-25T10:00:00.000Z',
    };
    const result = createManualBookingSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
