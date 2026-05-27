import { describe, it, expect } from 'vitest';
import { createStaffSchema } from './create-staff.dto';

describe('createStaffSchema (Unit Test)', () => {
  it('should successfully validate a correct payload', () => {
    const validData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@samson.com',
      role: 'DOCTOR',
      phoneNumber: '+19876543210',
    };

    const result = createStaffSchema.safeParse(validData);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

it('should fail if an invalid role is provided', () => {
    const invalidData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@samson.com',
      role: 'JANITOR', 
      phoneNumber: '+19876543210'
    };

    const result = createStaffSchema.safeParse(invalidData);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      // Check that the error occurred on the 'role' field
      expect(result.error.issues[0].path).toContain('role');
    }
  });
  it('should fail if the phone number format is invalid', () => {
    const invalidPhoneData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@samson.com',
      role: 'SECRETARY',
      phoneNumber: '123-invalid' // Fails regex
    };

    const result = createStaffSchema.safeParse(invalidPhoneData);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Invalid phone number format');
    }
  });
});