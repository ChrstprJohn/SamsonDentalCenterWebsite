import { describe, it, expect } from 'vitest';
import { patientProfileSchema, mapPatientProfile } from './patient-profile.dto';

describe('PatientProfileDto', () => {
  it('should map and validate correctly', () => {
    const record = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'patient@example.com',
      first_name: 'Jane',
      last_name: 'Doe',
      phone: '1234567890',
      date_of_birth: '1990-01-01'
    };
    
    const mapped = mapPatientProfile(record);
    expect(mapped.firstName).toBe('Jane');
    expect(mapped.phoneNumber).toBe('1234567890');
    
    const result = patientProfileSchema.safeParse(mapped);
    expect(result.success).toBe(true);
  });

  it('should map and validate with missing optional fields', () => {
    const record = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'patient@example.com',
      first_name: 'Jane',
      last_name: 'Doe',
      phone_number: '1234567890',
      dateOfBirth: '1990-01-01'
    };
    
    const mapped = mapPatientProfile(record);
    const result = patientProfileSchema.safeParse(mapped);
    expect(result.success).toBe(true);
  });
});
