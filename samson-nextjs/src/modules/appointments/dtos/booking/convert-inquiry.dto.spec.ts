import { describe, it, expect } from 'vitest';
import { convertInquirySchema } from './convert-inquiry.dto';

describe('convertInquirySchema Validation', () => {
  it('should accept valid parameters', () => {
    const payload = {
      inquiryId: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      serviceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      doctorId: '5f89c670-8b1e-4505-8854-3e9a593e82d1',
      date: '2026-06-25',
      startTime: '10:00',
      endTime: '10:30',
      patientNote: 'Urgently needs checkup',
      secretaryNotes: 'Confirmed by phone call',
    };
    expect(convertInquirySchema.safeParse(payload).success).toBe(true);
  });

  it('should reject chronological violation', () => {
    const payload = {
      inquiryId: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      serviceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      doctorId: '5f89c670-8b1e-4505-8854-3e9a593e82d1',
      date: '2026-06-25',
      startTime: '10:30',
      endTime: '10:00',
    };
    const result = convertInquirySchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
