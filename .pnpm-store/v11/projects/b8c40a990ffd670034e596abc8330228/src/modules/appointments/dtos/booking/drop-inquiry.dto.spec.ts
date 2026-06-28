import { describe, it, expect } from 'vitest';
import { dropInquirySchema } from './drop-inquiry.dto';

describe('dropInquirySchema', () => {
  it('should validate a correct drop inquiry payload', () => {
    const validPayload = {
      inquiryId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd5',
      secretaryNotes: 'Could not reach guest after multiple calls.',
    };

    const result = dropInquirySchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('should allow optional/empty secretary notes', () => {
    const validPayload = {
      inquiryId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd5',
      secretaryNotes: '',
    };

    const result = dropInquirySchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.secretaryNotes).toBeUndefined();
    }
  });

  it('should reject invalid UUID inquiryId', () => {
    const invalidPayload = {
      inquiryId: 'not-a-uuid',
    };

    const result = dropInquirySchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
