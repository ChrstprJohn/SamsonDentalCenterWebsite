import { describe, expect, it } from 'vitest';
import { submitTreatmentSchema } from './submit-treatment.dto';

describe('submitTreatmentSchema', () => {
  it('accepts valid treatment submission data', () => {
    const result = submitTreatmentSchema.safeParse({
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      actualServices: [
        { serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3', comment: 'Suspected cavity' },
        { serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4', comment: null },
      ],
      clinicalNotes: 'Routine cleaning and filling on upper right molar',
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty actual services', () => {
    const result = submitTreatmentSchema.safeParse({
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      actualServices: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid UUIDs', () => {
    const result = submitTreatmentSchema.safeParse({
      appointmentId: 'invalid-uuid',
      actualServices: [{ serviceId: 'invalid-uuid-2' }],
    });

    expect(result.success).toBe(false);
  });
});
