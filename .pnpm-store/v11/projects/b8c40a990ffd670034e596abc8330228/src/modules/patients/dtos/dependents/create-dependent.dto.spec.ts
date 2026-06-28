import { describe, it, expect } from 'vitest';
import { createDependentSchema } from './create-dependent.dto';

describe('CreateDependentDto', () => {
  it('should validate valid data', () => {
    const data = {
      patientId: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '2010-05-15',
      relationship: 'CHILD',
    };
    const result = createDependentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should fail on invalid relationship', () => {
    const result = createDependentSchema.safeParse({
      patientId: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '2010-05-15',
      relationship: 'FRIEND',
    });
    expect(result.success).toBe(false);
  });
});
