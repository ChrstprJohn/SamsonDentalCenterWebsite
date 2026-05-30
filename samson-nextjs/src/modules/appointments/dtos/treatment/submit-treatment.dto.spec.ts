import { describe, expect, it } from 'vitest';
import { submitTreatmentSchema } from './submit-treatment.dto';

describe('submitTreatmentSchema', () => {
  it('accepts valid treatment submission data', () => {
    const result = submitTreatmentSchema.safeParse({
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      actualServiceIds: ['da95a63c-333e-4b68-98e3-82bdf1a07bd3', 'da95a63c-333e-4b68-98e3-82bdf1a07bd4'],
      clinicalNotes: 'Routine cleaning and filling on upper right molar',
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty actual service IDs', () => {
    const result = submitTreatmentSchema.safeParse({
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      actualServiceIds: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid UUIDs', () => {
    const result = submitTreatmentSchema.safeParse({
      appointmentId: 'invalid-uuid',
      actualServiceIds: ['invalid-uuid-2'],
    });

    expect(result.success).toBe(false);
  });
});
