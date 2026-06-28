import { describe, it, expect } from 'vitest';
import { dependentProfileSchema, mapDependentProfile } from './dependent-profile.dto';

describe('DependentProfileDto', () => {
  it('should map and validate', () => {
    const record = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      patient_id: '123e4567-e89b-12d3-a456-426614174000',
      first_name: 'Jane',
      last_name: 'Doe',
      date_of_birth: '2010-05-15',
      relationship: 'CHILD',
    };
    const mapped = mapDependentProfile(record);
    expect(mapped.firstName).toBe('Jane');
    expect(mapped.relationship).toBe('CHILD');
    
    const result = dependentProfileSchema.safeParse(mapped);
    expect(result.success).toBe(true);
  });
});
