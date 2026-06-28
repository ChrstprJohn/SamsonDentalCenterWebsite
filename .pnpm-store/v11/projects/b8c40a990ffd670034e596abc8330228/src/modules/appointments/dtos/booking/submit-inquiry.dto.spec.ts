import { describe, it, expect } from 'vitest';
import { submitInquirySchema, inquiryResponseSchema } from './submit-inquiry.dto';

describe('submitInquirySchema Validation', () => {
  it('should accept valid guest details', () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+639171234567',
      email: 'john.doe@example.com',
      preferredServiceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      preferredDate: '2026-06-25',
      patientNote: 'Tooth hurts',
    };
    expect(submitInquirySchema.safeParse(payload).success).toBe(true);
  });

  it('should reject invalid emails and phones', () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: 'invalid-phone',
      email: 'not-an-email',
      preferredServiceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      preferredDate: '2026-06-25',
    };
    const result = submitInquirySchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe('inquiryResponseSchema Transform', () => {
  it('should convert DB snake_case payload to Application camelCase', () => {
    const rawDbData = {
      id: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '+639171234567',
      email: 'john.doe@example.com',
      preferred_service_id: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      preferred_date: '2026-06-25',
      status: 'NEW',
      created_at: '2026-06-22T04:00:00Z',
      updated_at: '2026-06-22T04:00:00Z',
    };

    const transformed = inquiryResponseSchema.parse(rawDbData);
    expect(transformed.firstName).toBe('John');
    expect(transformed.phoneNumber).toBe('+639171234567');
    expect(transformed.preferredServiceId).toBe('b3b07384-d113-4ec2-a5e6-ec083b0f5cc1');
  });
});
