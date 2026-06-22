import { describe, it, expect } from 'vitest';
import { manualBookingPatientEventSchema } from './manual-booking-patient.event.dto';

describe('manualBookingPatientEventSchema', () => {
  const validPayload = {
    appointmentId: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
    patientId: 'a1b07384-d113-4ec2-a5e6-ec083b0f5cc2',
    serviceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
    doctorId: '5f89c670-8b1e-4505-8854-3e9a593e82d1',
    date: '2026-06-25',
    startTime: '2026-06-25T09:00:00Z',
    durationMinutes: 60,
  };

  it('should validate a correct patient manual booking event payload', () => {
    const result = manualBookingPatientEventSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUIDs', () => {
    const result = manualBookingPatientEventSchema.safeParse({ ...validPayload, patientId: 'invalid-uuid' });
    expect(result.success).toBe(false);
  });

  it('should reject non-positive durationMinutes', () => {
    const result = manualBookingPatientEventSchema.safeParse({ ...validPayload, durationMinutes: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const { patientId: _, ...withoutPatient } = validPayload;
    const result = manualBookingPatientEventSchema.safeParse(withoutPatient);
    expect(result.success).toBe(false);
  });
});
