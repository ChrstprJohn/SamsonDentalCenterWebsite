import { describe, it, expect } from 'vitest';
import { staffProfileSchema, mapStaffProfile } from './staff-profile.dto';

describe('StaffProfileDto', () => {
  it('should map and validate correctly', () => {
    const record = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'DOCTOR'
    };
    
    const mapped = mapStaffProfile(record);
    expect(mapped.firstName).toBe('John');
    
    const result = staffProfileSchema.safeParse(mapped);
    expect(result.success).toBe(true);
  });

  it('should map and validate with missing optional fields', () => {
    const record = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      first_name: 'John',
      last_name: 'Doe',
      role: 'SECRETARY'
    };
    
    const mapped = mapStaffProfile(record);
    const result = staffProfileSchema.safeParse(mapped);
    expect(result.success).toBe(true);
  });
});
